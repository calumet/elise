# @calumet/elise-linter

Configuración compartida de Oxlint y Prettier. Los proyectos de Calumet la consumen entera en vez de copiar reglas entre repositorios.

## Instalación

```bash
pnpm add -D jsr:@calumet/elise-linter   # JSR
pnpm add -D @calumet/elise-linter       # GitHub Packages
```

Requiere Oxlint 1.80 y Prettier 3. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

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

## Prettier

```js
// prettier.config.js
import prettierConfig from "@calumet/elise-linter/prettier";

export default prettierConfig;
```

El detalle de las reglas está en [docs/linter.md](../../docs/linter.md).
