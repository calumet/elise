# @calumet/elise-linter

Configuración compartida de ESLint y Prettier. Los proyectos de Calumet la consumen entera en vez de copiar reglas entre repositorios.

## Instalación

```bash
pnpm add -D jsr:@calumet/elise-linter   # JSR
pnpm add -D @calumet/elise-linter       # GitHub Packages
```

Requiere ESLint 9 y Prettier 3. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## ESLint

Tres configuraciones planas, cada una construida sobre la anterior:

| Config             | Para qué                                                        |
| ------------------ | --------------------------------------------------------------- |
| `configs.base`     | TypeScript y orden de imports                                   |
| `configs.react`    | Lo anterior más React y las reglas de hooks                     |
| `configs.tailwind` | Lo anterior más el orden y la validez de las clases de Tailwind |

```js
// eslint.config.js
import { configs } from "@calumet/elise-linter";

export default [...configs.react];
```

`configs.tailwind` carga `eslint-plugin-better-tailwindcss` recién cuando se accede a la propiedad, así que hay que instalarlo junto con `tailwindcss`. Si falta, ESLint corta con el comando de instalación en el mensaje.

## Prettier

```js
// prettier.config.js
import prettierConfig from "@calumet/elise-linter/prettier";

export default prettierConfig;
```

El detalle de las reglas está en [docs/linter.md](../../docs/linter.md).
