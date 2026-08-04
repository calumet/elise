/**
 * Auditoría visual del showcase.
 *
 * Abre la app en un Chromium headless y comprueba, sobre el DOM ya renderizado,
 * las cosas que un typecheck no ve y una captura no delata a simple vista.
 * Cada chequeo existe porque el defecto que busca se colo de verdad.
 *
 *   pnpm audit:visual                     # contra http://localhost:5173
 *   pnpm audit:visual -- --url=http://…   # contra otra URL
 *   pnpm audit:visual -- --abrir          # además abre cada disparador de panel
 *   pnpm audit:visual -- --anchos=360     # un solo ancho, en vez del barrido
 *   pnpm audit:visual -- --tema=oscuro    # claro | oscuro | ambos
 *
 * Sale con código 1 si hay fallos, para poder colgarlo de CI.
 */

import { chromium } from "playwright";

const args = process.argv.slice(2);
const arg = (nombre, pordefecto) =>
  args
    .find((a) => a.startsWith(`--${nombre}=`))
    ?.split("=")
    .slice(1)
    .join("=") ?? pordefecto;

const URL = arg("url", "http://localhost:5173");
const ABRIR_PANELES = args.includes("--abrir");
const TEMA = arg("tema", "claro"); // claro | oscuro | ambos

/* Lo que se rompe por responsive se rompe donde aprieta, así que auditar solo en
   escritorio no ve nada. Los tres son el estrecho, el borde del breakpoint y el
   ancho cómodo. */
