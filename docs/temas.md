# Temas

Elise incluye un sistema de temas basado en CSS custom properties con soporte para modo claro y oscuro. Los colores usan el espacio de color [oklch](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) para mejor percepcion y consistencia.

## ThemeProvider

Componente que gestiona el tema activo, lo persiste en localStorage y lo aplica al DOM.

```tsx
import { ThemeProvider } from "@calumet/elise-ui";

<ThemeProvider attribute="class" storageKey="elise-theme" defaultTheme="light">
  <App />
</ThemeProvider>;
```

### Props

| Prop           | Tipo                      | Default         | Descripcion                                                                                             |
| -------------- | ------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `attribute`    | `"class" \| "data-theme"` | `"class"`       | `"class"` agrega/quita la clase `.dark` en `<html>`. `"data-theme"` usa el atributo `data-theme="dark"` |
| `storageKey`   | `string`                  | `"elise-theme"` | Clave de localStorage para persistir la preferencia del usuario                                         |
| `defaultTheme` | `"light" \| "dark"`       | `"light"`       | Tema inicial cuando no hay preferencia guardada                                                         |
| `forcedTheme`  | `"light" \| "dark"`       | —               | Fuerza un tema especifico, ignorando la preferencia guardada                                            |

## Hook `useTheme()`

Hook para leer y cambiar el tema desde cualquier componente dentro del ThemeProvider.

```tsx
import { useTheme } from "@calumet/elise-ui";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Tema actual: {theme}
    </button>
  );
}
```

> `useTheme()` debe usarse dentro de un `ThemeProvider`. Lanzara un error si se usa fuera.

## Tokens CSS

Los temas se implementan via CSS custom properties definidas en `@calumet/elise-ui/tailwind/elise.css`. Cada token se mapea automaticamente a utilidades de Tailwind CSS v4 mediante el bloque `@theme inline`.

### Colores semanticos

| Token CSS                  | Utilidad Tailwind             | Proposito                                     |
| -------------------------- | ----------------------------- | --------------------------------------------- |
| `--background`             | `bg-background`               | Fondo principal de la pagina                  |
| `--foreground`             | `text-foreground`             | Texto principal                               |
| `--card`                   | `bg-card`                     | Fondo de tarjetas y superficies elevadas      |
| `--card-foreground`        | `text-card-foreground`        | Texto sobre superficies card                  |
| `--popover`                | `bg-popover`                  | Fondo de menus flotantes, dropdowns, popovers |
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
| `--border`                 | `border-border`               | Divisores y bordes estandar                   |
| `--border-strong`          | `border-border-strong`        | Contorno de controles (botones outline)       |
| `--input`                  | `border-input`                | Bordes de campos de entrada                   |
| `--ring`                   | `ring-ring`                   | Anillo de focus                               |
| `--success`                | `bg-success`, `text-success`  | Exito                                         |
| `--warning`                | `bg-warning`, `text-warning`  | Advertencia                                   |
| `--info`                   | `bg-info`, `text-info`        | Informacion                                   |

> `--border`, `--border-strong` e `--input` son tres valores distintos a proposito:
> los divisores son mas claros que el contorno de un control, y un campo de entrada
> necesita mas peso que ambos para leerse como editable.

### Estados de los rellenos solidos

Cada relleno solido tiene sus propios tokens de `hover` y `active`. No se derivan
con opacidad: `bg-primary/90` compone el color contra la pagina, o sea que mueve
el relleno _hacia_ el fondo y el hover termina bajando el contraste. Estos tokens
hacen lo contrario — en el tema claro oscurecen, en el oscuro aclaran; en ambos
casos se alejan del fondo.

| Token CSS              | Utilidad Tailwind       | Proposito                       |
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

Las variantes `outline` y `ghost` no usan estos tokens: sobre fondo transparente
el hover se resuelve con `bg-muted` o con la superficie sutil del estado.

