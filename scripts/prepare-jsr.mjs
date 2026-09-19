/**
 * Ata cada `.js` del build de JSR a su `.d.ts` hermano con el pragma
 * `@ts-self-types`. Deno no resuelve declaraciones por convención de nombre, así
 * que sin el pragma el paquete se publica sin tipos.
 *
 *   node scripts/prepare-jsr.mjs packages/toasts/jsr
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2];
if (!root) {
  console.error("Falta la carpeta. Uso: node scripts/prepare-jsr.mjs <carpeta>");
  process.exit(1);
}

const PRAGMA = /^\/\/ @ts-self-types=/;
let bundled = 0;
let untyped = [];

const walk = (folder) => {
  for (const entry of readdirSync(folder)) {
    const path = join(folder, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!entry.endsWith(".js")) continue;

    const declaration = entry.replace(/\.js$/, ".d.ts");
    try {
      statSync(join(folder, declaration));
    } catch {
      untyped.push(path);
      continue;
    }

    const text = readFileSync(path, "utf8");
    if (PRAGMA.test(text)) continue;
    writeFileSync(path, `// @ts-self-types="./${declaration}"\n${text}`);
    bundled++;
  }
};

walk(root);

console.log(`${bundled} módulos atados a su .d.ts en ${root}`);
if (untyped.length) {
  console.error(`Sin declaración (${untyped.length}):\n  ${untyped.join("\n  ")}`);
  process.exit(1);
}
