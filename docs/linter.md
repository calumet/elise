# Linter y Formato

`@calumet/elise-linter` centraliza la configuración de Oxlint y Oxfmt para proyectos TypeScript.

## Instalación

Instala las herramientas base en tu proyecto:

```bash
pnpm add -D @calumet/elise-linter oxlint oxfmt typescript
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

`tailwind(entryPoint)` valida las clases contra el tema del proyecto. Como el
tema es de cada proyecto, el `entryPoint` se pasa al extender; en un monorepo
acepta un mapeo de rutas a hojas:

```ts
export default defineConfig({
  extends: [react],
  ...tailwind([
    { files: ["packages/site/**"], use: "packages/site/src/index.css" },
    { files: ["**"], use: "packages/ui/src/tailwind/elise.css" },
  ]),
});
```

Va esparcido y no dentro de `extends` porque `extends` no fusiona `settings`.

El orden de las clases no entra ahí: lo arregla `sortTailwindcss` de Oxfmt al
formatear. Encender además `enforce-sort-order` reportaría lo mismo dos veces.

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

## Oxfmt

Oxfmt no tiene `extends`, así que la configuración se esparce:

```ts
// oxfmt.config.ts
import { defineConfig } from "oxfmt";

import formato from "@calumet/elise-linter/oxfmt";

export default defineConfig({ ...formato });
```

Formatea lo mismo que Prettier: TypeScript, JSX, JSON, Markdown, CSS y YAML.
Lo que se ignoraba en `.prettierignore` va en `ignorePatterns`.

Dos ajustes que el formato de Elise fija a propósito:

| Opción            | Valor   | Por qué                                                        |
| ----------------- | ------- | -------------------------------------------------------------- |
| `sortImports`     | `true`  | Es lo que reemplaza a `import/order`                           |
| `sortPackageJson` | `false` | Reordenar claves de un `package.json` es contenido, no formato |

`sortImports` mueve líneas de import enteras entre grupos y nunca toca los
nombres dentro de un import, ni borra uno sin usar, ni fusiona dos del mismo
módulo.

## Scripts sugeridos

```json
{
  "scripts": {
    "lint": "oxlint .",
    "lint:fix": "oxlint . --fix",
    "format": "oxfmt .",
    "format:check": "oxfmt --check ."
  }
}
```

## Referencias

- Oxlint: https://oxc.rs/docs/guide/usage/linter.html
- Oxfmt: https://oxc.rs/docs/guide/usage/formatter.html
- Tailwind CSS: https://tailwindcss.com/docs

---

Volver a: [Guía de inicio](guia-inicio.md) | [Arquitectura](arquitectura.md) | [Referencias](referencias.md)
