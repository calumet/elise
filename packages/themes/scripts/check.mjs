/**
 * Comprueba el paquete ya construido contra la hoja de la que sale.
 *
 *   node scripts/check.mjs
 *
 * Va colgado del build, que es lo que corre CI. Lo que cubre es lo que puede
 * romperse en silencio: el parser de la hoja y el descarte de valores que se
 * salen de la declaración.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const {
  applyTheme,
  themeToCss,
  lightTheme,
  darkTheme,
  tokenKinds,
  ThemeProvider,
  FONT_FAMILIES,
  DECISIONS,
  set,
  clear,
  isChanged,
  contrast,
  parse,
} = await import(join(here, "../dist/index.mjs"));
const { createElement } = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");

/* Los defaults salen de la hoja, no de una copia que se queda atrás. */
const css = readFileSync(join(here, "../../ui/src/tailwind/elise.css"), "utf8");
for (const name of ["--primary", "--background", "--radius", "--canvas"]) {
  const declared = new RegExp(`^ {2}\\${name}: (.+);$`, "m").exec(css)[1];
  assert.equal(lightTheme[name], declared, `${name} no coincide con la hoja`);
}

/* `--spacing` se declara en `@theme` y solo entra por redefinirlo la densidad. */
assert.equal(lightTheme["--spacing"], "0.25rem");
assert.equal(Object.keys(darkTheme).length, Object.keys(lightTheme).length);
assert.notEqual(darkTheme["--background"], lightTheme["--background"]);
assert.equal(darkTheme["--radius"], lightTheme["--radius"], "lo que el oscuro no toca se hereda");

/* Un valor de varias líneas y con paréntesis sobrevive entero. */
assert.match(lightTheme["--shadow-surface-bevel"], /^inset 1px 0 0 0 .+ inset 0 1px 0 0 .+$/);
assert.equal(tokenKinds["--shadow-surface-bevel"], "shadow");
assert.equal(tokenKinds["--inverse"], "color", "sigue var(--foreground) hasta el color");
assert.equal(tokenKinds["--spacing"], "size");

/* Las familias son las que sirve elise-ui, una por entrada y sin sobrar ninguna. */
const served = readdirSync(join(here, "../../ui/src/tailwind/fonts"))
  .filter((entry) => entry.endsWith(".css"))
  .map((entry) => entry.replace(".css", ""));
assert.deepEqual(
  FONT_FAMILIES.map((family) => family.id).sort(),
  served.sort(),
  "la lista de familias no coincide con las entradas de elise-ui",
);
for (const family of FONT_FAMILIES) {
  assert.ok(family.stack.startsWith(`"${family.label} Variable"`), `${family.id} no se registra`);
}

assert.equal(
  themeToCss({ "--primary": "oklch(0.5 0.1 200)", "--radius": "1rem" }),
  ":root {\n  --primary: oklch(0.5 0.1 200);\n  --radius: 1rem;\n}",
);

const injected = themeToCss({
  "--primary": "red; } </style><script>alert(1)</script><style>",
  "--radius": "1rem",
});
assert.equal(injected.includes("script"), false, "se coló la etiqueta");
assert.equal(injected.includes("--radius: 1rem;"), true, "el valor sano se pierde");
assert.equal(themeToCss({ "--primary": "red/*" }).includes("/*"), false);

const written = {};
applyTheme(
  { "--primary": "red", "--radius": undefined },
  { style: { setProperty: (name, value) => (written[name] = value) } },
);
assert.deepEqual(written, { "--primary": "red" });

/* El enlace de marca se lee sobre el papel, sea cual sea el orden en que se eligieron. */
const brand = DECISIONS.find((decision) => decision.id === "brand");
const paper = DECISIONS.find((decision) => decision.id === "paper");
const linkContrast = (theme) =>
  contrast(
    parse(theme["--link"] ?? lightTheme["--link"]),
    parse(theme["--background"] ?? lightTheme["--background"]),
  );
