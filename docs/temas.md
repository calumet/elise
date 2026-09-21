# Temas

Elise incluye un sistema de temas basado en CSS custom properties con soporte para modo claro y oscuro. Los colores usan el espacio de color [oklch](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) para mejor percepción y consistencia.

## ThemeProvider

Componente que gestiona el tema activo, lo persiste en localStorage y lo aplica al DOM. Vive en [`@calumet/elise-themes`](../packages/themes/README.md).

```tsx
import { ThemeProvider } from "@calumet/elise-themes";

<ThemeProvider attribute="class" storageKey="elise-theme" defaultTheme="light">
  <App />
</ThemeProvider>;
```

Monta además un script en línea que lee la preferencia mientras el navegador parsea el HTML, antes del primer pintado, así que una app con render en servidor no parpadea en claro en cada carga. Por eso conviene que el provider envuelva lo más alto posible del árbol.

El script marca el `<html>` y el provider arranca leyendo la misma preferencia con la misma regla, así que React hidrata con el tema que ya está puesto y no hay desajuste. `suppressHydrationWarning` solo hace falta donde el `<html>` lo renderiza React, como en el App Router de Next; si la app monta en un nodo de dentro, React no compara ese elemento.

### Props

| Prop           | Tipo                      | Default         | Descripción                                                                                             |
| -------------- | ------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `attribute`    | `"class" \| "data-theme"` | `"class"`       | `"class"` agrega/quita la clase `.dark` en `<html>`. `"data-theme"` usa el atributo `data-theme="dark"` |
| `storageKey`   | `string`                  | `"elise-theme"` | Clave de localStorage para persistir la preferencia del usuario                                         |
| `defaultTheme` | `"light" \| "dark"`       | `"light"`       | Tema inicial cuando no hay preferencia guardada                                                         |
| `forcedTheme`  | `"light" \| "dark"`       | —               | Fuerza un tema específico, ignorando la preferencia guardada. Con él no se monta el script              |
| `nonce`        | `string`                  | —               | Firma el script en línea, para una política de contenido que la exija                                   |

## Hook `useTheme()`

Hook para leer y cambiar el tema desde cualquier componente dentro del ThemeProvider.

```tsx
import { useTheme } from "@calumet/elise-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Tema actual: {theme}
    </button>
  );
}
```

> `useTheme()` debe usarse dentro de un `ThemeProvider`. Lanzará un error si se usa fuera.

## Tokens CSS

Los temas se implementan vía CSS custom properties definidas en `@calumet/elise-ui/tailwind/elise.css`. Cada token se mapea automáticamente a utilidades de Tailwind CSS v4 mediante el bloque `@theme inline`.

### Colores semánticos

| Token CSS                  | Utilidad Tailwind             | Propósito                                     |
| -------------------------- | ----------------------------- | --------------------------------------------- |
| `--background`             | `bg-background`               | Fondo principal de la página                  |
| `--foreground`             | `text-foreground`             | Texto principal                               |
| `--canvas`                 | `bg-canvas`                   | Lienzo del marco, bajo las tarjetas           |
| `--card`                   | `bg-card`                     | Fondo de tarjetas y superficies elevadas      |
| `--card-foreground`        | `text-card-foreground`        | Texto sobre superficies card                  |
| `--popover`                | `bg-popover`                  | Fondo de menús flotantes, dropdowns, popovers |
| `--popover-foreground`     | `text-popover-foreground`     | Texto sobre superficies popover               |
| `--primary`                | `bg-primary`, `text-primary`  | Color primario (azul)                         |
| `--primary-foreground`     | `text-primary-foreground`     | Texto sobre fondo primario                    |
| `--secondary`              | `bg-secondary`                | Fondos secundarios                            |
| `--secondary-foreground`   | `text-secondary-foreground`   | Texto sobre fondo secundario                  |
| `--muted`                  | `bg-muted`                    | Fondos sutiles, hovers                        |
| `--muted-foreground`       | `text-muted-foreground`       | Texto secundario/gris                         |
| `--accent`                 | `bg-accent`                   | Color de acento                               |
| `--accent-foreground`      | `text-accent-foreground`      | Texto sobre fondo de acento                   |
| `--destructive`            | `bg-destructive`              | Acciones destructivas/errores                 |
| `--destructive-foreground` | `text-destructive-foreground` | Texto sobre fondo destructive                 |
| `--border`                 | `border-border`               | Divisores y bordes estándar                   |
| `--border-strong`          | `border-border-strong`        | Contorno de controles (botones outline)       |
| `--input`                  | `border-input`                | Bordes de campos de entrada                   |
| `--ring`                   | `ring-ring`                   | Anillo de focus                               |
| `--success`                | `bg-success`, `text-success`  | Éxito                                         |
| `--warning`                | `bg-warning`, `text-warning`  | Advertencia                                   |
| `--info`                   | `bg-info`, `text-info`        | Información                                   |

