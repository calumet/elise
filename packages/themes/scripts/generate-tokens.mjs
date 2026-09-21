/**
 * Escribe `src/tokens.generated.ts` leyendo la hoja y las fuentes de
 * `@calumet/elise-ui`.
 *
 *   node scripts/generate-tokens.mjs
 *
 * Tematizable es toda variable declarada en `:root` más toda la que redefina
 * otro bloque de selector, que es como entra `--spacing` sin lista a mano.
 *
 * Sale con código 1 si un bloque redefine algo que la hoja no declara en
 * ninguna parte, o si una fuente no dice lo mismo en su entrada que en su
 * propio metadata.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(here, "../../ui/src/tailwind/elise.css");
const FONTS = join(here, "../../ui/src/tailwind/fonts");
const FONTSOURCE = join(here, "../../ui/node_modules/@fontsource-variable");
const TARGET = join(here, "../src/tokens.generated.ts");
const DARK = '[data-theme="dark"]';

/** Los bloques de primer nivel, con su selector y su cuerpo. */
const topLevelBlocks = (css) => {
  const blocks = [];
  let depth = 0;
  let selector = "";
  let start = 0;
  let selectorStart = 0;

  for (let i = 0; i < css.length; i += 1) {
    if (css[i] === "{") {
      if (depth === 0) {
        /* Tras el último `;`, que entre bloque y bloque hay at-rules sin cuerpo. */
        selector = css.slice(selectorStart, i).split(";").pop().trim();
        start = i + 1;
      }
      depth += 1;
    } else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        blocks.push({ selector, body: css.slice(start, i) });
        selectorStart = i + 1;
      }
    }
  }
  return blocks;
};

/** Las custom properties de un cuerpo. Corta en `;` fuera de paréntesis, que hay valores de varias líneas. */
const declarations = (body) => {
  const found = new Map();
  let depth = 0;
  let buffer = "";

  const take = (text) => {
    const colon = text.indexOf(":");
    if (colon < 0) return;
    const name = text.slice(0, colon).trim();
    if (!name.startsWith("--") || name.includes("{")) return;
    found.set(
      name,
      text
        .slice(colon + 1)
        .trim()
        .replace(/\s+/g, " "),
    );
  };

  for (const character of body) {
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;

    if (character === ";" && depth === 0) {
      take(buffer);
      buffer = "";
    } else {
      buffer += character;
    }
  }
  take(buffer);
  return found;
};

const css = readFileSync(SOURCE, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const blocks = topLevelBlocks(css);

const bodyOf = (match) => blocks.find((block) => match(block.selector))?.body ?? "";
const scale = declarations(bodyOf((s) => s === "@theme"));
const root = declarations(bodyOf((s) => s === ":root"));
const dark = declarations(bodyOf((s) => s.includes(DARK)));

/* De aquí sale `--spacing`: lo declara `@theme` y lo redefine la densidad. */
const overrides = blocks
  .filter((block) => !block.selector.startsWith("@") && block.selector !== ":root")
  .flatMap((block) => [...declarations(block.body).keys()]);

const names = [...new Set([...root.keys(), ...overrides])];
const missing = names.filter((name) => !root.has(name) && !scale.has(name));
if (missing.length > 0) {
  console.error(`Redefinidas sin valor base en la hoja:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

const light = new Map(names.map((name) => [name, root.get(name) ?? scale.get(name)]));

/** Sigue las referencias `var(--x)` para clasificar por el valor de destino. */
const resolve = (value, hops = 0) => {
  const reference = /^var\((--[a-z0-9-]+)\)$/.exec(value);
  if (!reference || hops > 5) return value;
  const next = light.get(reference[1]);
  return next === undefined ? value : resolve(next, hops + 1);
};

const kindOf = (name, value) => {
  if (name.startsWith("--shadow")) return "shadow";
  const resolved = resolve(value);
  if (/^(oklch|rgb|hsl|color|#)/.test(resolved)) return "color";
  if (/^-?[\d.]+(rem|px|em|%)$/.test(resolved)) return "size";
  return "other";
};

const entries = (map) =>
  [...map].map(([name, value]) => `  "${name}": ${JSON.stringify(value)},`).join("\n");

/* La familia se llama como diga su propio metadata, y la entrada de Elise dice
   cuál registra. Si no coinciden, una de las dos miente y hay que mirarlo. */
const FALLBACKS = {
  serif: "ui-serif, Georgia, serif",
  monospace: "ui-monospace, monospace",
};

/* Las que `fonts.css` importa van primero: son las que se ven de verdad sin que
   la app importe nada más, y las demás caen en la fuente del sistema. */
const loaded = [
  ...readFileSync(join(FONTS, "../fonts.css"), "utf8").matchAll(/fonts\/([a-z0-9-]+)\.css/g),
].map((match) => match[1]);

const families = readdirSync(FONTS)
  .filter((entry) => entry.endsWith(".css"))
  .sort((one, other) => {
    const rank = (entry) => {
      const index = loaded.indexOf(entry.replace(".css", ""));
      return index === -1 ? loaded.length : index;
    };
    return rank(one) - rank(other) || one.localeCompare(other);
  })
  .map((entry) => {
    const id = entry.replace(".css", "");
    const declared = /Registra "([^"]+)"/.exec(readFileSync(join(FONTS, entry), "utf8"));
    const meta = JSON.parse(readFileSync(join(FONTSOURCE, id, "metadata.json"), "utf8"));
    const registered = `${meta.family} Variable`;

    if (!declared || declared[1] !== registered) {
      console.error(`${entry} dice "${declared?.[1]}" y el paquete registra "${registered}".`);
      process.exit(1);
    }
    return {
      id,
      label: meta.family,
      stack: `"${registered}", ${FALLBACKS[meta.category] ?? "ui-sans-serif, sans-serif"}`,
    };
  });

const file = `/* Generado por scripts/generate-tokens.mjs desde la hoja de @calumet/elise-ui.
   No editar a mano: el próximo build lo sobrescribe. */

/** Una variable de tema de Elise. */
export type EliseVar =
${names.map((name) => `  | "${name}"`).join("\n")};

/** Qué clase de valor lleva una variable, para pintarle su control en un editor. */
export type TokenKind = "color" | "size" | "shadow" | "other";

/** El tema claro, tal como lo define la hoja. */
export const lightTheme: Record<EliseVar, string> = {
${entries(light)}
};

/** El tema oscuro, con las ${dark.size} variables que redefine ya aplicadas sobre el claro. */
export const darkTheme: Record<EliseVar, string> = {
${entries(new Map([...light].map(([name, value]) => [name, dark.get(name) ?? value])))}
};

/** La clase de valor de cada variable. */
export const tokenKinds: Record<EliseVar, TokenKind> = {
${[...light].map(([name, value]) => `  "${name}": "${kindOf(name, value)}",`).join("\n")}
};

/** Una familia que @calumet/elise-ui lleva autoalojada. */
export type FontFamily = { id: string; label: string; stack: string };

/**
 * Las familias que sirve la hoja, con su entrada en
 * \`@calumet/elise-ui/tailwind/fonts/<id>.css\`. La app importa las que ofrezca.
 */
export const FONT_FAMILIES: readonly FontFamily[] = [
${families.map((family) => `  ${JSON.stringify(family)},`).join("\n")}
];
`;

writeFileSync(TARGET, file);
console.log(
  `${names.length} variables, ${dark.size} redefinidas en oscuro, ${families.length} familias.`,
);