> **Excepcion:** en el tema oscuro `destructive` tambien oscurece. Lleva texto
> blanco y aclararlo lo baja de 4.5:1. Igual queda muy separado del fondo
> (`0.577` contra `0.172`), y de paso el hover sube el contraste del texto.
> Todos los pares de color del tema cumplen WCAG AA (>=4.5:1) en ambos temas.

### Superficies sutiles de estado

Cada estado tiene una superficie propia para fondos suaves (badges, alerts, filas
resaltadas), en lugar de derivarla con opacidad sobre el color solido. Un
`bg-success/10` se enloda sobre fondo oscuro; un token se define para cada tema.

| Token CSS                         | Utilidad Tailwind                    | Proposito                           |
| --------------------------------- | ------------------------------------ | ----------------------------------- |
| `--success-subtle`                | `bg-success-subtle`                  | Fondo suave de exito                |
| `--success-subtle-foreground`     | `text-success-subtle-foreground`     | Texto sobre `bg-success-subtle`     |
| `--warning-subtle`                | `bg-warning-subtle`                  | Fondo suave de advertencia          |
| `--warning-subtle-foreground`     | `text-warning-subtle-foreground`     | Texto sobre `bg-warning-subtle`     |
| `--destructive-subtle`            | `bg-destructive-subtle`              | Fondo suave de error                |
| `--destructive-subtle-foreground` | `text-destructive-subtle-foreground` | Texto sobre `bg-destructive-subtle` |
| `--info-subtle`                   | `bg-info-subtle`                     | Fondo suave informativo             |
| `--info-subtle-foreground`        | `text-info-subtle-foreground`        | Texto sobre `bg-info-subtle`        |

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
| `--sidebar-primary`            | `bg-sidebar-primary`              |
| `--sidebar-primary-foreground` | `text-sidebar-primary-foreground` |
| `--sidebar-accent`             | `bg-sidebar-accent`               |
| `--sidebar-accent-foreground`  | `text-sidebar-accent-foreground`  |
| `--sidebar-border`             | `border-sidebar-border`           |
| `--sidebar-ring`               | `ring-sidebar-ring`               |

### Otros tokens

