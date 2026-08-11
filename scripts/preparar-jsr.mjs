/**
 * Ata cada `.js` del build de JSR a su `.d.ts` hermano con el pragma
 * `@ts-self-types`. Deno no resuelve declaraciones por convención de nombre, así
 * que sin el pragma el paquete se publica sin tipos.
 *
 *   node scripts/preparar-jsr.mjs packages/toasts/jsr
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const raiz = process.argv[2];
if (!raiz) {
  console.error("Falta la carpeta. Uso: node scripts/preparar-jsr.mjs <carpeta>");
  process.exit(1);
}

const PRAGMA = /^\/\/ @ts-self-types=/;
let atados = 0;
let sinTipos = [];

const recorrer = (carpeta) => {
  for (const entrada of readdirSync(carpeta)) {
    const ruta = join(carpeta, entrada);
    if (statSync(ruta).isDirectory()) {
      recorrer(ruta);
      continue;
    }
    if (!entrada.endsWith(".js")) continue;

    const declaracion = entrada.replace(/\.js$/, ".d.ts");
    try {
      statSync(join(carpeta, declaracion));
    } catch {
      sinTipos.push(ruta);
      continue;
    }

    const texto = readFileSync(ruta, "utf8");
    if (PRAGMA.test(texto)) continue;
    writeFileSync(ruta, `// @ts-self-types="./${declaracion}"\n${texto}`);
    atados++;
  }
};

recorrer(raiz);

console.log(`${atados} módulos atados a su .d.ts en ${raiz}`);
if (sinTipos.length) {
  console.error(`Sin declaración (${sinTipos.length}):\n  ${sinTipos.join("\n  ")}`);
  process.exit(1);
}
