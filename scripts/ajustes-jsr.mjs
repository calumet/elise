/**
 * La descripción y la compatibilidad de runtime de un paquete son ajustes del
 * sitio de JSR, no campos del `deno.json`, y valen 2 de los 17 puntos del
 * score. Este script los empuja por la API en vez de repetir el formulario ocho
 * veces, y toma la descripción del `package.json` para no mantenerla en dos
 * lados.
 *
 *   node scripts/ajustes-jsr.mjs              # muestra qué cambiaría
 *   node scripts/ajustes-jsr.mjs --aplicar    # lo escribe
 *
 * Necesita un token con permiso sobre el scope, de https://jsr.io/account/tokens,
 * en la variable JSR_TOKEN. No lo guardes en el repositorio.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (ruta) => JSON.parse(readFileSync(ruta, "utf8"));

const SCOPE = "calumet";
const API = "https://api.jsr.io";

/* Los runtimes se marcan por lo que el código necesita de verdad, no por lo que
   podría llegar a andar. Los siete paquetes de React se usan en el navegador y
   renderizan en servidor, así que van los cuatro. `elise-linter` importa
   `node:module`, de modo que el navegador queda afuera. `workerd` no lo marca
   ninguno porque nadie los corrió ahí. */
const RUNTIMES_REACT = { browser: true, deno: true, node: true, bun: true, workerd: false };
const RUNTIMES_NODE = { browser: false, deno: true, node: true, bun: true, workerd: false };

const aplicar = process.argv.includes("--aplicar");
const token = process.env.JSR_TOKEN;

if (aplicar && !token) {
  console.error("Falta JSR_TOKEN. Creá uno en https://jsr.io/account/tokens");
  process.exit(1);
}

const parchar = async (paquete, cuerpo) => {
  const res = await fetch(`${API}/scopes/${SCOPE}/packages/${paquete}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  if (!res.ok) throw new Error(`${paquete}: ${res.status} ${await res.text()}`);
};

let fallos = 0;

for (const miembro of leer(join(raiz, "deno.json")).workspace) {
  const carpeta = join(raiz, miembro);
  const { description } = leer(join(carpeta, "package.json"));
  const paquete = leer(join(carpeta, "deno.json")).name.split("/")[1];
  const runtimes = paquete === "elise-linter" ? RUNTIMES_NODE : RUNTIMES_REACT;
  const marcados = Object.entries(runtimes)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(", ");

  if (!description) {
    console.error(`${paquete}: sin description en package.json`);
    fallos++;
    continue;
  }

  console.log(`${paquete}\n  ${description}\n  ${marcados}`);

  if (!aplicar) continue;
  try {
    await parchar(paquete, { description });
    await parchar(paquete, { runtimeCompat: runtimes });
  } catch (error) {
    console.error(`  ERROR ${error.message}`);
    fallos++;
  }
}

if (!aplicar) console.log("\nEnsayo. Corré con --aplicar para escribirlo.");
process.exit(fallos ? 1 : 0);