> `--border`, `--border-strong` e `--input` son tres valores distintos a propósito,
> porque los divisores son más claros que el contorno de un control y un campo de
> entrada necesita más peso que ambos para leerse como editable.

### Superficies con escala propia

`--muted-foreground` está calibrado contra las superficies de la raíz: encima de
`--background`, `--card`, `--popover`, `--secondary` y `--muted` se lee entre 5.0
y 6.7 en los dos temas. Dos superficies caen fuera de esa escala y llevan la
suya, así que el texto secundario no se resuelve con opacidades a ojo.

| Token CSS                    | Utilidad Tailwind               | Descripción                                  |
| ---------------------------- | ------------------------------- | -------------------------------------------- |
| `--inverse`                  | `bg-inverse`                    | La capa que va encima de todo, como un toast |
| `--inverse-foreground`       | `text-inverse-foreground`       | Texto principal de la franja invertida       |
| `--inverse-muted-foreground` | `text-inverse-muted-foreground` | Texto secundario de la franja invertida      |
| `--sidebar-muted-foreground` | `text-sidebar-muted-foreground` | Texto secundario del riel de navegación      |
| `--inverse-info`             | `text-inverse-info`             | Tinta de estado sobre la franja invertida    |
| `--inverse-success`          | `text-inverse-success`          | Tinta de éxito sobre la franja invertida     |
| `--inverse-warning`          | `text-inverse-warning`          | Tinta de advertencia sobre la franja         |
| `--inverse-danger`           | `text-inverse-danger`           | Tinta de error sobre la franja               |
| `--inverse-border-subtle`    | `border-inverse-border-subtle`  | Línea tenue sobre la franja invertida        |
| `--inverse-border`           | `border-inverse-border`         | Divisor sobre la franja invertida            |
| `--inverse-input`            | `border-inverse-input`          | Borde de campo sobre la franja invertida     |
| `--inverse-border-strong`    | `border-inverse-border-strong`  | Contorno de control sobre la franja          |

No hace falta nombrarlos en cada sitio. Las dos superficies declaran su par en el
propio elemento, de modo que `Text tone="muted"` y `text-muted-foreground`
resuelven contra ellas y no contra la página:

```tsx
<Box background="inverse" padding={4} radius="xl">
  <Text weight="semibold">Guardado</Text>
  <Text tone="muted">Cambios sincronizados</Text>
</Box>
```

Cada una reapunta las tres escalas que la raíz calibra contra superficies
claras: el par de texto, la tinta de estado con la que se pinta un icono de
éxito o de error, y las líneas. Un `Separator` dentro de la franja sale como
pelo y no como raya blanca, y en el riel sale con `--sidebar-border`, que es la
línea que ya tenía.

Es el mismo mecanismo que usa la cabecera del `AppShell` con `data-theme="dark"`.
Quien pinte la franja a mano tiene las listas de clases en `INVERSE_SURFACE` y
`SIDEBAR_SURFACE`, que se exportan desde `@calumet/elise-ui/box`.

### Estados de los rellenos sólidos

Cada relleno sólido tiene sus propios tokens de `hover` y `active`. No se derivan
con opacidad, ya que `bg-primary/90` compone el color contra la página, o sea que
mueve el relleno _hacia_ el fondo y el hover termina bajando el contraste. Estos
tokens hacen lo contrario. En el tema claro oscurecen y en el oscuro aclaran; en
ambos casos se alejan del fondo.

| Token CSS              | Utilidad Tailwind       | Propósito                       |
| ---------------------- | ----------------------- | ------------------------------- |
| `--primary-hover`      | `bg-primary-hover`      | Hover del relleno primario      |
| `--primary-active`     | `bg-primary-active`     | Presionado del relleno primario |
| `--destructive-hover`  | `bg-destructive-hover`  | Hover destructive               |
| `--destructive-active` | `bg-destructive-active` | Presionado destructive          |
| `--success-hover`      | `bg-success-hover`      | Hover success                   |
| `--success-active`     | `bg-success-active`     | Presionado success              |
| `--warning-hover`      | `bg-warning-hover`      | Hover warning                   |
| `--warning-active`     | `bg-warning-active`     | Presionado warning              |
| `--info-hover`         | `bg-info-hover`         | Hover info                      |
| `--info-active`        | `bg-info-active`        | Presionado info                 |

Las variantes `outline` y `ghost` no usan estos tokens, dado que sobre fondo
transparente el hover se resuelve con `bg-muted` o con la superficie sutil del
estado.

