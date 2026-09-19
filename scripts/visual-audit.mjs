/**
 * Auditoría visual del showcase.
 *
 * Abre la app en un Chromium headless y comprueba, sobre el DOM ya renderizado,
 * las cosas que un typecheck no ve y una captura no delata a simple vista.
 * Cada chequeo existe porque el defecto que busca se colo de verdad.
 *
 *   pnpm audit:visual                     # contra http://localhost:5173
 *   pnpm audit:visual -- --url=http://…   # contra otra URL
 *   pnpm audit:visual -- --open           # además abre cada disparador de panel
 *   pnpm audit:visual -- --widths=360     # un solo ancho, en vez del barrido
 *   pnpm audit:visual -- --theme=dark    # light | dark | both
 *
 * Sale con código 1 si hay fallos, para poder colgarlo de CI.
 *
 * Este archivo es el conductor y corre en Node. Lo que mide vive en
 * `visual-probe.js`, que se inyecta en la página y corre en el navegador.
 */

import { join } from "node:path";

import { chromium } from "playwright";

const args = process.argv.slice(2);
const arg = (name, byDefault) =>
  args
    .find((a) => a.startsWith(`--${name}=`))
    ?.split("=")
    .slice(1)
    .join("=") ?? byDefault;

const URL = arg("url", "http://localhost:5173");
const OPEN_PANELS = args.includes("--open");
const THEME = arg("theme", "light"); // light | dark | both

/* Lo que se rompe por responsive se rompe donde aprieta, así que auditar solo en
   escritorio no ve nada. Los tres son el estrecho, el borde del breakpoint y el
   ancho cómodo. */
const WIDTHS = arg("widths", "360,768,1280")
  .split(",")
  .map((n) => Number(n.trim()))
  .filter((n) => Number.isFinite(n) && n > 0);

/* Escalas del sistema. Si cambian en elise.css, cambian aca. */
const RADII = [0, 2, 4, 5, 6, 8, 10, 12, 16];
const ICONS = [12, 14, 16, 20, 24];
const TYPOGRAPHY = [11, 12, 13, 14, 16, 20, 24, 30];

const CHECKS = [
  {
    id: "radii",
    title: "Radios fuera de la escala",
    because: "Un radio suelto delata un valor escrito a mano en vez de un token.",
  },
  {
    id: "icons",
    title: "Iconos fuera de la escala",
    because: "Un icono a 14.08px cae en medio pixel y se ve borroso sin que se entienda por que.",
  },
  {
    id: "typography",
    title: "Tamanos de texto fuera de la escala",
    because: "Un tamano fuera de escala pierde el interlineado y el tracking emparejados.",
  },
  {
    id: "fractional",
    title: "Controles en pixeles fraccionarios",
    because:
      "Con una base de espaciado mal elegida, h-10 mide 35.2px y todo queda fuera de rejilla.",
  },
  {
    id: "nesting",
    title: "Elementos interactivos anidados",
    because: "Un <button> dentro de otro es HTML invalido y rompe el foco por teclado.",
  },
  {
    id: "overlap",
    title: "Controles superpuestos",
    because: "Dos iconos en la misma esquina se pisan y solo se nota mirando de cerca.",
  },
  {
    id: "siblings",
    title: "Hermanos de una fila que se pisan",
    because:
      "Dos piezas de la misma fila ocupando el mismo sitio: una se quedo sin ancho y la otra se le monta encima.",
  },
  {
    id: "overflow",
    title: "Contenido que se sale de su contenedor",
    because:
      "Una caja que se quedo en cero sigue pintando lo de dentro, encima de lo que tenga al lado.",
  },
  {
    id: "clip",
    title: "Fondos que desbordan esquinas redondeadas",
    because: "Un hijo opaco sin recorte pinta un rectangulo sobre la curva del contenedor.",
  },
  {
    id: "alignment",
    title: "Filas desalineadas dentro de una lista",
    because: "Una fila sin indicador se corre el ancho del icono respecto de las demas.",
  },
  {
    id: "contrast",
    title: "Contraste por debajo de WCAG AA",
    because: "El tema declara cumplir 4.5:1; conviene comprobarlo y no confiar.",
  },
];

/* ------------------------------------------------------------------ *
 * Ejecución
 * ------------------------------------------------------------------ */

/* CHROMIUM_PATH permite usar un navegador ya instalado en el entorno (CI,
   contenedores) en vez del que descarga Playwright. */
