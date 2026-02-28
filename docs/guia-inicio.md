# Guia de inicio

## Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 10 ([instalar pnpm](https://pnpm.io/installation))
- **React** >= 19 y **React DOM** >= 19

## Instalacion

### Setup recomendado (Vite + React)

1. Instala los paquetes de Elise:

```bash
pnpm add @calumet/elise-ui @calumet/elise-icons @calumet/elise-utils
```

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
@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

/* Permite que Tailwind detecte las clases usadas en los paquetes */
@source "../node_modules/@calumet/elise-ui/dist";
@source "../node_modules/@calumet/elise-utils/dist";
```

5. Verifica que tu app levanta correctamente:

```bash
pnpm dev
```

### Referencias oficiales de Tailwind

- Documentacion general: https://tailwindcss.com/docs
- Guia de instalacion: https://tailwindcss.com/docs/installation
- Integracion con Vite: https://tailwindcss.com/docs/installation/framework-guides/vite

> Si Tailwind cambia algun paso en nuevas versiones, toma como fuente de verdad su documentacion oficial.

### Desarrollo del monorepo Elise

```bash
git clone https://github.com/calumet/elise.git
cd elise
pnpm install
pnpm dev:showcase  # Levanta todos los paquetes + app demo en localhost:5173
```

## Configurar el ThemeProvider

Envuelve tu aplicacion con `ThemeProvider` para habilitar el sistema de temas:

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

| Prop           | Tipo                      | Default         | Descripcion                                         |
| -------------- | ------------------------- | --------------- | --------------------------------------------------- |
| `attribute`    | `"class" \| "data-theme"` | `"class"`       | Metodo para aplicar el tema al DOM                  |
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

Elise soporta dos estilos de importacion:

```tsx
// Import directo por componente (recomendado)
import { Button } from "@calumet/elise-ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@calumet/elise-ui/dialog";

// Import desde el barrel principal
import { Button, Dialog, DialogContent } from "@calumet/elise-ui";
```

Para utilidades, usa los sub-modulos:

```tsx
import { useZodForm } from "@calumet/elise-utils/forms";
import { toast, Toaster } from "@calumet/elise-utils/toasts";
import { openAlert, AlertHost } from "@calumet/elise-utils/alerts";
import { DataTable } from "@calumet/elise-utils/tables";
import { formatDate, useDateRange } from "@calumet/elise-utils/dates";
```

Para iconos:

```tsx
import { MagnifyingGlassIcon, ChevronDownIcon } from "@calumet/elise-icons";
```

> Los iconos disponibles son los de [Radix Icons](https://www.radix-ui.com/icons). Consulta su galeria para ver todos los iconos disponibles.

## Linter y formato

Para configurar ESLint/Prettier con los presets de Elise, consulta [Linter y formato](linter.md).

---

Siguiente: [Arquitectura](arquitectura.md) | [Linter y formato](linter.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md)
