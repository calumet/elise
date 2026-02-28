# Guia de inicio

## Requisitos previos

- **Node.js** >= 18
- **pnpm** >= 10 ([instalar pnpm](https://pnpm.io/installation))
- **React** >= 19 y **React DOM** >= 19

## Instalacion

### Como dependencia en tu proyecto

```bash
# Instalar los paquetes que necesites
pnpm add @calumet/elise-ui @calumet/elise-icons @calumet/elise-utils
```

### Desarrollo del monorepo

```bash
git clone https://github.com/calumet/elise.git
cd elise
pnpm install
pnpm dev:showcase  # Levanta todos los paquetes + app demo en localhost:5173
```

## Configurar Tailwind CSS

Elise usa Tailwind CSS v4 con tokens CSS personalizados. En el archivo CSS principal de tu proyecto:

```css
@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

/* Permite que Tailwind detecte las clases usadas en los paquetes */
@source '../node_modules/@calumet/elise-ui/dist';
@source '../node_modules/@calumet/elise-utils/dist';
```

Esto importa:
- Los tokens de color de Elise (`--elise-primary`, `--elise-border`, etc.)
- El mapeo de tokens a utilidades de Tailwind (`bg-primary`, `text-foreground`, etc.)
- Los estilos base (tipografia, seleccion de texto, box-sizing)
- El soporte para modo oscuro via clase `.dark` o atributo `data-theme="dark"`

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

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `attribute` | `"class" \| "data-theme"` | `"class"` | Metodo para aplicar el tema al DOM |
| `storageKey` | `string` | `"elise-theme"` | Clave de localStorage para persistir la preferencia |
| `defaultTheme` | `"light" \| "dark"` | `"light"` | Tema inicial si no hay preferencia guardada |
| `forcedTheme` | `"light" \| "dark"` | — | Fuerza un tema ignorando la preferencia del usuario |

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

---

Siguiente: [Arquitectura](arquitectura.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md)
