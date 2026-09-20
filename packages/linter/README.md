# @calumet/elise-linter

Configuración compartida de Oxlint y Oxfmt. Los proyectos de Calumet la consumen entera en vez de copiar reglas entre repositorios.

## Instalación

```bash
pnpm add -D jsr:@calumet/elise-linter   # JSR
pnpm add -D @calumet/elise-linter       # GitHub Packages
```

Requiere Oxlint 1.80 y Oxfmt 0.68. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

Dos de los presets cargan un plugin de oxlint, y ese plugin tiene que colgar del
proyecto: oxlint resuelve los `jsPlugins` desde ahí, no desde quien los declara.
Se instalan solo si se usan.

| Preset                           | Plugin               |
| -------------------------------- | -------------------- |
| `tailwind()`, `elise({ theme })` | `oxlint-tailwindcss` |
| `designSystem()`, `elise()`      | `@shadcn/lint`       |

```bash
pnpm add -D oxlint-tailwindcss @shadcn/lint
```

Con `base` o `react` a secas no hacen falta ninguno.

## Oxlint

Dos configuraciones, la de React construida sobre la base:

| Export  | Para qué                            |
| ------- | ----------------------------------- |
| `base`  | TypeScript e imports                |
| `react` | Lo anterior más las reglas de React |

```ts
// oxlint.config.ts
import { defineConfig } from "oxlint";

import { base } from "@calumet/elise-linter/oxlint";

export default defineConfig({ extends: [base] });
```

Va en `oxlint.config.ts` porque `.oxlintrc.json` no resuelve imports de paquetes. Necesita Node 22.18 o 24 en adelante.

## Oxfmt

Oxfmt no tiene `extends`, así que la configuración se esparce:

```ts
// oxfmt.config.ts
import { defineConfig } from "oxfmt";

import formato from "@calumet/elise-linter/oxfmt";

export default defineConfig({ ...formato });
```

El detalle de las reglas está en [docs/linter.md](../../docs/linter.md).