> **Excepción:** en el tema oscuro `destructive` también oscurece. Lleva texto
> blanco y aclararlo lo baja de 4.5:1. Igual queda muy separado del fondo
> (`0.577` contra `0.172`), y de paso el hover sube el contraste del texto.
> Todos los pares de color del tema cumplen WCAG AA (>=4.5:1) en ambos temas.

### Superficies sutiles de estado

Cada estado tiene una superficie propia para fondos suaves (badges, alerts, filas
resaltadas), en lugar de derivarla con opacidad sobre el color sólido. Un
`bg-success/10` se enloda sobre fondo oscuro; un token se define para cada tema.

| Token CSS                         | Utilidad Tailwind                    | Propósito                           |
| --------------------------------- | ------------------------------------ | ----------------------------------- |
| `--success-subtle`                | `bg-success-subtle`                  | Fondo suave de éxito                |
| `--success-subtle-foreground`     | `text-success-subtle-foreground`     | Texto sobre `bg-success-subtle`     |
| `--warning-subtle`                | `bg-warning-subtle`                  | Fondo suave de advertencia          |
| `--warning-subtle-foreground`     | `text-warning-subtle-foreground`     | Texto sobre `bg-warning-subtle`     |
| `--destructive-subtle`            | `bg-destructive-subtle`              | Fondo suave de error                |
| `--destructive-subtle-foreground` | `text-destructive-subtle-foreground` | Texto sobre `bg-destructive-subtle` |
| `--info-subtle`                   | `bg-info-subtle`                     | Fondo suave informativo             |
| `--info-subtle-foreground`        | `text-info-subtle-foreground`        | Texto sobre `bg-info-subtle`        |

#### Los sólidos son relleno, no texto

`--success`, `--warning`, `--destructive` e `--info` están calibrados para
llevar texto encima, y no para ser el texto. Puestos con `text-*` sobre las
superficies normales del tema, tres de los cuatro caen por debajo del 4.5:1 que
pide WCAG AA:

| Sólido como texto      | Sobre `--background` | Sobre `--card` |
| ---------------------- | -------------------- | -------------- |
| `warning` (claro)      | 2.18:1               | 2.28:1         |
| `info` (claro)         | 4.48:1               | 4.68:1         |
| `destructive` (oscuro) | 3.93:1               | 3.60:1         |
| `success` (claro)      | 4.85:1               | 5.06:1         |

Solo `success` pasa en los dos temas. Los `-subtle-foreground` pasan siempre y
con margen, ya que el peor de todos da 7.30:1.

La regla práctica queda así. El sólido pinta fondos y bordes; el
`-subtle-foreground` pinta cualquier cosa que se lea.

| Para                               | Va                                         |
| ---------------------------------- | ------------------------------------------ |
| Relleno de un botón o badge sólido | `bg-warning` con `text-warning-foreground` |
| Borde de una variante `outline`    | `border-warning`                           |
| Texto, icono o símbolo de estado   | `text-warning-subtle-foreground`           |

El borde si puede usar el sólido, porque WCAG pide 3:1 para elementos no
textuales y ahí todos llegan. De ahí que un `outline` de estado combine las dos
cosas, el borde del sólido y el texto del `-subtle-foreground`. Así están
resueltos `Badge`, las variantes `outline` y `ghost` de `Button`, y el asterisco
de campo obligatorio de `Field`.

### Colores de charts

| Token CSS   | Utilidad Tailwind  |
| ----------- | ------------------ |
| `--chart-1` | `bg-chart-1`, etc. |
| `--chart-2` | `bg-chart-2`       |
| `--chart-3` | `bg-chart-3`       |
| `--chart-4` | `bg-chart-4`       |
| `--chart-5` | `bg-chart-5`       |

### Colores de sidebar

| Token CSS                      | Utilidad Tailwind                 |
| ------------------------------ | --------------------------------- |
| `--sidebar`                    | `bg-sidebar`                      |
| `--sidebar-foreground`         | `text-sidebar-foreground`         |
| `--sidebar-muted-foreground`   | `text-sidebar-muted-foreground`   |
| `--sidebar-primary`            | `bg-sidebar-primary`              |
| `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` |
| `--sidebar-accent`             | `bg-sidebar-accent`               |
| `--sidebar-accent-foreground`  | `text-sidebar-accent-foreground`  |
| `--sidebar-border`             | `border-sidebar-border`           |
| `--sidebar-ring`               | `ring-sidebar-ring`               |

### Otros tokens

