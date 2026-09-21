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

## El editor

`ThemeEditor` es el editor entero, listo para soltar en un sidebar o en una sheet. Es controlado y no guarda nada: recibe el tema y avisa del siguiente.

```tsx
import { ThemeEditor } from "@calumet/elise-themes";

<ThemeEditor value={tema} onChange={setTema} />;
<ThemeEditor value={tema} onChange={setTema} decisions={["brand", "corners", "density"]} />;
```

Lo que enseña no son las 110 variables sino doce decisiones con nombre: el color de marca, el de la página, el menú lateral, los cuatro colores de aviso, las líneas, las esquinas, el espaciado, el relieve y las dos tipografías. Cada una escribe entre una y dieciocho variables, y la tinta de encima nunca se elige: sale por contraste del color de abajo, así que un amarillo lleva letra oscura sin que nadie lo decida.

El color de la página es un color libre, no una lista de tonos, y de ahí sale todo el plano: las tarjetas, los bordes y la tinta. **Un color oscuro da un tema oscuro entero**, porque los escalones salen medidos de los dos temas de la hoja y no de una tabla escrita a mano.

Los rótulos viven en inglés y pasan por `@calumet/elise-i18n` bajo el espacio `themes`, con la clave `<decisión>.label`, `<decisión>.description` y `<decisión>.<opción>`. Sin Provider montado se ven en inglés; una app en español los traduce una vez en su catálogo.

La aplicación pone la vista previa. El paquete no trae pantalla, ni presets, ni guardado.

### Las tipografías

`FONT_FAMILIES` son las diez familias que `@calumet/elise-ui` lleva autoalojadas. La aplicación importa las que vaya a ofrecer, porque una familia que no se importa se ve con la fuente del sistema:

```css
@import "@calumet/elise-ui/tailwind/fonts/manrope.css";
@import "@calumet/elise-ui/tailwind/fonts/newsreader.css";
```

### Un control suelto

`DecisionControl` es una sola de esas decisiones, sin caja alrededor, para armar otra disposición:

```tsx
import { DECISIONS, DecisionControl } from "@calumet/elise-themes";

const marca = DECISIONS.find((decision) => decision.id === "brand");
<DecisionControl decision={marca} value={tema} onChange={setTema} />;
```

Los controles usan componentes de `@calumet/elise-ui`, así que hay que importar también su hoja:

```css
@import "@calumet/elise-themes/tailwind.css";
```

## El editor avanzado

`ThemeTokenEditor` enseña todas las variables, una por campo. Avanzado quiere decir que deja cambiarlo todo, no que pida saber CSS: no hay nombres de variable en pantalla, los colores salen en hex, los tamaños con deslizador y las sombras con cuatro controles.

```tsx
import { ThemeTokenEditor } from "@calumet/elise-themes";

<ThemeTokenEditor value={tema} onChange={setTema} />;
```

Va aparte de `ThemeEditor` a propósito: escriben el mismo objeto, pero no se parecen en nada y la aplicación decide si son dos pestañas, dos pantallas o un enlace escondido.

Los dos no pueden prometer lo mismo. El de decisiones corrige el contraste solo; este dice si el texto se lee, con los cortes de la WCAG, pero no corrige. Y marca las variables que alguna decisión escribe: tocarlas a mano ahí y después mover esa decisión pierde el valor.

Las capas (`--z-*`) quedan fuera hasta de este editor. Cambiar el orden de apilado no es apariencia, es romper los overlays.

## Traer variables propias

Una app puede tener tokens que Elise no tiene. El tema los admite y los conserva: `EliseTheme` acepta cualquier nombre con forma de variable CSS sin perder el autocompletado de las de Elise, y al importar un archivo se filtra por la forma del nombre, no por la lista, así que no se pierde nada por el camino.

Para que salgan en el editor avanzado se declaran en `extra`, con el control que les toca:

```tsx
import { ThemeTokenEditor, type CustomToken } from "@calumet/elise-themes";

const PROPIOS: CustomToken[] = [
  {
    name: "--surface",
    label: "Superficie",
    kind: "color",
    value: "color-mix(in oklab, var(--accent) 40%, transparent)",
    note: "La banda sobre la que se apoyan las tarjetas.",
  },
];

<ThemeTokenEditor value={tema} onChange={setTema} extra={PROPIOS} />;
```

| Campo   | Para qué                                                  |
| ------- | --------------------------------------------------------- |
| `name`  | La variable, con sus dos guiones                          |
| `label` | Cómo se llama en pantalla                                 |
| `kind`  | `color`, `size`, `shadow` u `other`, que elige el control |
| `value` | El valor de partida, cuando el tema todavía no la trae    |
| `note`  | Una línea de ayuda, si el nombre no se explica solo       |

### Cuando sigue a otra

El ejemplo de arriba no es un color suelto: es el acento al 40%. Un valor que lleva `var(--x)` dentro se reconoce como atado, y el editor dice a quién sigue en vez de ofrecer un selector, porque elegir un color ahí rompería el vínculo. Se resuelve en el navegador, así que cambiar el acento la repinta sin que nadie vuelva a tocarla.

Si la variable es una función pura de otras y no tiene por qué editarse, mejor no declararla: el `color-mix` vive en el CSS de la app y ya está.

### Una decisión propia

En el editor sencillo, `decisions` acepta tanto ids de Elise como decisiones escritas por el consumidor, así que se mezclan:

```tsx
<ThemeEditor value={tema} onChange={setTema} decisions={["brand", miDecision, "corners"]} />
```

Una decisión es un objeto con su rótulo, su grupo y dos funciones: `apply`, que dice qué escribe, y `read`, que dice qué está elegido mirando el tema. `set` y `clear` funcionan igual con las propias que con las de Elise.

## Los temas de la hoja

`lightTheme` y `darkTheme` traen las 110 variables con el valor que les da `elise.css`, y `tokenKinds` dice de qué clase es cada una (`color`, `size`, `shadow` u `other`) para pintarle su control a un editor.

```ts
import { darkTheme, lightTheme, tokenKinds } from "@calumet/elise-themes";

const propio = { ...lightTheme, "--primary": colorDeMarca };
```

Los tres salen de `elise.css` por generación, no por copia: los escribe `scripts/generate-tokens.mjs` en cada build leyendo la hoja de `@calumet/elise-ui`. Por eso las versiones de los dos paquetes van de la mano, y por eso `src/tokens.generated.ts` no se edita a mano.

Tematizable es toda variable que la hoja declara en `:root`, más las que redefina otro bloque de selector. Así entra `--spacing`, que vive en `@theme` porque Tailwind lo necesita en build pero la densidad compacta lo redefine en caliente.
