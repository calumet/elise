# Temas

Elise incluye un sistema de temas basado en CSS custom properties (tokens) con soporte para modo claro y oscuro.

## ThemeProvider

Componente que gestiona el tema activo, lo persiste en localStorage y lo aplica al DOM.

```tsx
import { ThemeProvider } from "@calumet/elise-ui";

<ThemeProvider
  attribute="class"
  storageKey="elise-theme"
  defaultTheme="light"
>
  <App />
</ThemeProvider>
```

### Props

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `attribute` | `"class" \| "data-theme"` | `"class"` | `"class"` agrega/quita la clase `.dark` en `<html>`. `"data-theme"` usa el atributo `data-theme="dark"` |
| `storageKey` | `string` | `"elise-theme"` | Clave de localStorage para persistir la preferencia del usuario |
| `defaultTheme` | `"light" \| "dark"` | `"light"` | Tema inicial cuando no hay preferencia guardada |
| `forcedTheme` | `"light" \| "dark"` | — | Fuerza un tema especifico, ignorando la preferencia guardada |

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

Los temas se implementan via CSS custom properties con prefijo `--elise-`. Estos tokens se definen en `@calumet/elise-ui/tailwind/elise.css` y se mapean automaticamente a utilidades de Tailwind.

### Colores

| Token CSS | Utilidad Tailwind | Proposito |
| --- | --- | --- |
| `--elise-background` | `bg-background` | Fondo principal de la pagina |
| `--elise-surface` | `bg-surface` | Fondo de tarjetas y superficies elevadas |
| `--elise-muted` | `bg-muted` | Fondos sutiles, hovers |
| `--elise-foreground` | `text-foreground` | Texto principal |
| `--elise-muted-foreground` | `text-muted-foreground` | Texto secundario/gris |
| `--elise-border` | `border-border` | Bordes estandar |
| `--elise-border-strong` | `border-border-strong` | Bordes con mayor contraste |
| `--elise-primary` | `bg-primary`, `text-primary` | Color primario (azul) |
| `--elise-primary-hover` | `bg-primary-hover` | Hover del primario |
| `--elise-primary-active` | `bg-primary-active` | Active del primario |
| `--elise-primary-contrast` | `text-primary-contrast` | Texto sobre fondo primario |
| `--elise-secondary` | `bg-secondary` | Color secundario (violeta) |
| `--elise-accent` | `bg-accent` | Color de acento (verde) |
| `--elise-success` | `bg-success` | Exito |
| `--elise-warning` | `bg-warning` | Advertencia |
| `--elise-danger` | `bg-danger` | Error/peligro |
| `--elise-focus` | `ring-focus` | Anillo de focus |
| `--elise-overlay` | `bg-overlay` | Overlay de modales |

### Otros tokens

| Token CSS | Utilidad Tailwind | Valor default (light) |
| --- | --- | --- |
| `--elise-radius-xs` | `rounded-xs` | `2px` |
| `--elise-radius-sm` | `rounded-sm` | `4px` |
| `--elise-radius-md` | `rounded-md` | `8px` |
| `--elise-radius-lg` | `rounded-lg` | `12px` |
| `--elise-radius-pill` | `rounded-pill` | `999px` |
| `--elise-shadow-soft` | `shadow-soft` | Sombra suave |
| `--elise-shadow-floating` | `shadow-floating` | Sombra para elementos flotantes |
| `--elise-font-family-sans` | `font-sans` | Space Grotesk, Satoshi, Inter, system-ui |
| `--elise-font-family-mono` | `font-mono` | JetBrains Mono, Consolas |

## Valores por defecto

### Tema claro (`:root`)

| Token | Valor |
| --- | --- |
| background | `#fcfcfd` |
| surface | `#fefefe` |
| foreground | `#1e1f24` |
| primary | `#3b82f6` |
| secondary | `#8b5cf6` |
| accent | `#46a758` |
| success | `#3d9a50` |
| warning | `#f5a623` |
| danger | `#e5484d` |

### Tema oscuro (`.dark` / `[data-theme="dark"]`)

| Token | Valor |
| --- | --- |
| background | `#111113` |
| surface | `#212225` |
| foreground | `#edeef0` |
| primary | `#76a7ff` |
| secondary | `#bba8ff` |
| accent | `#53b365` |
| success | `#53b365` |
| warning | `#f5a623` |
| danger | `#f2555a` |

## Personalizacion con `applyTheme()`

Para crear un tema completamente personalizado, usa `applyTheme()` con un objeto `EliseTheme`:

```tsx
import { applyTheme, type EliseTheme } from "@calumet/elise-ui";

const miTema: EliseTheme = {
  surface: "#fafafa",
  surfaceRaised: "#f0f0f0",
  surfaceHover: "#e5e5e5",
  border: "#d4d4d4",
  borderStrong: "#a3a3a3",
  text: "#171717",
  textMuted: "#737373",
  accent: "#2563eb",
  accentHover: "#1d4ed8",
  accentActive: "#1e40af",
  accentContrast: "#ffffff",
  success: "#16a34a",
  warning: "#ca8a04",
  danger: "#dc2626",
  focus: "#3b82f6",
  overlay: "#0a0a0a",
};

// Aplicar al elemento root del documento
applyTheme(miTema);

// O aplicar a un elemento especifico
applyTheme(miTema, document.getElementById("mi-seccion")!);
```

`applyTheme()` establece las CSS custom properties (`--elise-*`) directamente en el elemento, lo que permite tener multiples temas en diferentes secciones de la pagina.

### Tipo `EliseTheme`

```typescript
type EliseTheme = {
  surface: string;
  surfaceRaised: string;
  surfaceHover: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentActive: string;
  accentContrast: string;
  success: string;
  warning: string;
  danger: string;
  focus: string;
  overlay: string;
};
```

---

Siguiente: [Componentes](componentes.md) | [Utilidades](utilidades.md)