| Token CSS              | Utilidad Tailwind                                      | Descripción                                               |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| `--radius`             | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` | Radio base (0.5rem). La escala lo multiplica con `calc()` |
| `--shadow-2xs`         | `shadow-2xs`                                           | Sombra mínima                                             |
| `--shadow-xs`          | `shadow-xs`                                            | Sombra extra-pequeña                                      |
| `--shadow-sm`          | `shadow-sm`                                            | Sombra pequeña (tarjetas)                                 |
| `--shadow`             | `shadow`                                               | Sombra por defecto                                        |
| `--shadow-md`          | `shadow-md`                                            | Sombra mediana                                            |
| `--shadow-lg`          | `shadow-lg`                                            | Sombra grande (menús, popovers)                           |
| `--shadow-xl`          | `shadow-xl`                                            | Sombra extra-grande (diálogos)                            |
| `--shadow-2xl`         | `shadow-2xl`                                           | Sombra máxima                                             |
| `--shadow-bevel`       | `shadow-bevel`                                         | Bisel `inset` para rellenos sólidos                       |
| `--shadow-bevel-inset` | `shadow-bevel-inset`                                   | Bisel invertido: estado presionado                        |
| `--font-sans`          | `font-sans`                                            | Geist, system-ui                                          |
| `--font-serif`         | `font-serif`                                           | Source Serif 4, serif                                     |
| `--font-mono`          | `font-mono`                                            | JetBrains Mono, monospace                                 |
| `--duration-fast`      | `duration-(--duration-fast)`                           | 140ms para hovers y cambios de color                      |
| `--duration-base`      | `duration-(--duration-base)`                           | 200ms para entradas y salidas                             |
| `--duration-slow`      | `duration-(--duration-slow)`                           | 320ms para sheets y drawers                               |

### Tipografías

Las tres familias vienen incluidas en el paquete como fuentes variables y se
cargan importando `@calumet/elise-ui/tailwind/fonts.css` (ver
[Guía de inicio](guia-inicio.md)). Sin ese import, los tokens caen en la fuente
del sistema y la app se ve distinta en cada sistema operativo.

Cada stack lista primero el nombre que registra Fontsource y después el nombre
plano, así resuelve tanto con `fonts.css` como si la app carga la fuente por su
cuenta:

```css
--font-sans: "Geist Variable", "Geist", ui-sans-serif, system-ui, …;
--font-serif: "Source Serif 4 Variable", "Source Serif 4", ui-serif, Georgia, serif;
--font-mono: "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, …;
--font-display: var(--font-sans);
```

`--font-display` es la familia de los titulares, y la usa `Heading` y nadie más.
Cae en `--font-sans` mientras no se defina, así que un proyecto con una sola
fuente no tiene que tocarla.

#### Emparejar dos familias

Un portal que deja elegir el emparejamiento tipográfico necesita más de las tres
que vienen. Además de las tres, el paquete trae siete familias variables más,
cada una en su propia entrada:

| Entrada                                    | Registra                       |
| ------------------------------------------ | ------------------------------ |
| `…/tailwind/fonts/geist.css`               | `Geist Variable`               |
| `…/tailwind/fonts/jetbrains-mono.css`      | `JetBrains Mono Variable`      |
| `…/tailwind/fonts/source-serif-4.css`      | `Source Serif 4 Variable`      |
| `…/tailwind/fonts/bricolage-grotesque.css` | `Bricolage Grotesque Variable` |
| `…/tailwind/fonts/manrope.css`             | `Manrope Variable`             |
| `…/tailwind/fonts/ibm-plex-sans.css`       | `IBM Plex Sans Variable`       |
| `…/tailwind/fonts/space-grotesk.css`       | `Space Grotesk Variable`       |
| `…/tailwind/fonts/public-sans.css`         | `Public Sans Variable`         |
| `…/tailwind/fonts/newsreader.css`          | `Newsreader Variable`          |
| `…/tailwind/fonts/archivo.css`             | `Archivo Variable`             |

Se importan las que se usen, en vez de `fonts.css`:

```css
@import "@calumet/elise-ui/tailwind/fonts/bricolage-grotesque.css";
@import "@calumet/elise-ui/tailwind/fonts/manrope.css";
@import "@calumet/elise-ui/tailwind/fonts/jetbrains-mono.css";
@import "@calumet/elise-ui/tailwind/elise.css";

