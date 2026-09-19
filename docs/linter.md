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

### Lo normal: `elise()`

```ts
// oxlint.config.ts
import { elise } from "@calumet/elise-linter/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig(elise({ theme: "src/index.css" }));
```

Trae React, las clases validadas contra el tema y las reglas de uso del
catálogo. `theme` es el CSS con `@import "tailwindcss"`; sin él no se validan
las clases. Con `designSystem: false` se apagan las reglas de uso.

Va entero y no por `extends` porque Oxlint no hereda `settings`. Juntar las
piezas a mano es justo donde se pierden, así que eso lo resuelve el paquete.

Abajo están sueltas, por si hace falta armar otra combinación.

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

### Uso del design system

`designSystem()` comprueba cómo se usan los componentes de Elise, no cómo están
hechos. Es para quien consume el catálogo, y {@link elise} ya la incluye.

Reconoce lo que llega de `@calumet/elise-*` y dice qué hacer en su lugar:

```
"font-mono" is not allowed on <Button>: <Button> owns its typography.
```

Trae un contrato por familia, que es lo que cada una acepta por encima de
`layout`: los contenedores admiten espaciado, los de texto admiten tipografía,
`Avatar` y compañía solo `size-*`, y un botón no fija su propio ancho. Se le
añaden más con `contracts`.

De las seis reglas del plugin enciende cuatro. `no-unknown-classes` la da ya
`tailwind()`, y `no-arbitrary-values` choca con las medidas de maquetación de
una página, que no son deuda; se pide con `rules` si se la quiere.

Para saldar lo que ya había, `severity`:

```ts
overrides: [{ files: ["src/legacy/**"], rules: designSystem({ severity: "warn" }).rules }];
```

Va así y no con un `"shadcn/no-restyle": "warn"` suelto, porque bajar el nivel
de esa forma reemplaza la regla entera y se lleva por delante los contratos.

Las reglas conservan el prefijo `shadcn/`, que es el del plugin que las
implementa hoy. El preset no: quien lo use pide que se vigile el uso de Elise,
no un plugin concreto.

Un límite de ese plugin: las sugerencias de variante (`{{variants}}`) solo
salen en componentes declarados como función. En los que van con
`React.forwardRef`, que en Elise son 46 de 88 archivos, el mensaje sale sin la
lista. El resto de la regla funciona igual.

### Accesibilidad

El preset `react` enciende 28 de las 35 reglas de `jsx-a11y`. Las siete que
quedan fuera se revisaron una por una sobre este catálogo, y sus hallazgos aquí
son falsos positivos por tres causas:

| Causa                                                                                                  | Reglas                                                                                                     |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Delegación**: el manejador vive en un contenedor que recoge el clic de un hijo que ya es interactivo | `click-events-have-key-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions` |
| **Props por spread**: el linter no ve el `href` ni los hijos que llegan en `{...props}`                | `anchor-has-content`                                                                                       |
| **Patrones ARIA sin equivalente nativo**: `listbox`, `option`, `application`, `status`                 | `prefer-tag-over-role`, `no-noninteractive-tabindex`, `no-autofocus`                                       |

La más ruidosa es `prefer-tag-over-role`, con 13 de los 24 hallazgos: pide un
`<option>` donde hay `role="option"`, y `<option>` solo existe dentro de un
`<select>`, donde no caben botones con contenido propio.

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
- shadcn/lint: https://github.com/shadcn-ui/lint
- Tailwind CSS: https://tailwindcss.com/docs

---

Volver a: [Guía de inicio](guia-inicio.md) | [Arquitectura](arquitectura.md) | [Referencias](referencias.md)