| Token CSS              | Utilidad Tailwind                                      | Descripcion                                               |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| `--radius`             | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` | Radio base (0.5rem). Las escalas se calculan con `calc()` |
| `--shadow-2xs`         | `shadow-2xs`                                           | Sombra minima                                             |
| `--shadow-xs`          | `shadow-xs`                                            | Sombra extra-pequena                                      |
| `--shadow-sm`          | `shadow-sm`                                            | Sombra pequena (tarjetas)                                 |
| `--shadow`             | `shadow`                                               | Sombra por defecto                                        |
| `--shadow-md`          | `shadow-md`                                            | Sombra mediana                                            |
| `--shadow-lg`          | `shadow-lg`                                            | Sombra grande (menus, popovers)                           |
| `--shadow-xl`          | `shadow-xl`                                            | Sombra extra-grande (dialogos)                            |
| `--shadow-2xl`         | `shadow-2xl`                                           | Sombra maxima                                             |
| `--shadow-bevel`       | `shadow-bevel`                                         | Bisel `inset` para rellenos solidos                       |
| `--shadow-bevel-inset` | `shadow-bevel-inset`                                   | Bisel invertido: estado presionado                        |
| `--font-sans`          | `font-sans`                                            | Geist, system-ui                                          |
| `--font-serif`         | `font-serif`                                           | Source Serif 4, serif                                     |
| `--font-mono`          | `font-mono`                                            | JetBrains Mono, monospace                                 |
| `--duration-fast`      | `duration-(--duration-fast)`                           | 140ms — hovers y cambios de color                         |
| `--duration-base`      | `duration-(--duration-base)`                           | 200ms — entradas y salidas                                |
| `--duration-slow`      | `duration-(--duration-slow)`                           | 320ms — sheets, drawers                                   |

### Tipografias

Las tres familias vienen incluidas en el paquete como fuentes variables y se
cargan importando `@calumet/elise-ui/tailwind/fonts.css` (ver
[Guia de inicio](guia-inicio.md)). Sin ese import, los tokens caen en la fuente
del sistema y la app se ve distinta en cada sistema operativo.

Cada stack lista primero el nombre que registra Fontsource y despues el nombre
plano, asi resuelve tanto con `fonts.css` como si la app carga la fuente por su
cuenta:

```css
--font-sans: "Geist Variable", "Geist", ui-sans-serif, system-ui, …;
--font-serif: "Source Serif 4 Variable", "Source Serif 4", ui-serif, Georgia, serif;
--font-mono: "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, …;
```

La escala de sombras es monotona: el blur, el spread negativo y la opacidad crecen
juntos, y el modo oscuro define su propio juego de valores (una sombra negra al 10%
es invisible sobre el fondo oscuro). `shadow-bevel` es aparte de la escala: se
combina con un fondo solido para darle un borde inferior oscuro y un highlight
superior, de modo que el relleno se lea como un objeto y no como un plano de color.
`shadow-bevel-inset` lo invierte hacia adentro y se usa en `active:`, para que el
estado presionado se sienta hundido en lugar de solo cambiar de color.

### Radios por rol

Los componentes no eligen radio libremente. La convencion es:

| Rol                                                 | Utilidad       | Valor |
| --------------------------------------------------- | -------------- | ----- |
| Superficies (Card, Dialog, Popover, menus, Toast)   | `rounded-xl`   | 12px  |
| Controles y barras (Button, Input, Select, Toolbar) | `rounded-md`   | 8px   |
| Items dentro de una superficie (opciones de menu)   | `rounded-sm`   | 6px   |
| Pildoras y avatares                                 | `rounded-full` | —     |

### Tipografia

Cada tamano trae su interlineado y su tracking emparejados, asi que `text-sm` ya
aplica los tres valores. El tracking se aprieta progresivamente al crecer el
tamano (correccion optica). El chrome de la UI vive en `text-sm` y `text-base`.

| Utilidad    | Tamano | Interlineado | Tracking   |
| ----------- | ------ | ------------ | ---------- |
| `text-2xs`  | 11px   | 16px         | `0.01em`   |
| `text-xs`   | 12px   | 16px         | `0.005em`  |
| `text-sm`   | 13px   | 20px         | `-0.006em` |
| `text-base` | 14px   | 20px         | `-0.01em`  |
| `text-lg`   | 16px   | 24px         | `-0.014em` |
| `text-xl`   | 20px   | 28px         | `-0.018em` |
| `text-2xl`  | 24px   | 32px         | `-0.022em` |
| `text-3xl`  | 30px   | 36px         | `-0.026em` |

### Curvas de animacion

| Utilidad      | Valor                            |
| ------------- | -------------------------------- |
| `ease-out`    | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |

`elise.css` tambien incluye un bloque `@media (prefers-reduced-motion: reduce)` que
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
> `text-destructive-foreground` sobre `bg-warning`: el warning lleva texto oscuro
> para cumplir contraste, y el destructive lo lleva blanco.

> Los estados hover/active de los rellenos solidos usan tokens propios
> (`bg-primary-hover`, `bg-primary-active`), no modificadores de opacidad. Ver
> [Estados de los rellenos solidos](#estados-de-los-rellenos-solidos).

## Valores por defecto

### Tema claro (`:root`)

Los neutrales llevan una croma minima (0.002–0.016) sesgada hacia el hue del
primario. Un gris de croma 0 se lee como heredado del default; uno con un sesgo
apenas perceptible se lee como elegido.

| Token                         | Valor oklch              |
| ----------------------------- | ------------------------ |
| background                    | `oklch(0.984 0.002 265)` |
| foreground                    | `oklch(0.21 0.012 265)`  |
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

El primario se aclara de `0.55` a `0.655`: el mismo valor del modo claro queda
apagado sobre el fondo oscuro. Al aclararlo, su `-foreground` pasa a ser oscuro
para mantener el contraste AA. `popover` se eleva por encima de `card` en vez de
compartir su valor.

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

La forma mas directa de personalizar Elise es redefinir las CSS custom properties en tu propio CSS. Esto funciona porque los tokens se resuelven en tiempo de ejecucion.

### Cambiar colores globalmente

En tu CSS principal (despues de importar `elise.css`), redefine los tokens que quieras cambiar:

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

Solo necesitas redefinir los tokens que quieras cambiar — los demas mantienen sus valores por defecto.

### Tema por seccion

Puedes aplicar tokens diferentes a secciones especificas de la pagina:

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

### Cambiar el radio base

El radio de bordes se calcula a partir de un unico token `--radius`, que equivale
al radio de un control. Cambiarlo ajusta toda la escala:

```css
:root {
  --radius: 0.75rem; /* Mas redondeado (default: 0.5rem) */
}
```

Las escalas derivadas se separan ±2px:

| Utilidad     | Formula                     | Valor con el default |
| ------------ | --------------------------- | -------------------- |
| `rounded-sm` | `calc(var(--radius) - 2px)` | 6px                  |
| `rounded-md` | `var(--radius)`             | 8px                  |
| `rounded-lg` | `calc(var(--radius) + 2px)` | 10px                 |
| `rounded-xl` | `calc(var(--radius) + 4px)` | 12px                 |

## Personalizacion con `applyTheme()`

Para crear un tema programaticamente (por ejemplo, un selector de temas en runtime), usa `applyTheme()`:

La forma recomendada es extender uno de los temas por defecto y sobrescribir solo
lo que cambia. Asi el tema hereda automaticamente los tokens que se agreguen en
versiones futuras:

```tsx
import { applyTheme, defaultLightTheme, type EliseTheme } from "@calumet/elise-ui";

