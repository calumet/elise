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
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { applyTheme, themeToCss, lightTheme, darkTheme, tokenKinds, ThemeProvider } = await import(
  join(here, "../dist/index.mjs")
);
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

/* El provider monta el script que marca el `<html>` al parsear el HTML del
   servidor, con la clave y el tema por defecto que le pasaron a él. */
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
