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
 *
 * Este archivo es el conductor y corre en Node. Lo que mide vive en
 * `sonda-visual.js`, que se inyecta en la página y corre en el navegador.
 */

import { join } from "node:path";

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

await pagina.addScriptTag({ path: join(import.meta.dirname, "sonda-visual.js") });
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
  const fallos = await pagina.evaluate(() => window.__sondaVisual());
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