const browser = await chromium.launch({
  args: ["--no-sandbox"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();

const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));

try {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });
} catch {
  console.error(`No se pudo abrir ${URL}. ¿Esta corriendo el showcase?`);
  console.error("  pnpm --filter showcase dev");
  await browser.close();
  process.exit(2);
}

/* Las secciones son React.lazy, así que se recorre la página para montarlas. Se
   repite en cada ancho: al cambiar el viewport el contenido cambia de alto y
   medir antes de que se asiente da fallos fantasma. */
const mountSections = async () => {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
};

await mountSections();
await page.waitForTimeout(600);

await page.addScriptTag({ path: join(import.meta.dirname, "visual-probe.js") });
await page.evaluate(
  ([r, i, t]) => {
    window.__RADII = r;
    window.__ICONS = i;
    window.__TYPOGRAPHY = t;
  },
  [RADII, ICONS, TYPOGRAPHY],
);

const allFailures = [];
const collect = async (context) => {
  const failures = await page.evaluate(() => window.__visualProbe());
  for (const f of failures) allFailures.push({ ...f, context });
};

/* Un color a mitad de transición se lee como un valor que nadie escribió (Chrome
   lo reporta como `oklab(...)`) y produce fallos fantasma. Se congelan las
   transiciones antes de medir. */
const freezeMotion = async () => {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      transition: none !important;
      animation: none !important;
    }`,
  });
  await page.waitForTimeout(150);
};

const auditWidth = async (name) => {
  await freezeMotion();
  await collect(name);

  /* Los paneles flotantes solo existen abiertos, y es ahí donde vive la mitad
     de los defectos de alineación y recorte. */
  if (!OPEN_PANELS) return;
  const triggers = await page.locator('[data-slot$="-trigger"]:visible').all();
  for (const [n, d] of triggers.entries()) {
    try {
      await d.scrollIntoViewIfNeeded();
      await d.click({ timeout: 2000 });
      await page.waitForTimeout(450);
      await collect(`${name}, panel ${n + 1}`);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    } catch {
      /* un disparador que no abre no es asunto de esta auditoría */
    }
  }
};

const auditTheme = async (theme) => {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width: width, height: 900 });
    await mountSections();
    await auditWidth(WIDTHS.length > 1 ? `${theme} @${width}px` : theme);
  }
};

/* El tema oscuro tiene sus propios valores; auditar solo el claro deja la mitad
   del sistema sin comprobar.
 *
 * El cambio se hace por el control de la app. El ThemeProvider es dueño de ese
 * atributo y lo reescribe en su siguiente render, con lo cual forzar la clase en
 * <html> deja la página a medio camino entre los dos temas. */
const switchToDarkTheme = async () => {
  const toggle = page.getByRole("button", { name: /^dark$/i }).first();
  if (await toggle.count()) {
    await toggle.click();
  } else {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains("dark") ||
      document.documentElement.dataset.theme === "dark",
    { timeout: 5000 },
  );
  await page.waitForTimeout(600);
};

if (THEME === "light" || THEME === "both") await auditTheme("light");
if (THEME === "dark" || THEME === "both") {
  await switchToDarkTheme();
  await auditTheme("dark");
}

await browser.close();

/* ------------------------------------------------------------------ *
 * Informe
 * ------------------------------------------------------------------ */

/* Se queda con la primera vez que aparece cada fallo, que es el ancho más
   estrecho donde se ve, no el último. */
const unique = [];
const seen = new Set();
for (const f of allFailures) {
  const key = `${f.check}|${f.path}|${f.detail}`;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(f);
}

console.log(`\nAuditoria visual de ${URL}${OPEN_PANELS ? " (con paneles)" : ""}\n`);

let failing = 0;
for (const c of CHECKS) {
  const own = unique.filter((f) => f.check === c.id);
  if (own.length === 0) {
    console.log(`  ok    ${c.title}`);
    continue;
  }
  failing++;
  console.log(`\n  FALLA ${c.title}  (${own.length})`);
  console.log(`        ${c.because}`);
  for (const f of own.slice(0, 8)) {
    console.log(`        · ${f.path} — ${f.detail}  [${f.context}]`);
  }
  if (own.length > 8) console.log(`        · … y ${own.length - 8} mas`);
}

if (pageErrors.length) {
  failing++;
  console.log(`\n  FALLA Errores de JavaScript  (${pageErrors.length})`);
  for (const e of pageErrors.slice(0, 5)) console.log(`        · ${e}`);
}

console.log(
  `\n${failing === 0 ? "Sin hallazgos." : `${failing} de ${CHECKS.length} chequeos con hallazgos.`}\n`,
);

process.exit(failing === 0 ? 0 : 1);
