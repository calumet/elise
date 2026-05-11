# Elise

Plataforma frontend de Calumet: design system (Radix UI primitives + [Tailwind CSS](https://tailwindcss.com/)) y utilidades de frontend que lo acompañan, construida como monorepo con pnpm.

## Paquetes

| Paquete                                    | Descripcion                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`@calumet/elise-ui`](packages/ui)         | Libreria principal con 45+ componentes accesibles                                  |
| [`@calumet/elise-forms`](packages/forms)   | Hook `useZodForm` (react-hook-form + Zod)                                          |
| [`@calumet/elise-tables`](packages/tables) | `DataTable` con filtros, ordenamiento, paginación y export (TanStack React Table)  |
| [`@calumet/elise-toasts`](packages/toasts) | Sistema de toasts (event bus + `Toaster`)                                          |
| [`@calumet/elise-alerts`](packages/alerts) | Sistema de alertas modales (event bus + `AlertHost`)                               |
| [`@calumet/elise-i18n`](packages/i18n)     | Internacionalización y formateo con `Intl` (dates, próximamente numbers/i18n core) |
| [`@calumet/elise-icons`](packages/icons)   | Re-export de [Lucide Icons](https://lucide.dev/icons/)                             |
| [`@calumet/elise-linter`](packages/linter) | Configuración compartida de ESLint y Prettier                                      |
| [`showcase`](packages/showcase)            | App demo interactiva con ejemplos de todos los componentes                         |

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
│   ├── forms/        # useZodForm (react-hook-form + Zod)
│   ├── tables/       # DataTable (TanStack)
│   ├── toasts/       # Sistema de toasts
│   ├── alerts/       # Sistema de alertas modales
│   ├── i18n/         # Internacionalización (Intl)
│   ├── icons/        # Iconos (Lucide)
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
@source '../node_modules/@calumet/elise-tables/dist';
@source '../node_modules/@calumet/elise-toasts/dist';
@source '../node_modules/@calumet/elise-alerts/dist';
```

## Documentacion

Consulta la documentacion completa en [`./docs`](docs/):

- [Guia de inicio](docs/guia-inicio.md)
- [Arquitectura](docs/arquitectura.md)
- [Temas](docs/temas.md)
- [Componentes](docs/componentes.md)
- [Utilidades](docs/utilidades.md)
- [Internacionalización (i18n)](docs/i18n.md)
- [Linter y formato](docs/linter.md)
- [Referencias externas](docs/referencias.md)

## Licencia

[MIT](LICENSE)