:root {
  --font-display: "Bricolage Grotesque Variable", ui-sans-serif, sans-serif;
  --font-sans: "Manrope Variable", ui-sans-serif, sans-serif;
}
```

Las siete van como dependencias opcionales, así que no se instalan en quien no
las va a servir. Van sueltas y no todas dentro de `fonts.css` porque cada
`@font-face` de Fontsource lleva su `unicode-range` y el navegador no pide el
binario de una familia que ninguna regla usa, pero el CSS sí viaja entero: las
diez juntas son unos 55 bloques y 21 KB en el camino crítico del render, para
una app que usa tres.

En la escala de sombras el blur, el spread negativo y la opacidad crecen juntos, y
el modo oscuro define su propio juego de valores (una sombra negra al 10% es
invisible sobre el fondo oscuro). `shadow-bevel` queda fuera de esa escala. Se
combina con un fondo sólido para darle un borde inferior oscuro y un highlight
superior, de modo que el relleno se lea como un objeto y no como un plano de color.
`shadow-bevel-inset` lo invierte hacia adentro y se usa en `active:`, para que el
estado presionado se sienta hundido en lugar de solo cambiar de color.

### Radios por rol

Los componentes no eligen radio libremente. La convención es:

| Rol                                                 | Utilidad       | Valor |
| --------------------------------------------------- | -------------- | ----- |
| Superficies (Card, Dialog, Popover, menús, Toast)   | `rounded-xl`   | 12px  |
| Controles y barras (Button, Input, Select, Toolbar) | `rounded-md`   | 8px   |
| Items dentro de una superficie (opciones de menú)   | `rounded-sm`   | 6px   |
| Píldoras y avatares                                 | `rounded-full` | —     |

### Tipografía

Cada tamaño trae su interlineado y su tracking emparejados, así que `text-sm` ya
aplica los tres valores. El tracking se aprieta progresivamente al crecer el
tamaño (corrección óptica). El chrome de la UI vive en `text-sm` y `text-base`.

| Utilidad    | Tamaño | Interlineado | Tracking   |
| ----------- | ------ | ------------ | ---------- |
| `text-2xs`  | 11px   | 16px         | `0.01em`   |
| `text-xs`   | 12px   | 16px         | `0.005em`  |
| `text-sm`   | 13px   | 20px         | `-0.006em` |
| `text-base` | 14px   | 20px         | `-0.01em`  |
| `text-lg`   | 16px   | 24px         | `-0.014em` |
| `text-xl`   | 20px   | 28px         | `-0.018em` |
| `text-2xl`  | 24px   | 32px         | `-0.022em` |
| `text-3xl`  | 30px   | 36px         | `-0.026em` |

### Curvas de animación

| Utilidad      | Valor                            |
| ------------- | -------------------------------- |
| `ease-out`    | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |

`elise.css` también incluye un bloque `@media (prefers-reduced-motion: reduce)` que
neutraliza transiciones y animaciones para quien lo tenga activado.

## Usando los colores en Tailwind

Los tokens se usan directamente como utilidades de Tailwind. Cada token de color funciona con cualquier propiedad CSS:

```html
<!-- Fondos -->
<div class="bg-background">...</div>
<div class="bg-card">...</div>
<div class="bg-primary">...</div>
<div class="bg-muted">...</div>

<!-- Texto -->
<p class="text-foreground">Texto principal</p>
<p class="text-muted-foreground">Texto secundario</p>
<p class="text-primary">Texto en color primario</p>

<!-- Bordes -->
<div class="border border-border">...</div>
<input class="border border-input" />

<!-- Focus -->
<button class="focus-visible:ring-2 focus-visible:ring-ring">...</button>

<!-- Estados con opacidad -->
<button class="bg-primary hover:bg-primary-hover active:bg-primary-active">Boton</button>

<!-- Destructive -->
<button class="bg-destructive text-destructive-foreground">Eliminar</button>

<!-- Success/Warning: cada estado tiene su propio foreground -->
<span class="bg-success text-success-foreground">Exito</span>
<span class="bg-warning text-warning-foreground">Alerta</span>