const ANCHOS = arg("anchos", "360,768,1280")
  .split(",")
  .map((n) => Number(n.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);

/* Escalas del sistema. Si cambian en elise.css, cambian aca. */
const RADIOS = [0, 2, 4, 5, 6, 8, 10, 12, 16];
const ICONOS = [12, 14, 16, 20, 24];
const TIPOGRAFIA = [11, 12, 13, 14, 16, 20, 24, 30];

const CHEQUEOS = [
  {
    id: "radios",
    titulo: "Radios fuera de la escala",
    porque: "Un radio suelto delata un valor escrito a mano en vez de un token.",
  },
  {
    id: "iconos",
    titulo: "Iconos fuera de la escala",
    porque: "Un icono a 14.08px cae en medio pixel y se ve borroso sin que se entienda por que.",
  },
  {
    id: "tipografia",
    titulo: "Tamanos de texto fuera de la escala",
    porque: "Un tamano fuera de escala pierde el interlineado y el tracking emparejados.",
  },
  {
    id: "fraccionarios",
    titulo: "Controles en pixeles fraccionarios",
    porque:
      "Con una base de espaciado mal elegida, h-10 mide 35.2px y todo queda fuera de rejilla.",
  },
  {
    id: "anidamiento",
    titulo: "Elementos interactivos anidados",
    porque: "Un <button> dentro de otro es HTML invalido y rompe el foco por teclado.",
  },
  {
    id: "solapamiento",
    titulo: "Controles superpuestos",
    porque: "Dos iconos en la misma esquina se pisan y solo se nota mirando de cerca.",
  },
  {
    id: "hermanos",
    titulo: "Hermanos de una fila que se pisan",
    porque:
      "Dos piezas de la misma fila ocupando el mismo sitio: una se quedo sin ancho y la otra se le monta encima.",
  },
  {
    id: "desborde",
    titulo: "Contenido que se sale de su contenedor",
    porque:
      "Una caja que se quedo en cero sigue pintando lo de dentro, encima de lo que tenga al lado.",
  },
  {
    id: "recorte",
    titulo: "Fondos que desbordan esquinas redondeadas",
    porque: "Un hijo opaco sin recorte pinta un rectangulo sobre la curva del contenedor.",
  },
  {
    id: "alineacion",
    titulo: "Filas desalineadas dentro de una lista",
    porque: "Una fila sin indicador se corre el ancho del icono respecto de las demas.",
  },
  {
    id: "contraste",
    titulo: "Contraste por debajo de WCAG AA",
    porque: "El tema declara cumplir 4.5:1; conviene comprobarlo y no confiar.",
  },
];

/* ------------------------------------------------------------------ *
 * Sonda: corre dentro de la página
 * ------------------------------------------------------------------ */

const sonda = () => {
  const fallos = [];
  const RADIOS = window.__RADIOS;
  const ICONOS = window.__ICONOS;
  const TIPOGRAFIA = window.__TIPOGRAFIA;

  const ruta = (el) => {
    const partes = [];
    for (let n = el; n && n !== document.body && partes.length < 4; n = n.parentElement) {
      const slot = n.dataset?.slot;
      partes.unshift(slot ? `[${slot}]` : n.tagName.toLowerCase());
    }
    return partes.join(" > ");
  };

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0";
  };

  const anota = (chequeo, el, detalle) => fallos.push({ chequeo, ruta: ruta(el), detalle });

  const todos = [...document.querySelectorAll("*")].filter(visible);

  /* --- radios --- */
  for (const el of todos) {
    const cs = getComputedStyle(el);
    for (const bruto of [cs.borderTopLeftRadius, cs.borderBottomRightRadius]) {
      if (!bruto || bruto.includes("%")) continue;
      const px = parseFloat(bruto);
      if (!Number.isFinite(px) || px === 0) continue;
      if (px >= 100) continue; // rounded-full
      if (!RADIOS.includes(Math.round(px * 100) / 100)) {
        anota("radios", el, `${bruto} no esta en la escala`);
        break;
      }
    }
  }

  /* --- iconos --- */
  for (const svg of document.querySelectorAll("svg")) {
    if (!visible(svg)) continue;
    const r = svg.getBoundingClientRect();
    const w = Math.round(r.width * 100) / 100;
    const h = Math.round(r.height * 100) / 100;
    /* Los iconos decorativos que escalan con su caja (logos, ilustraciones)
       quedan fuera, ya que solo se auditan los que declaran un tamano fijo. */
    if (Math.abs(w - h) > 1) continue;
    if (w > 48) continue;
    if (!ICONOS.includes(Math.round(w))) anota("iconos", svg, `${w}x${h}px`);
    else if (!Number.isInteger(w)) anota("iconos", svg, `${w}px, no entero`);
  }

  /* --- tipografía --- */
  for (const el of todos) {
    if (!el.childNodes.length) continue;
    const tieneTextoPropio = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim(),
    );
    if (!tieneTextoPropio) continue;
    const px = Math.round(parseFloat(getComputedStyle(el).fontSize) * 100) / 100;
    if (!TIPOGRAFIA.includes(Math.round(px))) anota("tipografia", el, `${px}px`);
  }

  /* --- píxeles fraccionarios en controles --- */
  const CONTROLES = 'button, input, select, textarea, [role="combobox"], [data-slot$="trigger"]';
  for (const el of document.querySelectorAll(CONTROLES)) {
    if (!visible(el)) continue;
    const { height } = el.getBoundingClientRect();
    if (Math.abs(height - Math.round(height)) > 0.02) {
      anota("fraccionarios", el, `alto ${height.toFixed(2)}px`);
    }
  }

  /* --- anidamiento inválido --- */
  const INTERACTIVOS = "button, a[href], input, select, textarea";
  for (const el of document.querySelectorAll(INTERACTIVOS)) {
    const padre = el.parentElement?.closest(INTERACTIVOS);
    if (padre) {
      anota(
        "anidamiento",
        el,
        `${el.tagName.toLowerCase()} dentro de ${padre.tagName.toLowerCase()}`,
      );
    }
  }

  /* --- solapamiento entre hermanos interactivos --- */
  const seSolapan = (a, b) =>
    a.left < b.right - 0.5 &&
    b.left < a.right - 0.5 &&
    a.top < b.bottom - 0.5 &&
    b.top < a.bottom - 0.5;
  /* Solo se busca solapamiento accidental, el que sale del flujo normal. Un
     control posicionado en absoluto encima de otro suele ser deliberado (una X
     de limpiar sobre su campo) y no es asunto de este chequeo. */
  const enFlujo = (el) => {
    const pos = getComputedStyle(el).position;
    return pos !== "absolute" && pos !== "fixed";
  };
  const controles = [...document.querySelectorAll("button, [role='button']")]
    .filter(visible)
    .filter(enFlujo);
  for (let i = 0; i < controles.length; i++) {
    for (let j = i + 1; j < controles.length; j++) {
      const a = controles[i];
      const b = controles[j];
      if (a.contains(b) || b.contains(a)) continue;
      if (seSolapan(a.getBoundingClientRect(), b.getBoundingClientRect())) {
        anota("solapamiento", b, `se pisa con ${ruta(a)}`);
      }
    }
  }

  /* --- hermanos de una fila que se pisan, y contenido que se sale --- *
   *
   * Solaparse a propósito se declara de dos maneras, y las dos se respetan: un
   * margen negativo (los avatares de un grupo, un `Bleed`) o salirse del flujo
   * con `absolute`. Lo que no está declarado es lo que se anota. */
  const declaraSolape = (el) => {
    const cs = getComputedStyle(el);
    if (cs.position === "absolute" || cs.position === "fixed") return true;
    for (const lado of [cs.marginLeft, cs.marginRight, cs.marginTop, cs.marginBottom]) {
      if (parseFloat(lado) < 0) return true;
    }
    return false;
  };

  const filas = todos.filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.display !== "flex" && cs.display !== "grid") return false;
    if (cs.display === "flex" && !cs.flexDirection.startsWith("row")) return false;
    /* Una fila que envuelve reparte sus hijos en varios renglones, así que dos
       de ellos compartiendo x es lo normal y no un defecto. */
    if (cs.flexWrap === "wrap" || cs.flexWrap === "wrap-reverse") return false;
    return el.children.length > 1;
  });

  for (const fila of filas) {
    const hijos = [...fila.children].filter((h) => visible(h) && !declaraSolape(h));
    for (let i = 0; i < hijos.length; i++) {
      for (let j = i + 1; j < hijos.length; j++) {
        const a = hijos[i].getBoundingClientRect();
        const b = hijos[j].getBoundingClientRect();
        const cruceX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        /* Los dos ejes: una rejilla apilada a una columna comparte la x de sus
           hijos, y eso es lo que tiene que hacer. */
        const cruceY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (cruceX > 1 && cruceY > 1) {
          anota("hermanos", hijos[j], `${cruceX.toFixed(1)}px sobre ${ruta(hijos[i])}`);
        }
      }
    }
  }

  /* Salirse de un contenedor que recorta es lo normal y muchas veces el punto:
     el carril de un carrusel mide más que su ventana a propósito. */
  const alguienRecorta = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).overflow !== "visible") return true;
    }
    return false;
  };

  for (const el of todos) {
    const cs = getComputedStyle(el);
    if (cs.overflow !== "visible") continue;
    const caja = el.getBoundingClientRect();
    if (caja.width === 0) continue;
    if (alguienRecorta(el)) continue;
    for (const hijo of el.children) {
      if (!visible(hijo) || declaraSolape(hijo)) continue;
      const h = hijo.getBoundingClientRect();
      const fuera = Math.max(h.right - caja.right, caja.left - h.left);
      /* Un umbral de 1px deja pasar el redondeo del subpíxel. */
      if (fuera > 1) anota("desborde", hijo, `${fuera.toFixed(1)}px fuera de ${ruta(el)}`);
    }
  }

  /* --- fondos que desbordan una esquina redondeada --- */
  for (const el of todos) {
    const cs = getComputedStyle(el);
    const radio = parseFloat(cs.borderTopLeftRadius);
    if (!Number.isFinite(radio) || radio < 4) continue;
    if (cs.overflow !== "visible") continue;
    const caja = el.getBoundingClientRect();
    for (const hijo of el.children) {
      if (!visible(hijo)) continue;
      const hcs = getComputedStyle(hijo);
      const fondo = hcs.backgroundColor;
      if (!fondo || fondo === "transparent" || fondo.endsWith(", 0)")) continue;
      const hijoRadio = parseFloat(hcs.borderTopLeftRadius) || 0;
      const h = hijo.getBoundingClientRect();
      /* Si el hijo llega a la esquina del padre y no la redondea, la tapa. */
      if (h.top - caja.top < 1 && h.left - caja.left < 1 && hijoRadio < radio - 0.5) {
        anota("recorte", hijo, `fondo opaco con radio ${hijoRadio}px dentro de uno de ${radio}px`);
      }
    }
  }

  /* --- alineación de filas dentro de una lista --- */
  const LISTAS = '[data-slot$="-list"], [role="listbox"], [role="menu"]';
  for (const lista of document.querySelectorAll(LISTAS)) {
    if (!visible(lista)) continue;
    const filas = [...lista.querySelectorAll('[data-slot$="-item"], [role="option"]')].filter(
      visible,
    );
    if (filas.length < 2) continue;
    const xs = filas.map((f) => {
      const w = document.createTreeWalker(f, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) if (n.textContent.trim()) break;
      if (!n) return null;
      const rango = document.createRange();
      rango.selectNodeContents(n);
      return { fila: f, x: Math.round(rango.getBoundingClientRect().left * 10) / 10 };
    });
    const validos = xs.filter(Boolean);
    if (validos.length < 2) continue;
    const min = Math.min(...validos.map((v) => v.x));
    for (const v of validos) {
      if (v.x - min > 1)
        anota("alineacion", v.fila, `texto ${(v.x - min).toFixed(1)}px a la derecha del resto`);
    }
  }

  /* --- contraste --- */
  const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  /* Devuelve [r,g,b,a] de cualquier formato CSS, oklch incluido, dejando que el
     canvas haga la conversión. */
  const aRgba = (css) => {
    cv.clearRect(0, 0, 1, 1);
    cv.fillStyle = css;
    cv.fillRect(0, 0, 1, 1);
    const d = cv.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const componer = (frente, fondo) =>
    [0, 1, 2].map((i) => frente[i] * frente[3] + fondo[i] * (1 - frente[3]));
  const lum = (c) => {
    const s = c.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
  };
  /* Un fondo semitransparente se compone contra lo que tiene detras, subiendo
     hasta encontrar algo opaco. Tratarlo como si fuera sólido daba lecturas
     absurdas, 1.09:1 en texto perfectamente legible. */
  const fondoEfectivo = (el) => {
    const capas = [];
    for (let n = el; n; n = n.parentElement) {
      const c = aRgba(getComputedStyle(n).backgroundColor);
      if (c[3] === 0) continue;
      capas.push(c);
      if (c[3] === 1) break;
    }
    let resultado = [255, 255, 255];
    for (let i = capas.length - 1; i >= 0; i--) resultado = componer(capas[i], resultado);
    return resultado;
  };

  for (const el of todos) {
    const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!propio) continue;
    /* El texto solo para lectores de pantalla se recorta a 1px y nunca se ve,
       de modo que medirle contraste no dice nada. */
    const caja = el.getBoundingClientRect();
    if (caja.width <= 1 || caja.height <= 1) continue;
    const cs = getComputedStyle(el);
    if (parseFloat(cs.opacity) < 1) continue; // deshabilitado a propósito
    const px = parseFloat(cs.fontSize);
    const negrita = parseInt(cs.fontWeight, 10) >= 700;
    const grande = px >= 24 || (px >= 18.66 && negrita);
    const minimo = grande ? 3 : 4.5;
    const fondo = fondoEfectivo(el);
    const texto = componer(aRgba(cs.color), fondo);
    const [l1, l2] = [lum(texto), lum(fondo)].sort((a, b) => b - a);
    const ratio = (l1 + 0.05) / (l2 + 0.05);
    if (ratio < minimo) {
      /* El detalle lleva los colores crudos, porque un número sin evidencia no
         se puede refutar y un fallo de la sonda se confunde con uno del tema. */
      anota(
        "contraste",
        el,
        `${ratio.toFixed(2)}:1 (min ${minimo}) en "${el.textContent.trim().slice(0, 20)}", ` +
          `texto ${cs.color} sobre rgb(${fondo.map(Math.round).join(",")})`,
      );
    }
  }

  return fallos;
};