const onLight = set(brand, {}, "#7b1fa2");
const darkFirst = set(brand, set(paper, {}, "#16181d"), "#7b1fa2");
const brandFirst = set(paper, onLight, "#16181d");
assert.ok(linkContrast(onLight) >= 4.5);
assert.ok(linkContrast(set(brand, { ...darkTheme }, "#7b1fa2")) >= 4.5);
assert.ok(linkContrast(darkFirst) >= 4.5);
assert.deepEqual(brandFirst, darkFirst, "el papel no vuelve a derivar la marca");
assert.deepEqual(clear(paper, brandFirst), onLight, "quitar el papel deja la marca del oscuro");

/* La marca de la hoja también se lee sobre papel oscuro. */
const ringContrast = (theme) =>
  contrast(parse(theme["--ring"] ?? lightTheme["--ring"]), parse(theme["--background"]));
const darkPaper = set(paper, {}, "#16181d");
assert.ok(linkContrast(darkPaper) >= 4.5, "el enlace de la hoja no se lee sobre papel oscuro");
assert.ok(ringContrast(darkPaper) >= 3, "el anillo de la hoja no se ve sobre papel oscuro");
assert.ok(
  linkContrast(clear(brand, darkFirst)) >= 4.5,
  "volver a la marca de la hoja la deja ilegible",
);
assert.deepEqual(clear(paper, darkPaper), {});

/* El papel de cada hoja da esa hoja, variable por variable. */
assert.deepEqual({ ...lightTheme, ...set(paper, {}, darkTheme["--background"]) }, darkTheme);
assert.deepEqual(set(paper, {}, lightTheme["--background"]), {});
assert.deepEqual(set(paper, set(paper, {}, "#16181d"), lightTheme["--background"]), {});