<!-- Fondos suaves: usa la superficie sutil, no opacidad sobre el solido -->
<span class="bg-success-subtle text-success-subtle-foreground">Publicado</span>
<span class="bg-warning-subtle text-warning-subtle-foreground">Pendiente</span>
<span class="bg-destructive-subtle text-destructive-subtle-foreground">Fallido</span>
```

> Cada color de estado tiene su propio `-foreground`. No uses
> `text-destructive-foreground` sobre `bg-warning`, porque el warning lleva texto
> oscuro para cumplir contraste y el destructive lo lleva blanco.

> Los estados hover/active de los rellenos sólidos usan tokens propios
> (`bg-primary-hover`, `bg-primary-active`), no modificadores de opacidad. Ver
> [Estados de los rellenos sólidos](#estados-de-los-rellenos-sólidos).

## Valores por defecto

### Tema claro (`:root`)

Los neutrales llevan una croma mínima (0.002–0.016) sesgada hacia el hue del
primario. Un gris de croma 0 se lee como heredado del default; uno con un sesgo
apenas perceptible se lee como elegido.

| Token                         | Valor oklch              |
| ----------------------------- | ------------------------ |
| background                    | `oklch(0.984 0.002 265)` |
| foreground                    | `oklch(0.21 0.012 265)`  |
| canvas                        | `oklch(0.958 0.002 265)` |
| card                          | `oklch(1 0 0)`           |
| card-foreground               | `oklch(0.21 0.012 265)`  |
| popover                       | `oklch(1 0 0)`           |
| popover-foreground            | `oklch(0.21 0.012 265)`  |
| primary                       | `oklch(0.55 0.19 262)`   |
| primary-foreground            | `oklch(1 0 0)`           |
| secondary                     | `oklch(0.968 0.004 265)` |
| secondary-foreground          | `oklch(0.37 0.02 265)`   |
| muted                         | `oklch(0.965 0.004 265)` |
| muted-foreground              | `oklch(0.548 0.016 265)` |
| accent                        | `oklch(0.955 0.025 250)` |
| accent-foreground             | `oklch(0.38 0.14 262)`   |
| destructive                   | `oklch(0.577 0.225 27)`  |
| destructive-foreground        | `oklch(1 0 0)`           |
| border                        | `oklch(0.922 0.005 265)` |
| border-strong                 | `oklch(0.865 0.008 265)` |
| input                         | `oklch(0.878 0.007 265)` |
| ring                          | `oklch(0.55 0.19 262)`   |
| success                       | `oklch(0.52 0.15 152)`   |
| warning                       | `oklch(0.75 0.15 75)`    |
| info                          | `oklch(0.55 0.15 240)`   |
| success-subtle                | `oklch(0.962 0.032 152)` |
| success-subtle-foreground     | `oklch(0.40 0.11 152)`   |
| warning-subtle                | `oklch(0.965 0.045 85)`  |
| warning-subtle-foreground     | `oklch(0.45 0.10 70)`    |
| destructive-subtle            | `oklch(0.962 0.03 25)`   |
| destructive-subtle-foreground | `oklch(0.45 0.17 27)`    |
| info-subtle                   | `oklch(0.962 0.028 240)` |
| info-subtle-foreground        | `oklch(0.42 0.12 245)`   |

### Tema oscuro (`.dark` / `[data-theme="dark"]`)

El primario se aclara de `0.55` a `0.655`, ya que el mismo valor del modo claro
queda apagado sobre el fondo oscuro. Al aclararlo, su `-foreground` pasa a ser
oscuro para mantener el contraste AA. `popover` se eleva por encima de `card` en
vez de compartir su valor.

| Token                         | Valor oklch              |
| ----------------------------- | ------------------------ |
| background                    | `oklch(0.172 0.008 265)` |
| foreground                    | `oklch(0.962 0.003 265)` |
| card                          | `oklch(0.216 0.011 265)` |
| card-foreground               | `oklch(0.962 0.003 265)` |
| popover                       | `oklch(0.235 0.012 265)` |
| popover-foreground            | `oklch(0.962 0.003 265)` |
| primary                       | `oklch(0.655 0.17 262)`  |
| primary-foreground            | `oklch(0.17 0.03 262)`   |
| secondary                     | `oklch(0.262 0.012 265)` |
| secondary-foreground          | `oklch(0.93 0.005 265)`  |
| muted                         | `oklch(0.262 0.012 265)` |
| muted-foreground              | `oklch(0.685 0.014 265)` |
| accent                        | `oklch(0.33 0.09 262)`   |
| accent-foreground             | `oklch(0.89 0.06 255)`   |
| destructive                   | `oklch(0.62 0.21 27)`    |
| destructive-foreground        | `oklch(1 0 0)`           |
| border                        | `oklch(0.302 0.013 265)` |
| border-strong                 | `oklch(0.38 0.016 265)`  |
| input                         | `oklch(0.36 0.015 265)`  |
| ring                          | `oklch(0.655 0.17 262)`  |
| success                       | `oklch(0.68 0.15 152)`   |
| warning                       | `oklch(0.80 0.14 75)`    |
| info                          | `oklch(0.68 0.14 240)`   |
| success-subtle                | `oklch(0.28 0.05 152)`   |
| success-subtle-foreground     | `oklch(0.86 0.12 152)`   |
| warning-subtle                | `oklch(0.30 0.05 75)`    |
| warning-subtle-foreground     | `oklch(0.88 0.11 82)`    |
| destructive-subtle            | `oklch(0.285 0.06 27)`   |
| destructive-subtle-foreground | `oklch(0.85 0.11 27)`    |
| info-subtle                   | `oklch(0.285 0.055 240)` |
| info-subtle-foreground        | `oklch(0.85 0.10 240)`   |

## Sobrescribir el tema con CSS

La forma más directa de personalizar Elise es redefinir las CSS custom properties en tu propio CSS. Esto funciona porque los tokens se resuelven en tiempo de ejecución.

### Cambiar colores globalmente

En tu CSS principal (después de importar `elise.css`), redefine los tokens que quieras cambiar:

```css
@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

