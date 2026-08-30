# Elise

Plataforma frontend de Calumet: design system (Radix UI primitives + [Tailwind CSS](https://tailwindcss.com/)) y utilidades de frontend que lo acompañan, construida como monorepo con pnpm.

## Paquetes

| Paquete                                    | Descripción                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| [`@calumet/elise-ui`](packages/ui)         | Librería principal con 58 componentes accesibles                                  |
| [`@calumet/elise-forms`](packages/forms)   | Hook `useZodForm` (react-hook-form + Zod)                                         |
| [`@calumet/elise-tables`](packages/tables) | `DataTable` con filtros, ordenamiento, paginación y export (TanStack React Table) |
| [`@calumet/elise-toasts`](packages/toasts) | Sistema de toasts (event bus + `Toaster`)                                         |
| [`@calumet/elise-alerts`](packages/alerts) | Sistema de alertas modales (event bus + `AlertHost`)                              |
| [`@calumet/elise-i18n`](packages/i18n)     | Internacionalización: `I18nProvider`, hooks y formateo `Intl` (dates, numbers)    |
| [`@calumet/elise-icons`](packages/icons)   | Re-export de [Lucide Icons](https://lucide.dev/icons/)                            |
| [`@calumet/elise-linter`](packages/linter) | Configuración compartida de ESLint y Prettier                                     |
| [`showcase`](packages/showcase)            | App demo interactiva con ejemplos de todos los componentes                        |

## Requisitos

- Node.js >= 18
- pnpm >= 10
- React >= 19

## Instalación

```bash
git clone https://github.com/calumet/elise.git
cd elise
pnpm install
```

## Consumir los paquetes

Los paquetes se publican en dos registros a la vez, desde el mismo commit y con
la misma API. [JSR](https://jsr.io/@calumet) sirve la salida de `tsc`, un módulo
por archivo, y no pide token:

```bash
pnpm add jsr:@calumet/elise-ui
```

GitHub Packages sirve el bundle de tsup, y pide un `.npmrc` con el scope
apuntado y un token con permiso `read:packages`:

```
@calumet:registry=https://npm.pkg.github.com
```

```bash
pnpm add @calumet/elise-ui
```

Lo que cambia entre las dos es el CSS, en dos puntos.

**Las hojas de estilo solo tienen subpath en GitHub Packages.** JSR todavía no
deja exportar archivos que no sean JavaScript o TypeScript
([jsr-io/jsr#293](https://github.com/jsr-io/jsr/issues/293)), así que ni
`@calumet/elise-ui/styles.css` ni `@calumet/elise-ui/tailwind/elise.css`
resuelven ahí. Viajan igual dentro del paquete y se importan por su ruta:

```css
@import "../node_modules/@calumet/elise-ui/src/tailwind/elise.css";
```

**Desde JSR hay que instalar a mano lo que piden las hojas.** JSR arma la lista
de dependencias recorriendo los imports del código, y las de un `.css` no
aparecen ahí:

```bash
pnpm add -D tw-animate-css @fontsource-variable/geist \
            @fontsource-variable/jetbrains-mono @fontsource-variable/source-serif-4
```

El paso a paso completo está en la [Guía de inicio](docs/guia-inicio.md#instalación).

## Scripts

| Comando             | Descripción                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`          | Modo desarrollo de `@calumet/elise-ui` (watch + dts)                                  |
| `pnpm build:libs`   | Build de los paquetes de librería, sin el showcase                                    |
| `pnpm dev:showcase` | Build de librerías y luego desarrollo paralelo de todo + showcase                     |
| `pnpm build`        | Build de producción (icons → ui → i18n → forms → tables → toasts → alerts → showcase) |
| `pnpm lint`         | Verificar ESLint                                                                      |
| `pnpm lint:fix`     | Corregir problemas de ESLint                                                          |
| `pnpm format`       | Formatear con Prettier                                                                |
| `pnpm format:check` | Verificar formato                                                                     |
| `pnpm audit:visual` | Auditoría visual del showcase en Chromium (ver [docs](docs/auditoria-visual.md))      |
| `pnpm jsr:check`    | Simular la publicación en JSR de todo el workspace (ver [docs](docs/publicar-jsr.md)) |
| `pnpm clean`        | Limpiar carpetas dist                                                                 |

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

## Inicio rápido

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

Los estilos llegan de una de dos formas.

**Sin Tailwind**, con el CSS que el paquete trae ya compilado. Un import en el
punto de entrada de la app y listo:

```ts
import "@calumet/elise-ui/styles.css";
```

**Con Tailwind**, si querés usar los tokens del sistema en tu propio marcado.
Con Vite, instala y activa el plugin oficial:

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
/* Tipografias autoalojadas. Omitilo solo si tu app ya carga Geist. */
@import "@calumet/elise-ui/tailwind/fonts.css";
@import "@calumet/elise-ui/tailwind/elise.css";

/* Solo los que uses */
@import "@calumet/elise-tables/tailwind.css";
@import "@calumet/elise-toasts/tailwind.css";
@import "@calumet/elise-alerts/tailwind.css";
```

> Cada hoja trae dentro `@import "tailwindcss"` y sus `@source`, así que la app
> no repite ninguno de los dos.
>
> Esos subpaths son los de GitHub Packages. Instalando desde JSR cambian, y el
> paso a paso está en la [Guía de inicio](docs/guia-inicio.md#instalación).

## Documentación

Consulta la documentación completa en [`./docs`](docs/):

- [Guía de inicio](docs/guia-inicio.md)
- [Arquitectura](docs/arquitectura.md)
- [Temas](docs/temas.md)
- [Componentes](docs/componentes.md)
- [Reglas de interfaz](docs/reglas-ui.md)
- [Patrones de pantalla](docs/patrones-pantalla.md)
- [Patrones de bloque](docs/patrones-bloque.md)
- [Utilidades](docs/utilidades.md)
- [Internacionalización (i18n)](docs/i18n.md)
- [Linter y formato](docs/linter.md)
- [Auditoría visual](docs/auditoria-visual.md)
- [Plan de modernización](docs/plan.md)
- [Referencias externas](docs/referencias.md)

## Licencia

[MIT](LICENSE)
