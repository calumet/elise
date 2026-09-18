# Linter y Formato

`@calumet/elise-linter` centraliza la configuración de Oxlint y Prettier para proyectos TypeScript.

## Instalación

Instala las herramientas base en tu proyecto:

```bash
pnpm add -D @calumet/elise-linter oxlint prettier typescript
```

## Oxlint

El config va en `oxlint.config.ts` y no en `.oxlintrc.json`: el formato JSON no
resuelve imports de paquetes, así que es el único que puede extender una
configuración compartida. Necesita Node 22.18 o 24 en adelante.

### Opción 1: Base (Node, scripts, librerías sin React)

```ts
// oxlint.config.ts
import { defineConfig } from "oxlint";

import { base } from "@calumet/elise-linter/oxlint";

export default defineConfig({ extends: [base] });
```

### Opción 2: React

```ts
// oxlint.config.ts
import { defineConfig } from "oxlint";

import { react } from "@calumet/elise-linter/oxlint";

export default defineConfig({ extends: [react] });
```

Sobre las reglas de React que Oxlint trae de fábrica, el preset apaga la que
sobra con el runtime automático de React 19 y añade una convención:

| Regla                      | Severidad | Qué pide                                 |
| -------------------------- | --------- | ---------------------------------------- |
| `react/react-in-jsx-scope` | `off`     | El runtime automático no pide el import  |
| `react/jsx-pascal-case`    | `error`   | Los componentes se nombran en PascalCase |

`react/prop-types` no hace falta apagarla: Oxlint no la implementa.

Ninguno de los dos presets enciende la categoría `correctness` de Oxlint. Está
apagada para que la migración desde ESLint no cambiara lo que se exige; sobre
este repositorio son 114 hallazgos, y encenderla es un trabajo aparte.

### Tailwind

El preset de Tailwind no existe en esta versión. `eslint-plugin-better-tailwindcss`
se fue con ESLint, y el reemplazo, `oxlint-tailwindcss`, lee el `@theme` del
proyecto y por eso no se puede compartir desde aquí sin más.

### Variantes

Lo que en ESLint era concatenar arrays, aquí son tres cosas:

- **Añadir o pisar una regla**: un `rules` junto al `extends`. Gana siempre el
  que extiende sobre lo extendido.
- **Cambiar reglas para unas rutas**: un `overrides`, con su `files`. Es lo que
  hace este repositorio para declarar que `scripts/sonda-visual.js` corre en el
  navegador.
- **Cambiar reglas para una carpeta**: un `oxlint.config.ts` o un
  `.oxlintrc.json` dentro de ella. Oxlint los carga solo; el flag
  `--disable-nested-config` es para apagarlos.

## Prettier

```js
// prettier.config.js
import prettierConfig from "@calumet/elise-linter/prettier";

export default prettierConfig;
```

El orden de imports lo vigilaba `import/order`, que Oxlint no va a implementar.
Quien lo necesite puede añadir `@ianvs/prettier-plugin-sort-imports` a su
Prettier, teniendo en cuenta que además ordena los nombres dentro de cada
import.

## Scripts sugeridos

```json
{
  "scripts": {
    "lint": "oxlint .",
    "lint:fix": "oxlint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## Referencias

- Oxlint: https://oxc.rs/docs/guide/usage/linter.html
- Prettier: https://prettier.io/
- Tailwind CSS: https://tailwindcss.com/docs

---

Volver a: [Guía de inicio](guia-inicio.md) | [Arquitectura](arquitectura.md) | [Referencias](referencias.md)
