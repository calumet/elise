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

| Token CSS                | Utilidad Tailwind              | Proposito                                         |
| ------------------------ | ------------------------------ | ------------------------------------------------- |
| `--background`           | `bg-background`                | Fondo principal de la pagina                       |
| `--foreground`           | `text-foreground`              | Texto principal                                    |
| `--card`                 | `bg-card`                      | Fondo de tarjetas y superficies elevadas           |
| `--card-foreground`      | `text-card-foreground`         | Texto sobre superficies card                       |
| `--popover`              | `bg-popover`                   | Fondo de menus flotantes, dropdowns, popovers      |
| `--popover-foreground`   | `text-popover-foreground`      | Texto sobre superficies popover                    |
| `--primary`              | `bg-primary`, `text-primary`   | Color primario (azul)                              |
| `--primary-foreground`   | `text-primary-foreground`      | Texto sobre fondo primario                         |
| `--secondary`            | `bg-secondary`                 | Fondos secundarios                                 |
| `--secondary-foreground` | `text-secondary-foreground`    | Texto sobre fondo secundario                       |
| `--muted`                | `bg-muted`                     | Fondos sutiles, hovers                             |
| `--muted-foreground`     | `text-muted-foreground`        | Texto secundario/gris                              |
| `--accent`               | `bg-accent`                    | Color de acento                                    |
| `--accent-foreground`    | `text-accent-foreground`       | Texto sobre fondo de acento                        |
| `--destructive`          | `bg-destructive`               | Acciones destructivas/errores                      |
| `--destructive-foreground` | `text-destructive-foreground` | Texto sobre fondo destructive                     |
| `--border`               | `border-border`                | Bordes estandar                                    |
| `--input`                | `border-input`                 | Bordes de campos de entrada                        |
| `--ring`                 | `ring-ring`                    | Anillo de focus                                    |
| `--success`              | `bg-success`, `text-success`   | Exito                                              |
| `--warning`              | `bg-warning`, `text-warning`   | Advertencia                                        |

### Colores de charts

| Token CSS    | Utilidad Tailwind  |
| ------------ | ------------------ |
| `--chart-1`  | `bg-chart-1`, etc. |
| `--chart-2`  | `bg-chart-2`       |
| `--chart-3`  | `bg-chart-3`       |
| `--chart-4`  | `bg-chart-4`       |
| `--chart-5`  | `bg-chart-5`       |

### Colores de sidebar

| Token CSS                       | Utilidad Tailwind                  |
| ------------------------------- | ---------------------------------- |
| `--sidebar`                     | `bg-sidebar`                       |
| `--sidebar-foreground`          | `text-sidebar-foreground`          |
| `--sidebar-primary`             | `bg-sidebar-primary`               |
| `--sidebar-primary-foreground`  | `text-sidebar-primary-foreground`  |
| `--sidebar-accent`              | `bg-sidebar-accent`                |
| `--sidebar-accent-foreground`   | `text-sidebar-accent-foreground`   |
| `--sidebar-border`              | `border-sidebar-border`            |
| `--sidebar-ring`                | `ring-sidebar-ring`                |

### Otros tokens

| Token CSS      | Utilidad Tailwind                    | Descripcion                                      |
| -------------- | ------------------------------------ | ------------------------------------------------ |
| `--radius`     | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` | Radio base (0.375rem). Las escalas se calculan con `calc()` |
| `--shadow-2xs` | `shadow-2xs`                         | Sombra minima                                    |
| `--shadow-xs`  | `shadow-xs`                          | Sombra extra-pequena                             |
| `--shadow-sm`  | `shadow-sm`                          | Sombra pequena                                   |
| `--shadow`     | `shadow`                             | Sombra por defecto                               |
| `--shadow-md`  | `shadow-md`                          | Sombra mediana                                   |
| `--shadow-lg`  | `shadow-lg`                          | Sombra grande (menus, popovers)                  |
| `--shadow-xl`  | `shadow-xl`                          | Sombra extra-grande                              |
| `--shadow-2xl` | `shadow-2xl`                         | Sombra maxima                                    |
| `--font-sans`  | `font-sans`                          | Geist, system-ui                                 |
| `--font-serif` | `font-serif`                         | Source Serif 4, serif                            |
| `--font-mono`  | `font-mono`                          | JetBrains Mono, monospace                        |

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
<button class="bg-primary hover:bg-primary/90 active:bg-primary/80">
  Boton
</button>

<!-- Destructive -->
<button class="bg-destructive text-destructive-foreground">Eliminar</button>

<!-- Success/Warning -->
<span class="bg-success text-destructive-foreground">Exito</span>
<span class="bg-warning text-destructive-foreground">Alerta</span>
```

> Los estados hover/active se manejan con modificadores de opacidad (e.g., `bg-primary/90` para hover, `bg-primary/80` para active) en lugar de tokens separados.

## Valores por defecto

### Tema claro (`:root`)

| Token                | Valor oklch                   |
| -------------------- | ----------------------------- |
| background           | `oklch(1.00 0 0)`            |
| foreground           | `oklch(0.32 0 0)`            |
| card                 | `oklch(1.00 0 0)`            |
| card-foreground      | `oklch(0.32 0 0)`            |
| popover              | `oklch(1.00 0 0)`            |
| popover-foreground   | `oklch(0.32 0 0)`            |
| primary              | `oklch(0.62 0.19 259.76)`    |
| primary-foreground   | `oklch(1.00 0 0)`            |
| secondary            | `oklch(0.97 0 0)`            |
| secondary-foreground | `oklch(0.45 0.03 257.68)`    |
| muted                | `oklch(0.98 0 0)`            |
| muted-foreground     | `oklch(0.55 0.02 264.41)`    |
| accent               | `oklch(0.95 0.03 233.56)`    |
| accent-foreground    | `oklch(0.38 0.14 265.59)`    |
| destructive          | `oklch(0.64 0.21 25.39)`     |
| destructive-foreground | `oklch(1.00 0 0)`          |
| border               | `oklch(0.93 0.01 261.82)`    |
| input                | `oklch(0.93 0.01 261.82)`    |
| ring                 | `oklch(0.62 0.19 259.76)`    |
| success              | `oklch(0.60 0.15 145)`       |
| warning              | `oklch(0.75 0.15 75)`        |

