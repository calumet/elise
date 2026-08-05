# Linter y Formato

`@calumet/elise-linter` centraliza la configuración de ESLint y Prettier para proyectos TypeScript.

## Instalación

Instala las herramientas base en tu proyecto:

```bash
pnpm add -D @calumet/elise-linter eslint prettier typescript
```

## ESLint (flat config)

### Opción 1: Base (Node, scripts, librerías sin React)

```js
// eslint.config.js
import { configs } from "@calumet/elise-linter";

export default [...configs.base];
```

### Opción 2: React (sin reglas Tailwind)

```js
// eslint.config.js
import { configs } from "@calumet/elise-linter";

export default [...configs.react];
```

### Opción 3: React + Tailwind

Para usar `configs.tailwind`, instala también las dependencias de Tailwind lint:

```bash
pnpm add -D tailwindcss eslint-plugin-better-tailwindcss
```

```js
// eslint.config.js
import { configs } from "@calumet/elise-linter";

export default [...configs.tailwind];
```

> `configs.tailwind` es opcional. Si no usas Tailwind, usa `base` o `react`.

## Prettier

```js
// prettier.config.js
import prettierConfig from "@calumet/elise-linter/prettier";

export default prettierConfig;
```

## Scripts sugeridos

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## Troubleshooting

Si ves un error al usar `configs.tailwind` diciendo que faltan dependencias, instala:

```bash
pnpm add -D tailwindcss eslint-plugin-better-tailwindcss
```

## Referencias

- ESLint: https://eslint.org/
- Prettier: https://prettier.io/
- Tailwind CSS: https://tailwindcss.com/docs

---

Volver a: [Guía de inicio](guia-inicio.md) | [Arquitectura](arquitectura.md) | [Referencias](referencias.md)
