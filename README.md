# Elise

Design system moderno basado en [Radix UI](https://www.radix-ui.com/) primitives y [Tailwind CSS](https://tailwindcss.com/), construido como monorepo con pnpm.

## Paquetes

| Paquete                                    | Descripcion                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| [`@calumet/elise-ui`](packages/ui)         | Libreria principal con 45+ componentes accesibles                        |
| [`@calumet/elise-utils`](packages/utils)   | Utilidades: formularios (Zod), tablas (TanStack), toasts, alerts, fechas |
| [`@calumet/elise-icons`](packages/icons)   | Re-export de [Radix Icons](https://www.radix-ui.com/icons)               |
| [`@calumet/elise-linter`](packages/linter) | Configuracion compartida de ESLint y Prettier                            |
| [`showcase`](packages/showcase)            | App demo interactiva con ejemplos de todos los componentes               |

## Requisitos

- Node.js >= 18
- pnpm >= 10
- React >= 19

## Instalacion

```bash
git clone https://github.com/calumet/elise.git
cd elise
pnpm install
```

## Scripts

| Comando             | Descripcion                                          |
| ------------------- | ---------------------------------------------------- |
| `pnpm dev`          | Modo desarrollo de `@calumet/elise-ui` (watch + dts) |
| `pnpm dev:showcase` | Desarrollo paralelo de todos los paquetes + showcase |
| `pnpm build`        | Build de produccion (icons → ui → utils → showcase)  |
| `pnpm lint`         | Verificar ESLint                                     |
| `pnpm lint:fix`     | Corregir problemas de ESLint                         |
| `pnpm format`       | Formatear con Prettier                               |
| `pnpm format:check` | Verificar formato                                    |
| `pnpm clean`        | Limpiar carpetas dist                                |

## Estructura del proyecto

```
elise/
├── packages/
│   ├── ui/           # Componentes UI (Radix + Tailwind)
│   ├── utils/        # Utilidades (forms, tables, toasts, alerts, dates)
│   ├── icons/        # Iconos (Radix Icons)
│   ├── linter/       # Config ESLint + Prettier
│   ├── showcase/     # App demo (Vite + React 19)
│   └── blocks/       # (reservado para uso futuro)
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── eslint.config.js
```

## Inicio rapido

```tsx
import { ThemeProvider } from "@calumet/elise-ui";
import { Button } from "@calumet/elise-ui/button";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Button variant="solid" size="md">
        Hola Elise
      </Button>
    </ThemeProvider>
  );
}
```

Asegurate de importar los estilos de Elise en tu CSS:

Si usas Vite, instala y activa el plugin oficial de Tailwind:

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

> Con Vite no necesitas `postcss` ni `@tailwindcss/postcss`.

```css
@import "tailwindcss";
@import "@calumet/elise-ui/tailwind/elise.css";

@source '../node_modules/@calumet/elise-ui/dist';
@source '../node_modules/@calumet/elise-utils/dist';
```

## Documentacion

Consulta la documentacion completa en [`./docs`](docs/):

- [Guia de inicio](docs/guia-inicio.md)
- [Arquitectura](docs/arquitectura.md)
- [Temas](docs/temas.md)
- [Componentes](docs/componentes.md)
- [Utilidades](docs/utilidades.md)
- [Linter y formato](docs/linter.md)
- [Referencias externas](docs/referencias.md)

## Licencia

[MIT](LICENSE)
