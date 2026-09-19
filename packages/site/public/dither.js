/*
 * Nube de puntos animada de la landing.
 *
 * Vive fuera del bundle a propósito. Un canvas solo necesita su elemento y el
 * CSS aplicado, las dos cosas listas al terminar de parsear el HTML, así que
 * pintarlo no tiene por qué esperar a que baje y ejecute React. Se carga como
 * módulo desde `<head>`, que difiere hasta el parseo y corre antes de
 * `DOMContentLoaded`.
 *
 * Cada lienzo se describe a sí mismo con `data-dither`, `data-cell` y
 * `data-text`; el componente `Dither` solo emite ese marcado.
 */

/* Umbral ordenado de Bayer 4×4. Es lo que convierte un degradado continuo en
   puntos discretos sin recurrir a ruido aleatorio: cada celda se compara contra
   su posición fija en la matriz, así que el patrón queda estable entre frames
   en vez de hervir. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

const POINTER_RADIUS = 0.17;
const GAP_Y = 0.2;

/* El tiempo es uno solo para todos los lienzos y se mide en milisegundos, no en
   cuadros. Contando cuadros, un lienzo que se engancha más tarde empezaría en
   cero y saltaría respecto a los demás, y una pantalla de 120 Hz animaría al
   doble de velocidad. */
const START = performance.now();
const SPEED = 0.00072;
const clock = () => (performance.now() - START) * SPEED;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Posición del puntero, compartida por todos los lienzos. */
let pointer = null;
if (!reducedMotion.matches) {
  document.addEventListener(
    "pointermove",
    (e) => {
      pointer = { x: e.clientX, y: e.clientY };
    },
    { passive: true, capture: true },
  );
}

/**
 * Convierte OKLCH a `rgb()`.
 *
 * El canvas no recibe `oklch()` aunque el tema esté escrito en ese espacio: el
 * soporte llega en Safari 16.4, y cuando un `fillStyle` no se puede parsear la
 * asignación se ignora en silencio y se pinta con el color anterior. La
 * conversión va acá para que el color no dependa de la versión del navegador.
 */
function toRgb(L, C, H) {
  const rad = (H * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  const channel = (v) => {
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(g * 255)));
  };

  return `rgb(${channel(linear[0])}, ${channel(linear[1])}, ${channel(linear[2])})`;
}

/**
 * Rampa de cinco pasos derivada de `--primary`: se le mueve la luminosidad y se
 * conserva el tono. Si el tema cambia el primario, el dither lo sigue solo.
 */
function ramp(chroma, hue, dark) {
  const steps = dark
    ? [
        [0.24, 0.04],
        [0.36, 0.09],
        [0.55, chroma],
        [0.72, 0.1],
        [0.93, 0.02],
      ]
    : [
        [0.86, 0.05],
        [0.72, 0.1],
        [0.55, chroma],
        [0.34, 0.08],
        [0.2, 0.03],
      ];
  return steps.map(([l, c]) => toRgb(l, c, hue));
}

/** Lienzos ya enganchados, para no montarles un segundo bucle encima. */
const started = new WeakSet();

