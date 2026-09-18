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

| Config              | Para qué                            |
| ------------------- | ----------------------------------- |
| `oxlint.json`       | TypeScript e imports                |
| `oxlint.react.json` | Lo anterior más las reglas de React |

```json
// .oxlintrc.json
{
  "extends": ["./node_modules/@calumet/elise-linter/oxlint.json"]
}
```

`extends` resuelve rutas relativas al archivo que las escribe, de ahí el `./node_modules`.

## Prettier

```js
// prettier.config.js
import prettierConfig from "@calumet/elise-linter/prettier";

export default prettierConfig;
```

El detalle de las reglas está en [docs/linter.md](../../docs/linter.md).
