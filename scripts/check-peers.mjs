import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => JSON.parse(readFileSync(path, "utf8"));

const packages = read(join(root, "deno.json")).workspace.map((member) =>
  read(join(root, member, "package.json")),
);
const versions = new Map(packages.map((p) => [p.name, p.version]));

const parse = (version) => version.split(".").map(Number);
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i += 1) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};
const caretAccepts = (base, version) => {
  const [b, v] = [parse(base), parse(version)];
  const sameLine = b[0] === 0 ? b[0] === v[0] && b[1] === v[1] : b[0] === v[0];
  return sameLine && compare(version, base) >= 0;
};

const publishedAgainst = async (name, version, dependency) => {
  const response = await fetch(`https://jsr.io/${name}/${version}_meta.json`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`jsr.io respondió ${response.status} para ${name}@${version}`);
  const meta = await response.json();
  const prefix = `jsr:${dependency}@`;
  for (const file of Object.values(meta.moduleGraph2 ?? {})) {
    for (const { specifier = "" } of file.dependencies ?? []) {
      if (specifier.startsWith(prefix)) return specifier.slice(prefix.length).split("/")[0];
    }
  }
  return undefined;
};

const errors = [];

for (const pkg of packages) {
  for (const [dependency, range] of Object.entries(pkg.peerDependencies ?? {})) {
    const current = versions.get(dependency);
    if (!current) continue;
    const where = `${pkg.name} → ${dependency}`;

    if (pkg.dependencies?.[dependency]) {
      errors.push(`${where}: va en peerDependencies y en devDependencies, no en dependencies.`);
    }

    const bounds = /^>=(\d+\.\d+\.\d+) <(\d+)\.0\.0$/.exec(range);
    if (!bounds) {
      errors.push(
        `${where}: el peer es "${range}". En 0.x, "^" no cruza la minor; escribe ">=${current} <1.0.0".`,
      );
    } else if (compare(bounds[1], current) > 0 || parse(current)[0] >= Number(bounds[2])) {
      errors.push(`${where}: "${range}" no admite la versión actual, ${current}.`);
    }

    const requirement = await publishedAgainst(pkg.name, pkg.version, dependency);
    if (requirement?.startsWith("^") && !caretAccepts(requirement.slice(1), current)) {
      errors.push(
        `${where}: ${pkg.name}@${pkg.version} ya está publicada en JSR contra ${requirement}, ` +
          `y ${dependency} va por ${current}. Sube la versión de ${pkg.name} para que se publique contra ella.`,
      );
    }
  }
}

if (errors.length === 0) {
  console.log("Los peers entre paquetes de Elise admiten las versiones actuales.");
  process.exit(0);
}

console.error(`Peers entre paquetes de Elise:\n\n  ${errors.join("\n  ")}`);
process.exit(1);