### Tema oscuro (`.dark` / `[data-theme="dark"]`)

| Token                | Valor oklch                   |
| -------------------- | ----------------------------- |
| background           | `oklch(0.20 0 0)`            |
| foreground           | `oklch(0.92 0 0)`            |
| card                 | `oklch(0.27 0 0)`            |
| card-foreground      | `oklch(0.92 0 0)`            |
| popover              | `oklch(0.27 0 0)`            |
| popover-foreground   | `oklch(0.92 0 0)`            |
| primary              | `oklch(0.62 0.19 259.76)`    |
| primary-foreground   | `oklch(1.00 0 0)`            |
| secondary            | `oklch(0.27 0 0)`            |
| secondary-foreground | `oklch(0.92 0 0)`            |
| muted                | `oklch(0.27 0 0)`            |
| muted-foreground     | `oklch(0.72 0 0)`            |
| accent               | `oklch(0.38 0.14 265.59)`    |
| accent-foreground    | `oklch(0.88 0.06 254.63)`    |
| destructive          | `oklch(0.64 0.21 25.39)`     |
| destructive-foreground | `oklch(1.00 0 0)`          |
| border               | `oklch(0.37 0 0)`            |
| input                | `oklch(0.37 0 0)`            |
| ring                 | `oklch(0.62 0.19 259.76)`    |
| success              | `oklch(0.60 0.15 145)`       |
| warning              | `oklch(0.75 0.15 75)`        |

## Sobrescribir el tema con CSS

La forma mas directa de personalizar Elise es redefinir las CSS custom properties en tu propio CSS. Esto funciona porque los tokens se resuelven en tiempo de ejecucion.

### Cambiar colores globalmente

En tu CSS principal (despues de importar `elise.css`), redefine los tokens que quieras cambiar:

```css
@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

/* Sobrescribir colores del tema claro */
:root {
  --primary: oklch(0.55 0.20 150);       /* verde en lugar de azul */
  --primary-foreground: oklch(1.00 0 0);
  --ring: oklch(0.55 0.20 150);
  --accent: oklch(0.90 0.05 150);
  --accent-foreground: oklch(0.30 0.15 150);
}

/* Sobrescribir colores del tema oscuro */
.dark {
  --primary: oklch(0.65 0.18 150);
  --primary-foreground: oklch(1.00 0 0);
  --ring: oklch(0.65 0.18 150);
}
```

Solo necesitas redefinir los tokens que quieras cambiar — los demas mantienen sus valores por defecto.

### Tema por seccion

Puedes aplicar tokens diferentes a secciones especificas de la pagina:

```css
.seccion-marketing {
  --primary: oklch(0.70 0.15 30);
  --primary-foreground: oklch(1.00 0 0);
  --accent: oklch(0.92 0.04 30);
}
```

```html
<div class="seccion-marketing">
  <!-- Los componentes de Elise aqui usaran los colores personalizados -->
  <Button variant="solid">Comprar ahora</Button>
</div>
```

### Cambiar el radio base

El radio de bordes se calcula a partir de un unico token `--radius`. Cambiarlo ajusta toda la escala:

```css
:root {
  --radius: 0.5rem; /* Mas redondeado (default: 0.375rem) */
}
```

Las escalas derivadas son:
- `rounded-sm` = `calc(var(--radius) - 4px)`
- `rounded-md` = `calc(var(--radius) - 2px)`
- `rounded-lg` = `var(--radius)`
- `rounded-xl` = `calc(var(--radius) + 4px)`

## Personalizacion con `applyTheme()`

Para crear un tema programaticamente (por ejemplo, un selector de temas en runtime), usa `applyTheme()`:

```tsx
import { applyTheme, type EliseTheme } from "@calumet/elise-ui";

const miTema: EliseTheme = {
  background: "oklch(1.00 0 0)",
  foreground: "oklch(0.25 0 0)",
  card: "oklch(0.99 0 0)",
  cardForeground: "oklch(0.25 0 0)",
  popover: "oklch(0.99 0 0)",
  popoverForeground: "oklch(0.25 0 0)",
  primary: "oklch(0.55 0.20 150)",
  primaryForeground: "oklch(1.00 0 0)",
  secondary: "oklch(0.96 0.01 150)",
  secondaryForeground: "oklch(0.40 0.10 150)",
  muted: "oklch(0.97 0 0)",
  mutedForeground: "oklch(0.55 0 0)",
  accent: "oklch(0.93 0.04 150)",
  accentForeground: "oklch(0.35 0.15 150)",
  destructive: "oklch(0.64 0.21 25)",
  destructiveForeground: "oklch(1.00 0 0)",
  border: "oklch(0.92 0.01 150)",
  input: "oklch(0.92 0.01 150)",
  ring: "oklch(0.55 0.20 150)",
  success: "oklch(0.60 0.15 145)",
  warning: "oklch(0.75 0.15 75)",
};

// Aplicar al elemento root del documento
applyTheme(miTema);

// O aplicar a un elemento especifico
applyTheme(miTema, document.getElementById("mi-seccion")!);
```

`applyTheme()` establece las CSS custom properties directamente en el elemento, lo que permite tener multiples temas en diferentes secciones de la pagina.

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
  warning: string;
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