/* ------------------------------------------------------------------ *
 * Ejecución
 * ------------------------------------------------------------------ */

/* CHROMIUM_PATH permite usar un navegador ya instalado en el entorno (CI,
   contenedores) en vez del que descarga Playwright. */
const navegador = await chromium.launch({
  args: ["--no-sandbox"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});
const pagina = await (
  await navegador.newContext({ viewport: { width: 1280, height: 900 } })
).newPage();

const erroresDePagina = [];
pagina.on("pageerror", (e) => erroresDePagina.push(String(e)));

try {
  await pagina.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
} catch {
  console.error(`No se pudo abrir ${URL}. ¿Esta corriendo el showcase?`);
  console.error("  pnpm --filter showcase dev");
  await navegador.close();
  process.exit(2);
}

/* Las secciones son React.lazy, así que se recorre la página para montarlas. Se
   repite en cada ancho: al cambiar el viewport el contenido cambia de alto y
   medir antes de que se asiente da fallos fantasma. */
const montarSecciones = async () => {
  await pagina.evaluate(async () => {
    const paso = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += paso) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(600);
};

await montarSecciones();
await pagina.waitForTimeout(600);

await pagina.evaluate(
  ([r, i, t]) => {
    window.__RADIOS = r;
    window.__ICONOS = i;
    window.__TIPOGRAFIA = t;
  },
  [RADIOS, ICONOS, TIPOGRAFIA],
);

const todosLosFallos = [];
const recolectar = async (contexto) => {
  const fallos = await pagina.evaluate(sonda);
  for (const f of fallos) todosLosFallos.push({ ...f, contexto });
};

/* Un color a mitad de transición se lee como un valor que nadie escribió (Chrome
   lo reporta como `oklab(...)`) y produce fallos fantasma. Se congelan las
   transiciones antes de medir. */
const congelarMovimiento = async () => {
  await pagina.addStyleTag({
    content: `*, *::before, *::after {
      transition: none !important;
      animation: none !important;
    }`,
  });
  await pagina.waitForTimeout(150);
};

const auditarAncho = async (nombre) => {
  await congelarMovimiento();
  await recolectar(nombre);

  /* Los paneles flotantes solo existen abiertos, y es ahí donde vive la mitad
     de los defectos de alineación y recorte. */
  if (!ABRIR_PANELES) return;
  const disparadores = await pagina.locator('[data-slot$="-trigger"]:visible').all();
  for (const [n, d] of disparadores.entries()) {
    try {
      await d.scrollIntoViewIfNeeded();
      await d.click({ timeout: 2000 });
      await pagina.waitForTimeout(450);
      await recolectar(`${nombre}, panel ${n + 1}`);
      await pagina.keyboard.press("Escape");
      await pagina.waitForTimeout(200);
    } catch {
      /* un disparador que no abre no es asunto de esta auditoría */
    }
  }
};

const auditarTema = async (tema) => {
  for (const ancho of ANCHOS) {
    await pagina.setViewportSize({ width: ancho, height: 900 });
    await montarSecciones();
    await auditarAncho(ANCHOS.length > 1 ? `${tema} @${ancho}px` : tema);
  }
};

/* El tema oscuro tiene sus propios valores; auditar solo el claro deja la mitad
   del sistema sin comprobar.
 *
 * El cambio se hace por el control de la app. El ThemeProvider es dueño de ese
 * atributo y lo reescribe en su siguiente render, con lo cual forzar la clase en
 * <html> deja la página a medio camino entre los dos temas. */
const cambiarATemaOscuro = async () => {
  const toggle = pagina.getByRole("button", { name: /^dark$/i }).first();
  if (await toggle.count()) {
    await toggle.click();
  } else {
    await pagina.evaluate(() => document.documentElement.classList.add("dark"));
  }
  await pagina.evaluate(() => window.scrollTo(0, 0));
  await pagina.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") ||
      document.documentElement.dataset.theme === "dark",
    { timeout: 5000 },
  );
  await pagina.waitForTimeout(600);
};

if (TEMA === "claro" || TEMA === "ambos") await auditarTema("claro");
if (TEMA === "oscuro" || TEMA === "ambos") {
  await cambiarATemaOscuro();
  await auditarTema("oscuro");
}

await navegador.close();

/* ------------------------------------------------------------------ *
 * Informe
 * ------------------------------------------------------------------ */

/* Se queda con la primera vez que aparece cada fallo, que es el ancho más
   estrecho donde se ve, no el último. */
const unicos = [];
const vistos = new Set();
for (const f of todosLosFallos) {
  const clave = `${f.chequeo}|${f.ruta}|${f.detalle}`;
  if (vistos.has(clave)) continue;
  vistos.add(clave);
  unicos.push(f);
}

console.log(`\nAuditoria visual de ${URL}${ABRIR_PANELES ? " (con paneles)" : ""}\n`);

let fallando = 0;
for (const c of CHEQUEOS) {
  const propios = unicos.filter((f) => f.chequeo === c.id);
  if (propios.length === 0) {
    console.log(`  ok    ${c.titulo}`);
    continue;
  }
  fallando++;
  console.log(`\n  FALLA ${c.titulo}  (${propios.length})`);
  console.log(`        ${c.porque}`);
  for (const f of propios.slice(0, 8)) {
    console.log(
      `        · ${f.ruta} — ${f.detalle}${f.contexto === "pagina" ? "" : `  [${f.contexto}]`}`,
    );
  }
  if (propios.length > 8) console.log(`        · … y ${propios.length - 8} mas`);
}

if (erroresDePagina.length) {
  fallando++;
  console.log(`\n  FALLA Errores de JavaScript  (${erroresDePagina.length})`);
  for (const e of erroresDePagina.slice(0, 5)) console.log(`        · ${e}`);
}

console.log(
  `\n${fallando === 0 ? "Sin hallazgos." : `${fallando} de ${CHEQUEOS.length} chequeos con hallazgos.`}\n`,
);

process.exit(fallando === 0 ? 0 : 1);
