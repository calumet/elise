# @calumet/elise-themes

Las variables de tema de Elise como objeto, para una aplicación que las cambia en caliente: colores por inquilino, un editor de temas, un tema por sección.

## Instalación

```bash
pnpm add jsr:@calumet/elise-themes    # JSR
pnpm add @calumet/elise-themes        # GitHub Packages
```

No necesita React. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Uso

Un tema es cualquier subconjunto de las variables, con el nombre CSS como clave:

```ts
import { applyTheme, themeToCss, type EliseTheme } from "@calumet/elise-themes";

const tema: EliseTheme = { "--primary": "oklch(0.55 0.19 262)", "--radius": "0.75rem" };
```

En el navegador se escribe sobre un elemento, que por defecto es el `<html>`:

```ts
applyTheme(tema);
applyTheme(tema, seccion); // o sobre una sección, para combinarlo con ThemeScope
```

En el servidor se serializa y viaja dentro del HTML, que es lo que evita el parpadeo al hidratar:

```tsx
<style dangerouslySetInnerHTML={{ __html: themeToCss(tema) }} />
```

## Los temas de la hoja

`lightTheme` y `darkTheme` traen las 110 variables con el valor que les da `elise.css`, y `tokenKinds` dice de qué clase es cada una (`color`, `size`, `shadow` u `other`) para pintarle su control a un editor.

```ts
import { darkTheme, lightTheme, tokenKinds } from "@calumet/elise-themes";

const propio = { ...lightTheme, "--primary": colorDeLaEscuela };
```

Los tres salen de `elise.css` por generación, no por copia: los escribe `scripts/generate-tokens.mjs` en cada build leyendo la hoja de `@calumet/elise-ui`. Por eso las versiones de los dos paquetes van de la mano, y por eso `src/tokens.generated.ts` no se edita a mano.

Tematizable es toda variable que la hoja declara en `:root`, más las que redefina otro bloque de selector. Así entra `--spacing`, que vive en `@theme` porque Tailwind lo necesita en build pero la densidad compacta lo redefine en caliente.