/* Sobrescribir colores del tema claro */
:root {
  --primary: oklch(0.55 0.2 150); /* verde en lugar de azul */
  --primary-foreground: oklch(1 0 0);
  --ring: oklch(0.55 0.2 150);
  --accent: oklch(0.9 0.05 150);
  --accent-foreground: oklch(0.3 0.15 150);
}

/* Sobrescribir colores del tema oscuro */
.dark {
  --primary: oklch(0.65 0.18 150);
  --primary-foreground: oklch(1 0 0);
  --ring: oklch(0.65 0.18 150);
}
```

Solo necesitas redefinir los tokens que quieras cambiar — los demás mantienen sus valores por defecto.

### Tema por sección

Puedes aplicar tokens diferentes a secciones específicas de la página:

```css
.seccion-marketing {
  --primary: oklch(0.7 0.15 30);
  --primary-foreground: oklch(1 0 0);
  --accent: oklch(0.92 0.04 30);
}
```

```html
<div class="seccion-marketing">
  <!-- Los componentes de Elise aqui usaran los colores personalizados -->
  <button variant="solid">Comprar ahora</button>
</div>
```

#### Los overlays necesitan `ThemeScope`

Un `Dialog`, un `Popover`, un `Select`, un `Tooltip` o cualquiera de los menús se
monta en `body` por un portal, así que sale de la sección y deja atrás sus
tokens: el panel se pinta con el tema de la página. `ThemeScope` lo resuelve
llevándole el tema al panel, sin mover el portal.

```tsx
import { ThemeScope } from "@calumet/elise-ui/theme-scope";

<ThemeScope theme="seccion-marketing">
  <Popover>
    <PopoverTrigger asChild>
      <Button>Ver</Button>
    </PopoverTrigger>
    {/* el panel sale con el tema de la sección, sin tocar nada */}
    <PopoverContent>…</PopoverContent>
  </Popover>
</ThemeScope>;
```

El tema va en `theme` y la caja en `className`, que se queda donde está: al
panel solo se repinta `theme`. Con el relleno o el fondo de la sección en la
misma lista, el panel los recibiría también y sus bandas se cortarían antes del
borde.

```tsx
<ThemeScope theme="seccion-marketing" className="rounded-xl border border-border p-5">
  …
</ThemeScope>
```

Se lo lleva a los catorce paneles que salen por portal: los de `Dialog`,
`AlertDialog` y `Sheet` con sus velos, `Popover`, `Select`, `Tooltip`,
`DropdownMenu`, `Menubar` y `ContextMenu` con sus submenús. Los `ThemeScope`
anidados se suman, así que uno dentro de otro solo redefine lo suyo.

No mueve el portal a propósito: dentro de la sección, el panel quedaría a merced
de su `overflow` y de su `transform`, que es justo por lo que Radix monta en
`body`. Medido, con un `transform` en la sección el panel se iba 400px de su
sitio.

#### Un tema que no se puede escribir como clase

Un color de marca que sale de la base de datos no se conoce cuando se compila el
CSS, así que no puede llegar en una clase. `ThemeScope` también lleva al panel
las variables escritas en el elemento, vengan por `style` o por
`applyTheme(tema, elemento)`:

```tsx
<ThemeScope style={{ "--primary": config.colorDeMarca } as React.CSSProperties}>
  <Popover>…</Popover>
</ThemeScope>
```

```tsx
const caja = React.useRef<HTMLDivElement>(null);
React.useLayoutEffect(() => {
  if (caja.current) applyTheme(tema, caja.current);
}, [tema]);

