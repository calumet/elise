# Linter y Formato

`@calumet/elise-linter` centraliza la configuración de Oxlint y Prettier para proyectos TypeScript.

## Instalación

Instala las herramientas base en tu proyecto:

```bash
pnpm add -D @calumet/elise-linter oxlint prettier typescript
```

## Oxlint

La configuración se extiende desde `node_modules`, porque `extends` resuelve
rutas relativas al archivo que las escribe.

### Opción 1: Base (Node, scripts, librerías sin React)

```json
// .oxlintrc.json
{
  "extends": ["./node_modules/@calumet/elise-linter/oxlint.json"]
}
```

### Opción 2: React

```json
// .oxlintrc.json
{
  "extends": ["./node_modules/@calumet/elise-linter/oxlint.react.json"]
}
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
