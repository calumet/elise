/**
 * La versión de cada paquete vive en dos archivos: `package.json` la usa GitHub
 * Packages y `deno.json` la usa JSR. Si se desincronizan no falla nada de forma
 * visible: `jsr publish` se salta las versiones ya publicadas, así que JSR se
 * queda callado en la vieja mientras GitHub Packages sigue avanzando.
 *
 *   node scripts/check-versions.mjs
 *
 * Sale con código 1 si hay desajustes, para poder colgarlo de CI.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => JSON.parse(readFileSync(path, "utf8"));

const members = read(join(root, "deno.json")).workspace;
const mismatches = [];

for (const member of members) {
  const folder = join(root, member);
  const npm = read(join(folder, "package.json")).version;
  const jsr = read(join(folder, "deno.json")).version;
  if (npm !== jsr) mismatches.push({ member, npm, jsr });
}

if (mismatches.length === 0) {
  console.log(`${members.length} paquetes con la versión sincronizada.`);
  process.exit(0);
}

console.error("La versión no coincide entre package.json y deno.json:\n");
for (const { member, npm, jsr } of mismatches) {
  console.error(`  ${member}\n    package.json ${npm}\n    deno.json    ${jsr}`);
}
process.exit(1);