<ThemeScope ref={caja}>…</ThemeScope>;
```

Las lee del elemento y no del `style` que recibe, así que `applyTheme` puede
escribirlas cuando quiera: si el color llega tarde, los paneles ya abiertos se
repintan.

### Cambiar el radio base

El radio de bordes se calcula a partir de un único token `--radius`, que equivale
al radio de un control. Cambiarlo ajusta toda la escala:

```css
:root {
  --radius: 0.75rem; /* Mas redondeado (default: 0.5rem) */
}
```

Las escalas derivadas multiplican el radio base, así que `--radius: 0` deja las
cuatro en cero y el tema sale con las esquinas rectas de verdad:

| Utilidad     | Formula                      | Con el default | Con `--radius: 0` |
| ------------ | ---------------------------- | -------------- | ----------------- |
| `rounded-sm` | `calc(var(--radius) * 0.75)` | 6px            | 0px               |
| `rounded-md` | `var(--radius)`              | 8px            | 0px               |
| `rounded-lg` | `calc(var(--radius) * 1.25)` | 10px           | 0px               |
| `rounded-xl` | `calc(var(--radius) * 1.5)`  | 12px           | 0px               |

`rounded-2xl` y `rounded-3xl` no están en la escala: caen al valor por defecto
de Tailwind y no siguen al tema. Usa los cuatro de arriba.

### Pedir una densidad compacta

`data-density="compact"` aprieta todo lo que cuelgue de ese elemento. El paso de
espaciado baja de 4px a 3px, y con él el relleno, los huecos y los altos: una
fila de controles pasa de 36px a 27px sin tocar ningún `size`.

```tsx
<div data-density="compact">
  <DataTable columns={columns} data={rows} />
</div>
```

Alcanza también a lo que no tiene prop `size`, que son las filas de una tabla,
los items de un menú y las pestañas, que es donde una pantalla de datos se nota
apretada.

Dos cosas no se mueven, porque no son medidas de la caja:

- **Los iconos.** Viven en `--spacing-icon-xs` a `--spacing-icon-xl` (12, 14,
  16, 20 y 24px) y se piden con `size-icon-md` y sus hermanas. A 12px un icono
  ya está en el mínimo legible, y encogiéndolo con el relleno se sale de la
  escala y cae en medio píxel.
- **El paso táctil.** `--spacing-touch` son 44px con cualquier densidad, que es
  el mínimo de área de toque. Se pide con `h-touch`, y es lo que usa el `size`
  `xl` de `Button` y de los campos.

Quien escriba un icono propio dentro de un componente de Elise usa la misma
escala, o el icono se le encogerá en una rama compacta:

```tsx
<ChevronRight className="size-icon-md" aria-hidden />
```

## Cambiar los tokens en caliente

Para un color de marca por inquilino o un editor de temas, los tokens están en
[`@calumet/elise-themes`](../packages/themes/README.md). Un tema es cualquier
subconjunto de las variables, con el nombre CSS como clave:

```tsx
import { applyTheme, lightTheme, type EliseTheme } from "@calumet/elise-themes";

const miTema: EliseTheme = {
  ...lightTheme,
  "--primary": "oklch(0.55 0.20 150)",
  "--ring": "oklch(0.55 0.20 150)",
};

applyTheme(miTema); // sobre el <html>
applyTheme(miTema, document.getElementById("mi-seccion")!); // o sobre una sección
```

`applyTheme` escribe las custom properties directamente en el elemento, así que
el cambio entra sin re-render y sirve para tener varios temas en la misma página.
Lo que no definas conserva el valor de `elise.css`.

En el servidor no hay DOM que escribir, así que el tema viaja serializado dentro
del HTML, que es lo que evita que la página parpadee con el tema equivocado:

```tsx
import { themeToCss } from "@calumet/elise-themes";

<style dangerouslySetInnerHTML={{ __html: themeToCss(miTema) }} />;
```

`themeToCss` descarta los valores que llevan caracteres capaces de cerrar la
etiqueta, porque un tema guardado en base de datos termina dentro de un `<style>`.

### Dejar que lo cambie quien no sabe CSS

`ThemeEditor` es el editor de apariencia, controlado y sin pantalla propia: se suelta donde quiera la aplicación y ella pone la vista previa al lado.

```tsx
import { ThemeEditor } from "@calumet/elise-themes";

<ThemeEditor value={tema} onChange={setTema} decisions={["brand", "corners"]} />;
```

No enseña variables sino nueve decisiones con nombre, porque nadie elige doce sombras: elige una. Cada opción se dibuja con lo que ella misma escribe, así que la miniatura de «esquinas redondas» sale redonda porque su valor es el radio. La prop `decisions` recorta la lista para una app con menos margen que un portal multiinquilino.

### Lo que trae la hoja

`lightTheme` y `darkTheme` son las 110 variables con el valor que les da
`elise.css`, y `tokenKinds` dice de qué clase es cada una (`color`, `size`,
`shadow` u `other`) para pintarle su control a un editor. Los tres se generan
desde la hoja en cada build, así que no se desfasan.

Tematizable es toda variable declarada en `:root`, más las que redefina otro
bloque de selector. Así entra `--spacing`, que vive en `@theme` porque Tailwind lo
necesita en build pero la densidad compacta lo cambia en caliente.

---

Siguiente: [Componentes](componentes.md) | [Utilidades](utilidades.md)