/* Otro papel guarda con cada variable la relación que tiene la hoja de su lado. */
const sideVars = Object.keys(darkTheme).filter((name) => darkTheme[name] !== lightTheme[name]);
const lightnesses = (value) =>
  [...value.matchAll(/oklch\(([\d.]+)/g)].map((match) => Number(match[1]));
for (const [hex, sheet] of [
  ["#16181d", darkTheme],
  ["#f6f1e7", lightTheme],
]) {
  const moved = { ...lightTheme, ...set(paper, {}, hex) };
  const shift = parse(moved["--background"]).l - parse(sheet["--background"]).l;
  for (const name of sideVars) {
    const before = lightnesses(sheet[name]);
    const after = lightnesses(moved[name]);
    assert.equal(after.length, before.length, `${name} cambia de forma sobre ${hex}`);
    before.forEach((l, index) => {
      const expected = l === 0 || l === 1 ? l : Math.min(1, Math.max(0, l + shift));
      assert.ok(Math.abs(after[index] - expected) < 0.002, `${name} no sigue al papel ${hex}`);
    });
  }
}

/* Sobre papel oscuro, los estados de un color propio aclaran como en la hoja oscura. */
const danger = DECISIONS.find((decision) => decision.id === "status-danger");
for (const [decision, prefix] of [
  [brand, "--primary"],
  [danger, "--destructive"],
]) {
  const custom = set(decision, set(paper, {}, "#16181d"), "#c62828");
  const at = (suffix) => parse(custom[`${prefix}${suffix}`]).l;
  assert.ok(at("-hover") > at("") && at("-active") > at("-hover"), `${prefix} oscurece en oscuro`);
}

/* Las sombras fuertes también se pasan al lado del papel, y siguen leyéndose como fuertes. */
const depth = DECISIONS.find((decision) => decision.id === "depth");
const strongOnLight = set(depth, {}, "strong");
const strongOnDark = set(depth, darkPaper, "strong");
assert.equal(
  strongOnDark["--shadow-lg"].includes("0.21 0.02 265"),
  false,
  "sombra clara en oscuro",
);
assert.equal(depth.read(strongOnDark), "strong");
assert.deepEqual(set(paper, strongOnLight, "#16181d"), strongOnDark);
assert.deepEqual(clear(paper, strongOnDark), strongOnLight);

/* Los bordes sin tocar son los normales, no los tenues. */
const borders = DECISIONS.find((decision) => decision.id === "borders");
assert.equal(borders.read({}), "normal");
assert.equal(borders.read(darkPaper), "normal");
assert.equal(borders.read(set(borders, {}, "faint")), "faint");

/* El menú lateral sigue al papel, salvo que vaya en el color de la marca. */
const sidebar = DECISIONS.find((decision) => decision.id === "sidebar");
const railOn = (theme) => parse(theme["--sidebar"] ?? lightTheme["--sidebar"]);
assert.ok(railOn(darkPaper).l < 0.5, "el menú lateral se queda claro sobre papel oscuro");
assert.ok(
  contrast(
    parse(darkPaper["--sidebar-foreground"] ?? lightTheme["--sidebar-foreground"]),
    railOn(darkPaper),
  ) >= 4.5,
);
assert.equal(sidebar.read(darkPaper), "paper");
const railOnBrand = set(sidebar, darkPaper, "brand");
assert.equal(railOnBrand["--sidebar"], "var(--primary)");
assert.deepEqual(set(paper, set(sidebar, {}, "brand"), "#16181d"), railOnBrand);
assert.deepEqual(clear(sidebar, railOnBrand), darkPaper);
assert.deepEqual(clear(paper, railOnBrand), set(sidebar, {}, "brand"));

/* Una decisión propia escribe y deshace su variable propia como las de Elise. */
const secondary = {
  ...brand,
  id: "secondary",
  writes: ["--tinte-dos"],
  apply: (value) => ({ "--tinte-dos": value }),
  read: (theme) => theme["--tinte-dos"] ?? "",
};
const withSecondary = set(secondary, onLight, "#00897b");
assert.equal(withSecondary["--tinte-dos"], "#00897b");
assert.ok(isChanged(secondary, withSecondary));
assert.deepEqual(clear(secondary, withSecondary), onLight);

/* Las miniaturas se dibujan con el tema que la opción deja, no con la hoja clara. */
const { DecisionControl } = await import(join(here, "../dist/index.mjs"));
const previews = (id, theme) =>
  renderToStaticMarkup(
    createElement(DecisionControl, {
      decision: DECISIONS.find((decision) => decision.id === id),
      value: theme,
      onChange() {},
    }),
  );
const darkPage = set(paper, set(brand, {}, "#2244a1"), "#16181d");
for (const id of ["sidebar", "borders", "depth", "density", "corners"]) {
  const html = previews(id, darkPage);
  for (const name of ["--canvas", "--sidebar", "--border"]) {
    for (const prefix of [`${name}:`, "background:", "border-color:"]) {
      assert.equal(
        html.includes(`${prefix}${lightTheme[name]}`),
        false,
        `${id} pinta ${name} de la hoja clara`,
      );
    }
  }
}
assert.ok(
  previews("borders", darkPage).includes(`border-color:${darkPage["--foreground"]}`),
  "las líneas sólidas no llevan la tinta del papel oscuro",
);

/* El script sale con la clave y el tema por defecto que le pasaron al provider. */
const render = (props) => renderToStaticMarkup(createElement(ThemeProvider, props, "contenido"));

const html = render({ storageKey: "portal-tema", defaultTheme: "dark" });
assert.match(html, /^<script>.*<\/script>contenido$/s, "el script no sale antes del contenido");

const source = /^<script>(.*)<\/script>/s.exec(html)[1];
assert.ok(source.includes('"portal-tema"'), "el script no lleva la clave del provider");

const marked = (stored) => {
  const root = {
    classes: [],
    classList: {
      add(name) {
        root.classes.push(name);
      },
    },
    setAttribute() {},
  };
  new Function("document", "localStorage", source)(
    { documentElement: root },
    { getItem: () => stored },
  );
  return root.classes;
};
assert.deepEqual(marked("dark"), ["dark"]);
assert.deepEqual(marked("light"), []);
assert.deepEqual(marked(null), ["dark"], "sin preferencia guardada manda defaultTheme");
assert.deepEqual(marked("basura"), ["dark"], "un valor que no es tema tampoco decide");

assert.equal(
  render({ forcedTheme: "dark" }).includes("<script>"),
  false,
  "con tema forzado no hay nada que leer antes de pintar",
);

console.log(`${Object.keys(lightTheme).length} variables comprobadas contra la hoja.`);
