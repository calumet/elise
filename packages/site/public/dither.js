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

const RADIO_PUNTERO = 0.17;
const HUECO_Y = 0.2;

/* El tiempo es uno solo para todos los lienzos y se mide en milisegundos, no en
   cuadros. Contando cuadros, un lienzo que se engancha más tarde empezaría en
   cero y saltaría respecto a los demás, y una pantalla de 120 Hz animaría al
   doble de velocidad. */
const ARRANQUE = performance.now();
const VELOCIDAD = 0.00072;
const reloj = () => (performance.now() - ARRANQUE) * VELOCIDAD;

const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Posición del puntero, compartida por todos los lienzos. */
let puntero = null;
if (!sinMovimiento.matches) {
  document.addEventListener(
    "pointermove",
    (e) => {
      puntero = { x: e.clientX, y: e.clientY };
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
function aRgb(L, C, H) {
  const rad = (H * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const lineal = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  const canal = (v) => {
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(g * 255)));
  };

  return `rgb(${canal(lineal[0])}, ${canal(lineal[1])}, ${canal(lineal[2])})`;
}

/**
 * Rampa de cinco pasos derivada de `--primary`: se le mueve la luminosidad y se
 * conserva el tono. Si el tema cambia el primario, el dither lo sigue solo.
 */
function rampa(croma, tono, oscuro) {
  const pasos = oscuro
    ? [
        [0.24, 0.04],
        [0.36, 0.09],
        [0.55, croma],
        [0.72, 0.1],
        [0.93, 0.02],
      ]
    : [
        [0.86, 0.05],
        [0.72, 0.1],
        [0.55, croma],
        [0.34, 0.08],
        [0.2, 0.03],
      ];
  return pasos.map(([l, c]) => aRgb(l, c, tono));
}

/** Lienzos ya enganchados, para no montarles un segundo bucle encima. */
const iniciados = new WeakSet();

function iniciar(canvas) {
  if (iniciados.has(canvas)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  iniciados.add(canvas);

  const forma = canvas.dataset.dither;
  const lado = Number(canvas.dataset.cell) || 9;
  const palabra = canvas.dataset.text || "ELISE";

  const oscuro = forma === "dark" || forma === "text";
  const primario = getComputedStyle(canvas).getPropertyValue("--primary");
  const partes = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(primario);
  const croma = Number(partes?.[2] ?? 0.19);
  const tono = Number(partes?.[3] ?? 262);
  const acento = aRgb(Number(partes?.[1] ?? 0.55), croma, tono);
  const paleta = rampa(croma, tono, oscuro);

  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  let infl = 0;
  let sobre = 0;
  let visible = false;
  let raf = 0;
  let mapa = null;
  let claveMapa = "";

  const redimensionar = () => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (!w || !h) return false;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      mapa = null;
    }
    return true;
  };

  /* La palabra se rasteriza una sola vez a la resolución de la rejilla, no a la
     del canvas: lo que interesa de cada celda es si cae dentro del trazo, y eso
     es exactamente un píxel del mapa. */
  const mapaTexto = (cols, filas) => {
    const clave = `${cols}x${filas}`;
    if (mapa && claveMapa === clave) return mapa;
    const fuera = document.createElement("canvas");
    fuera.width = cols;
    fuera.height = filas;
    const octx = fuera.getContext("2d");
    if (!octx) return null;
    const familia = getComputedStyle(canvas).fontFamily || "sans-serif";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    let cuerpo = filas * 1.02;
    octx.font = `700 ${cuerpo}px ${familia}`;
    const ancho = octx.measureText(palabra).width;
    if (ancho > cols * 0.92) {
      cuerpo = (cuerpo * (cols * 0.92)) / ancho;
      octx.font = `700 ${cuerpo}px ${familia}`;
    }
    octx.fillText(palabra, cols / 2, filas / 2);
    const datos = octx.getImageData(0, 0, cols, filas).data;
    const siguiente = new Float32Array(cols * filas);
    for (let k = 0; k < siguiente.length; k++) siguiente[k] = datos[k * 4 + 3] / 255;
    mapa = siguiente;
    claveMapa = clave;
    return siguiente;
  };

  const pintar = () => {
    const t = reloj();
    const w = canvas.width;
    const h = canvas.height;
    const celda = forma === "patch" ? Math.max(3, lado - 2) : lado;
    const cols = Math.ceil(w / celda);
    const filas = Math.ceil(h / celda);
    const tamanos = [celda - 2.6, celda - 1.9, celda - 1.1, celda - 0.4, celda];
    const radio = Math.min(w, h) * RADIO_PUNTERO * (forma === "patch" ? 2.6 : 1);
    const glifo = forma === "text" ? mapaTexto(cols, filas) : null;

    ctx.clearRect(0, 0, w, h);

    for (let j = 0; j < filas; j++) {
      const y = j * celda;
      const ny = y / h;
      for (let i = 0; i < cols; i++) {
        const x = i * celda;
        const nx = x / w;
        // Cuatro senos desfasados. Sumados no repiten dentro del canvas, que es
        // todo lo que se le pide al ruido acá.
        const n =
          Math.sin(x * 0.013 + t) * 0.5 +
          Math.sin(y * 0.019 - t * 0.7) * 0.3 +
          Math.sin((x + y * 1.4) * 0.009 + t * 1.3) * 0.25 +
          Math.sin((x - y) * 0.021 - t * 0.45) * 0.18;

        let v;
        if (forma === "flow") {
          // Elipse vacía en el centro: el claro donde entra el texto del hero.
          const dx = (nx - 0.5) / 0.44;
          const dy = (ny - HUECO_Y) / 0.36;
          let claro = (Math.hypot(dx, dy) - 0.66) / 0.7;
          claro = claro < 0 ? 0 : claro > 1 ? 1 : claro;
          claro = claro * claro * (3 - 2 * claro);
          v = claro * (0.34 + 0.32 * n + Math.pow(ny, 1.8) * 1.15);
        } else if (forma === "patch") {
          v = 1.16 - Math.hypot(1 - nx, ny) * 1.5 + 0.3 * n;
        } else if (forma === "dark") {
          let gx = (nx - 0.3) / 0.22;
          let gy = (ny - 0.44) / 0.2;
          gx = gx < 0 ? 0 : gx > 1 ? 1 : gx;
          gy = gy < 0 ? 0 : gy > 1 ? 1 : gy;
          let queda = Math.max(gx, gy);
          queda = queda * queda * (3 - 2 * queda);
          v = (0.3 + 0.34 * n + (1 - Math.abs(ny * 2 - 1)) * 0.22) * (0.22 + 0.78 * queda);
        } else {
          const m = glifo ? glifo[j * cols + i] : 0;
          if (m < 0.35) continue;
          v = m * (0.9 + 0.32 * n);
        }

        if (infl > 0.01) {
          const dist = Math.hypot(x - mx, y - my);
          if (dist < radio) {
            const f = 1 - dist / radio;
            const e = f * f * (3 - 2 * f) * infl * (0.95 + 0.4 * Math.sin(dist * 0.045 - t * 4.5));
            v += oscuro ? e * 0.8 : -e;
          }
        }

        if (v <= (BAYER[(j % 4) * 4 + (i % 4)] / 16) * 0.9) continue;
        const banda = v > 1.2 ? 4 : v > 0.98 ? 3 : v > 0.76 ? 2 : v > 0.55 ? 1 : 0;
        // Una de cada cinco celdas de la banda media sale en el primario: es lo
        // único que mete color saturado en la nube.
        ctx.fillStyle = banda === 2 && (i * 7 + j * 3) % 5 === 0 ? acento : paleta[banda];
        ctx.fillRect(x, y, tamanos[banda], tamanos[banda]);
      }
    }
  };

  const cuadro = () => {
    /* Si React reemplazó el nodo, este lienzo ya no está en la página: su bucle
       seguiría corriendo para siempre sobre un elemento que nadie ve. */
    if (!canvas.isConnected) {
      detener();
      io.disconnect();
      ro.disconnect();
      return;
    }
    if (redimensionar()) {
      if (puntero) {
        // En `patch` el área sensible es la tarjeta entera y no el recorte del
        // canvas, que solo ocupa una esquina.
        const caja =
          forma === "patch" && canvas.parentElement
            ? canvas.parentElement.getBoundingClientRect()
            : canvas.getBoundingClientRect();
        const rect = canvas.getBoundingClientRect();
        const dentro =
          puntero.x >= caja.left &&
          puntero.x <= caja.right &&
          puntero.y >= caja.top &&
          puntero.y <= caja.bottom;
        sobre = dentro ? 1 : 0;
        if (dentro && rect.width) {
          tx = (puntero.x - rect.left) * (canvas.width / rect.width);
          ty = (puntero.y - rect.top) * (canvas.height / rect.height);
        }
      }
      infl += (sobre - infl) * 0.09;
      mx += (tx - mx) * 0.16;
      my += (ty - my) * 0.16;
      pintar();
    }
    raf = requestAnimationFrame(cuadro);
  };

  const detener = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  if (redimensionar()) pintar();

  const io = new IntersectionObserver(
    (entradas) => {
      visible = entradas.some((e) => e.isIntersecting);
      if (!visible) {
        detener();
      } else if (sinMovimiento.matches) {
        if (redimensionar()) pintar();
      } else if (!raf) {
        raf = requestAnimationFrame(cuadro);
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
    if (redimensionar()) pintar();
  });
  ro.observe(canvas);

  // La rejilla del texto se mide contra la fuente cargada; si llega después, el
  // mapa que se calculó con la de respaldo ya no sirve.
  if (forma === "text") {
    void document.fonts?.ready.then(() => {
      mapa = null;
      if (redimensionar()) pintar();
    });
  }
}

const barrer = () => {
  for (const canvas of document.querySelectorAll("canvas[data-dither]")) iniciar(canvas);
};

barrer();

/* React puede descartar el HTML del servidor y montar nodos nuevos si algo no
   reconcilia al hidratar. Los lienzos que pintamos quedan entonces fuera del
   documento y los que ocupan su lugar nacen vacíos, así que el dither aparece y
   se va a los pocos segundos. Observar el árbol los engancha en cuanto entran,
   vengan de la hidratación o de una navegación del router. */
new MutationObserver((mutaciones) => {
  for (const m of mutaciones) {
    for (const nodo of m.addedNodes) {
      if (nodo.nodeType !== 1) continue;
      if (nodo.matches?.("canvas[data-dither]")) iniciar(nodo);
      else nodo.querySelectorAll?.("canvas[data-dither]").forEach(iniciar);
    }
  }
}).observe(document.body, { childList: true, subtree: true });
