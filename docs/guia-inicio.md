# Guía de inicio

## Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 10 ([instalar pnpm](https://pnpm.io/installation))
- **React** >= 19 y **React DOM** >= 19

## Instalación

### Setup recomendado (Vite + React)

1. Instala los paquetes de Elise:

```bash
# Base: UI + iconos
pnpm add @calumet/elise-ui @calumet/elise-icons

# Añade los paquetes de utilidades que necesites
pnpm add @calumet/elise-forms     # useZodForm (RHF + Zod)
pnpm add @calumet/elise-tables    # DataTable (TanStack)
pnpm add @calumet/elise-toasts    # Sistema de toasts
pnpm add @calumet/elise-alerts    # Sistema de alertas modales
pnpm add @calumet/elise-i18n      # Formateo localizado (Intl)
```

> Cada paquete de utilidades es opcional. Instala solo los que vayas a usar.

2. Instala Tailwind CSS v4 y su plugin oficial para Vite:

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

3. Configura `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

> Con Vite no necesitas `postcss` ni `@tailwindcss/postcss`.

4. En tu CSS principal (por ejemplo `src/index.css`), importa Tailwind y los estilos de Elise:

```css
/* Tipografias autoalojadas (Geist, JetBrains Mono, Source Serif 4).
   Va primero, antes de Tailwind. */
@import "@calumet/elise-ui/tailwind/fonts.css";

@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

/* Permite que Tailwind detecte las clases usadas en los paquetes */
@source "../node_modules/@calumet/elise-ui/dist";
/* Solo incluye los que uses */
@source "../node_modules/@calumet/elise-tables/dist";
@source "../node_modules/@calumet/elise-toasts/dist";
@source "../node_modules/@calumet/elise-alerts/dist";
```

> **No te saltees `fonts.css`.** Sin el, `--font-sans` cae en la fuente del
> sistema y tu app se ve distinta en macOS, Windows y Linux. Las tres familias
> vienen incluidas en `@calumet/elise-ui` como fuentes variables: un archivo por
> familia cubre todo el rango de pesos.
>
> Es un import aparte para que puedas omitirlo si tu app ya carga Geist por su
> cuenta (por ejemplo con `geist/font` en Next.js) y no quieras descargarla dos
> veces. Los tokens `--font-*` resuelven igual en ese caso: listan tanto
> `"Geist Variable"` (el nombre que registra Fontsource) como `"Geist"`.

5. Verifica que tu app levanta correctamente:

```bash
pnpm dev
```

### Referencias oficiales de Tailwind

- Documentación general: https://tailwindcss.com/docs
- Guía de instalación: https://tailwindcss.com/docs/installation
- Integración con Vite: https://tailwindcss.com/docs/installation/framework-guides/vite

> Si Tailwind cambia algún paso en nuevas versiones, toma como fuente de verdad su documentación oficial.

### Desarrollo del monorepo Elise

```bash
git clone https://github.com/calumet/elise.git
cd elise
pnpm install
pnpm dev:showcase  # Levanta todos los paquetes + app demo en localhost:5173
```

## Configurar el ThemeProvider

Envuelve tu aplicación con `ThemeProvider` para habilitar el sistema de temas:

```tsx
import { ThemeProvider } from "@calumet/elise-ui";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="mi-app-theme">
      {/* Tu aplicacion */}
    </ThemeProvider>
  );
}
```

### Props del ThemeProvider

| Prop           | Tipo                      | Default         | Descripción                                         |
| -------------- | ------------------------- | --------------- | --------------------------------------------------- |
| `attribute`    | `"class" \| "data-theme"` | `"class"`       | Método para aplicar el tema al DOM                  |
| `storageKey`   | `string`                  | `"elise-theme"` | Clave de localStorage para persistir la preferencia |
| `defaultTheme` | `"light" \| "dark"`       | `"light"`       | Tema inicial si no hay preferencia guardada         |
| `forcedTheme`  | `"light" \| "dark"`       | —               | Fuerza un tema ignorando la preferencia del usuario |

## Tu primer componente

```tsx
import { ThemeProvider } from "@calumet/elise-ui";
import { Button } from "@calumet/elise-ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@calumet/elise-ui/card";

function App() {
  return (
    <ThemeProvider>
      <Card className="w-80 mx-auto mt-10">
        <CardHeader>
          <CardTitle>Bienvenido a Elise</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="solid" size="md">
            Empezar
          </Button>
          <Button variant="outline" size="md" className="ml-2">
            Documentacion
          </Button>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
```

## Estructura de imports

Elise soporta dos estilos de importación:

```tsx
// Import directo por componente (recomendado)
import { Button } from "@calumet/elise-ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@calumet/elise-ui/dialog";

// Import desde el barrel principal
import { Button, Dialog, DialogContent } from "@calumet/elise-ui";
```

Para utilidades, usa los sub-módulos:

```tsx
import { useZodForm, z } from "@calumet/elise-forms";
import { toast, Toaster } from "@calumet/elise-toasts";
import { openAlert, AlertHost } from "@calumet/elise-alerts";
import { DataTable } from "@calumet/elise-tables";
import { formatDate, useDateRange } from "@calumet/elise-i18n/dates";
```

Para iconos:

```tsx
import { Search, ChevronDown } from "@calumet/elise-icons";
```

> Los iconos disponibles son los de [Lucide](https://lucide.dev/icons/). Consulta su galería para ver todos los iconos disponibles.

## Linter y formato

Para configurar ESLint/Prettier con los presets de Elise, consulta [Linter y formato](linter.md).

---

Siguiente: [Arquitectura](arquitectura.md) | [Linter y formato](linter.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md)