function start(canvas) {
  if (started.has(canvas)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  started.add(canvas);

  const shape = canvas.dataset.dither;
  const side = Number(canvas.dataset.cell) || 9;
  const word = canvas.dataset.text || "ELISE";

  const dark = shape === "dark" || shape === "text";
  const primary = getComputedStyle(canvas).getPropertyValue("--primary");
  const parts = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(primary);
  const chroma = Number(parts?.[2] ?? 0.19);
  const hue = Number(parts?.[3] ?? 262);
  const accent = toRgb(Number(parts?.[1] ?? 0.55), chroma, hue);
  const palette = ramp(chroma, hue, dark);

  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  let infl = 0;
  let over = 0;
  let visible = false;
  let raf = 0;
  let map = null;
  let mapKey = "";

  const resize = () => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (!w || !h) return false;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      map = null;
    }
    return true;
  };

  /* La palabra se rasteriza una sola vez a la resolución de la rejilla, no a la
     del canvas: lo que interesa de cada celda es si cae dentro del trazo, y eso
     es exactamente un píxel del mapa. */
  const textMap = (cols, rows) => {
    const key = `${cols}x${rows}`;
    if (map && mapKey === key) return map;
    const offscreen = document.createElement("canvas");
    offscreen.width = cols;
    offscreen.height = rows;
    const octx = offscreen.getContext("2d");
    if (!octx) return null;
    const family = getComputedStyle(canvas).fontFamily || "sans-serif";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    let size = rows * 1.02;
    octx.font = `700 ${size}px ${family}`;
    const textWidth = octx.measureText(word).width;
    if (textWidth > cols * 0.92) {
      size = (size * (cols * 0.92)) / textWidth;
      octx.font = `700 ${size}px ${family}`;
    }
    octx.fillText(word, cols / 2, rows / 2);
    const data = octx.getImageData(0, 0, cols, rows).data;
    const next = new Float32Array(cols * rows);
    for (let k = 0; k < next.length; k++) next[k] = data[k * 4 + 3] / 255;
    map = next;
    mapKey = key;
    return next;
  };

  const paint = () => {
    const t = clock();
    const w = canvas.width;
    const h = canvas.height;
    const cell = shape === "patch" ? Math.max(3, side - 2) : side;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const sizes = [cell - 2.6, cell - 1.9, cell - 1.1, cell - 0.4, cell];
    const radius = Math.min(w, h) * POINTER_RADIUS * (shape === "patch" ? 2.6 : 1);
    const glyph = shape === "text" ? textMap(cols, rows) : null;

    ctx.clearRect(0, 0, w, h);

    for (let j = 0; j < rows; j++) {
      const y = j * cell;
      const ny = y / h;
      for (let i = 0; i < cols; i++) {
        const x = i * cell;
        const nx = x / w;
        // Cuatro senos desfasados. Sumados no repiten dentro del canvas, que es
        // todo lo que se le pide al ruido acá.
        const n =
          Math.sin(x * 0.013 + t) * 0.5 +
          Math.sin(y * 0.019 - t * 0.7) * 0.3 +
          Math.sin((x + y * 1.4) * 0.009 + t * 1.3) * 0.25 +
          Math.sin((x - y) * 0.021 - t * 0.45) * 0.18;

        let v;
        if (shape === "flow") {
          // Elipse vacía en el centro: el claro donde entra el texto del hero.
          const dx = (nx - 0.5) / 0.44;
          const dy = (ny - GAP_Y) / 0.36;
          let clearing = (Math.hypot(dx, dy) - 0.66) / 0.7;
          clearing = clearing < 0 ? 0 : clearing > 1 ? 1 : clearing;
          clearing = clearing * clearing * (3 - 2 * clearing);
          v = clearing * (0.34 + 0.32 * n + Math.pow(ny, 1.8) * 1.15);
        } else if (shape === "patch") {
          v = 1.16 - Math.hypot(1 - nx, ny) * 1.5 + 0.3 * n;
        } else if (shape === "dark") {
          let gx = (nx - 0.3) / 0.22;
          let gy = (ny - 0.44) / 0.2;
          gx = gx < 0 ? 0 : gx > 1 ? 1 : gx;
          gy = gy < 0 ? 0 : gy > 1 ? 1 : gy;
          let mask = Math.max(gx, gy);
          mask = mask * mask * (3 - 2 * mask);
          v = (0.3 + 0.34 * n + (1 - Math.abs(ny * 2 - 1)) * 0.22) * (0.22 + 0.78 * mask);
        } else {
          const m = glyph ? glyph[j * cols + i] : 0;
          if (m < 0.35) continue;
          v = m * (0.9 + 0.32 * n);
        }

        if (infl > 0.01) {
          const dist = Math.hypot(x - mx, y - my);
          if (dist < radius) {
            const f = 1 - dist / radius;
            const e = f * f * (3 - 2 * f) * infl * (0.95 + 0.4 * Math.sin(dist * 0.045 - t * 4.5));
            v += dark ? e * 0.8 : -e;
          }
        }

        if (v <= (BAYER[(j % 4) * 4 + (i % 4)] / 16) * 0.9) continue;
        const band = v > 1.2 ? 4 : v > 0.98 ? 3 : v > 0.76 ? 2 : v > 0.55 ? 1 : 0;
        // Una de cada cinco celdas de la banda media sale en el primario: es lo
        // único que mete color saturado en la nube.
        ctx.fillStyle = band === 2 && (i * 7 + j * 3) % 5 === 0 ? accent : palette[band];
        ctx.fillRect(x, y, sizes[band], sizes[band]);
      }
    }
  };

  const frame = () => {
    /* Si React reemplazó el nodo, este lienzo ya no está en la página: su bucle
       seguiría corriendo para siempre sobre un elemento que nadie ve. */
    if (!canvas.isConnected) {
      stop();
      io.disconnect();
      ro.disconnect();
      return;
    }
    if (resize()) {
      if (pointer) {
        // En `patch` el área sensible es la tarjeta entera y no el recorte del
        // canvas, que solo ocupa una esquina.
        const box =
          shape === "patch" && canvas.parentElement
            ? canvas.parentElement.getBoundingClientRect()
            : canvas.getBoundingClientRect();
        const rect = canvas.getBoundingClientRect();
        const inside =
          pointer.x >= box.left &&
          pointer.x <= box.right &&
          pointer.y >= box.top &&
          pointer.y <= box.bottom;
        over = inside ? 1 : 0;
        if (inside && rect.width) {
          tx = (pointer.x - rect.left) * (canvas.width / rect.width);
          ty = (pointer.y - rect.top) * (canvas.height / rect.height);
        }
      }
      infl += (over - infl) * 0.09;
      mx += (tx - mx) * 0.16;
      my += (ty - my) * 0.16;
      paint();
    }
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  if (resize()) paint();

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (!visible) {
        stop();
      } else if (reducedMotion.matches) {
        if (resize()) paint();
      } else if (!raf) {
        raf = requestAnimationFrame(frame);
      }
    },
    { rootMargin: "200px" },
  );
  io.observe(canvas);

  /* Repinta en cualquier cambio de tamaño, sin condicionarlo a que el lienzo
     esté visible o quieto. Ajustar `width`/`height` borra el mapa de bits, así
     que saltarse el repintado deja el lienzo en blanco hasta el siguiente
     cuadro, y si el bucle no está corriendo no hay siguiente cuadro. */
  const ro = new ResizeObserver(() => {
    if (resize()) paint();
  });
  ro.observe(canvas);

  // La rejilla del texto se mide contra la fuente cargada; si llega después, el
  // mapa que se calculó con la de respaldo ya no sirve.
  if (shape === "text") {
    void document.fonts?.ready.then(() => {
      map = null;
      if (resize()) paint();
    });
  }
}

const sweep = () => {
  for (const canvas of document.querySelectorAll("canvas[data-dither]")) start(canvas);
};

sweep();

/* React puede descartar el HTML del servidor y montar nodos nuevos si algo no
   reconcilia al hidratar. Los lienzos que pintamos quedan entonces fuera del
   documento y los que ocupan su lugar nacen vacíos, así que el dither aparece y
   se va a los pocos segundos. Observar el árbol los engancha en cuanto entran,
   vengan de la hidratación o de una navegación del router. */
new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches?.("canvas[data-dither]")) start(node);
      else node.querySelectorAll?.("canvas[data-dither]").forEach(start);
    }
  }
}).observe(document.body, { childList: true, subtree: true });