const miTema: EliseTheme = {
  ...defaultLightTheme,
  primary: "oklch(0.55 0.20 150)",
  primaryForeground: "oklch(1.00 0 0)",
  ring: "oklch(0.55 0.20 150)",
  accent: "oklch(0.93 0.04 150)",
  accentForeground: "oklch(0.35 0.15 150)",
};

// Aplicar al elemento root del documento
applyTheme(miTema);

// O aplicar a un elemento especifico
applyTheme(miTema, document.getElementById("mi-seccion")!);
```

`applyTheme()` establece las CSS custom properties directamente en el elemento, lo que permite tener multiples temas en diferentes secciones de la pagina.

Tambien podes construir el objeto completo a mano. En ese caso solo los campos
obligatorios del tipo son necesarios: los opcionales que no definas conservan el
valor que ya trae `elise.css`.

### Tipo `EliseTheme`

```typescript
type EliseTheme = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;

  // Agregados despues de la v0.2. Son opcionales para no romper los temas que
  // ya se construyen como literal completo: si no los defines, se mantiene el
  // valor de elise.css. Los temas por defecto si los traen.
  borderStrong?: string;
  info?: string;
  infoForeground?: string;
  successSubtle?: string;
  successSubtleForeground?: string;
  warningSubtle?: string;
  warningSubtleForeground?: string;
  destructiveSubtle?: string;
  destructiveSubtleForeground?: string;
  infoSubtle?: string;
  infoSubtleForeground?: string;
};
```

### Temas por defecto

Elise exporta los temas por defecto que puedes usar como base para tus personalizaciones:

```tsx
import { defaultLightTheme, defaultDarkTheme } from "@calumet/elise-ui";

// Extender el tema claro cambiando solo el primario
const miTema = {
  ...defaultLightTheme,
  primary: "oklch(0.55 0.20 150)",
  primaryForeground: "oklch(1.00 0 0)",
  ring: "oklch(0.55 0.20 150)",
};

applyTheme(miTema);
```

---

Siguiente: [Componentes](componentes.md) | [Utilidades](utilidades.md)
