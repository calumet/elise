/**
 * La versión de cada paquete vive en dos archivos: `package.json` la usa GitHub
 * Packages y `deno.json` la usa JSR. Si se desincronizan no falla nada de forma
 * visible: `jsr publish` se salta las versiones ya publicadas, así que JSR se
 * queda callado en la vieja mientras GitHub Packages sigue avanzando.
 *
 *   node scripts/verificar-versiones.mjs
 *
 * Sale con código 1 si hay desajustes, para poder colgarlo de CI.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (ruta) => JSON.parse(readFileSync(ruta, "utf8"));

const miembros = leer(join(raiz, "deno.json")).workspace;
const desajustes = [];

for (const miembro of miembros) {
  const carpeta = join(raiz, miembro);
  const npm = leer(join(carpeta, "package.json")).version;
  const jsr = leer(join(carpeta, "deno.json")).version;
  if (npm !== jsr) desajustes.push({ miembro, npm, jsr });
}

if (desajustes.length === 0) {
  console.log(`${miembros.length} paquetes con la versión sincronizada.`);
  process.exit(0);
}

console.error("La versión no coincide entre package.json y deno.json:\n");
for (const { miembro, npm, jsr } of desajustes) {
  console.error(`  ${miembro}\n    package.json ${npm}\n    deno.json    ${jsr}`);
}
process.exit(1);
