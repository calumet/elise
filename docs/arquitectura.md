# Arquitectura

## Posicionamiento

Elise es la **plataforma frontend de Calumet**: agrupa tanto el design system
(componentes Radix + Tailwind) como las utilidades de frontend oficiales
(formularios, tablas, feedback). El nombre "Elise" sigue siendo la marca; el
scope del monorepo es más amplio que un design system estricto.

## Monorepo

Elise está organizado como un monorepo gestionado con [pnpm workspaces](https://pnpm.io/workspaces). Todos los paquetes residen en `packages/` y se referencian entre sí con el protocolo `workspace:*`.

```
elise/
├── packages/
│   ├── ui/           @calumet/elise-ui        Componentes UI
│   ├── forms/        @calumet/elise-forms     useZodForm (RHF + Zod)
│   ├── tables/       @calumet/elise-tables    DataTable (TanStack)
│   ├── toasts/       @calumet/elise-toasts    Sistema de toasts
│   ├── alerts/       @calumet/elise-alerts    Sistema de alertas
│   ├── i18n/         @calumet/elise-i18n      Internacionalizacion (Intl)
│   ├── icons/        @calumet/elise-icons     Iconos (Lucide)
│   ├── linter/       @calumet/elise-linter    Config ESLint + Prettier
│   ├── blocks/       @calumet/elise-blocks    Pantallas armadas
│   └── showcase/     showcase                 App demo
├── package.json                                Scripts globales
├── pnpm-workspace.yaml                         Config workspaces
├── tsconfig.base.json                          TypeScript base compartido
└── eslint.config.js                            ESLint raiz (flat config)
```

## Grafo de dependencias

```
@calumet/elise-icons   ─────────────────────────────┐
                                                    │
@calumet/elise-ui      ──── @calumet/elise-icons    │
                                                    │
@calumet/elise-forms    (independiente; React + RHF + Zod)
                                                    │
@calumet/elise-tables  ──── @calumet/elise-ui ──────┤
                       └── @calumet/elise-icons     │
                                                    │
@calumet/elise-toasts  ──── @calumet/elise-ui ──────┤
                       └── @calumet/elise-icons     │
                                                    │
@calumet/elise-alerts  ──── @calumet/elise-ui ──────┤
                       └── @calumet/elise-icons     │
                                                    │
@calumet/elise-blocks  ──── @calumet/elise-ui ──────┤
                       └── @calumet/elise-icons     │
                                                    │
@calumet/elise-i18n    (independiente; solo React)  │
                                                    │
showcase ──────── @calumet/elise-ui ────────────────┤
              ├── @calumet/elise-forms              │
              ├── @calumet/elise-tables             │
              ├── @calumet/elise-toasts             │
              ├── @calumet/elise-alerts             │
              ├── @calumet/elise-blocks             │
              ├── @calumet/elise-i18n               │
              └── @calumet/elise-icons ─────────────┘
```

## Paquetes

### @calumet/elise-ui

Librería principal de componentes. Construida sobre [Radix UI Primitives](https://www.radix-ui.com/primitives) para accesibilidad y estilizada con [Tailwind CSS v4](https://tailwindcss.com/).

- **58 componentes** exportados individualmente y vía barrel
- **Sistema de temas** con ThemeProvider (light/dark)
- **Tokens CSS** semánticos (e.g., `--primary`, `--background`) mapeados a utilidades de Tailwind
- **Peer dependencies**: React 19, React DOM 19

### @calumet/elise-forms

Integración de [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para validación de formularios con inferencia de tipos.

- Exporta `useZodForm()` y el re-export `z` de Zod
- **Independiente de `elise-ui`** (puede usarse con cualquier UI)
- **Peer dependencies**: React 19

### @calumet/elise-tables

Componente `DataTable` con filtros, ordenamiento, paginación y exportación CSV/JSON. Construido sobre [TanStack React Table v8](https://tanstack.com/table).

- **Peer dependencies**: React 19, `@calumet/elise-ui`, `@calumet/elise-icons`
- Dep directa: `@tanstack/react-table`

### @calumet/elise-toasts

Sistema de notificaciones tipo toast basado en event bus, con componente `Toaster` y API funcional `toast()` / `dismiss()`.

- **Peer dependencies**: React 19, `@calumet/elise-ui`, `@calumet/elise-icons`

### @calumet/elise-alerts

Sistema de alertas modales basado en event bus, con componente `AlertHost` y API funcional `openAlert()` / `closeAlert()`.

- **Peer dependencies**: React 19, `@calumet/elise-ui`, `@calumet/elise-icons`

### @calumet/elise-blocks

La tercera capa: pantallas armadas sobre el catálogo. Un bloque no agrega
componentes nuevos, arma los que ya hay en la disposición que se repite de una
pantalla a otra, para que cada aplicación no la vuelva a inventar.

`AppShell` no vive acá aunque sea el marco de una aplicación: es un componente
con estado y partes componibles, no una pantalla. Lo que se muda cuando haga
falta son los patrones que lo usan.

- **Peer dependencies**: React 19, `@calumet/elise-ui`, `@calumet/elise-icons`

### @calumet/elise-i18n

Internacionalización y formateo localizado. Independiente de `elise-ui`; solo
requiere React como peer-dependency. El barrel raíz expone `I18nProvider`,
`useTranslation`, `useLocale`, `buildMessages` y `buildLazyLoader`. Para más
detalles ver [docs/i18n.md](i18n.md).

| Sub-módulo  | Descripción                                                             | Dependencia externa                                                                                                         |
| ----------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `./dates`   | `formatDate`, `formatDateRange`, `useDateRange` (formateo con `Intl`)   | [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) |
| `./numbers` | `formatNumber`, `formatCurrency`, `formatPercent` (formateo con `Intl`) | [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)     |

### @calumet/elise-icons

Wrapper de re-exportación sobre [`lucide-react`](https://lucide.dev/icons/). Centraliza la dependencia de iconos para que los consumidores solo necesiten importar desde `@calumet/elise-icons`.

### @calumet/elise-linter

Configuración compartida de herramientas de calidad de código:

- **ESLint** (flat config): tres presets combinables — `base`, `react`, `tailwind`
- **Prettier**: 100 caracteres, 2 espacios, trailing commas, LF
- Plugins base: `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import`
- Tailwind lint opcional: `eslint-plugin-better-tailwindcss` (solo si usas `configs.tailwind`)

Ver setup completo en [Linter y formato](linter.md).

## Criterios de fragmentación de paquetes

Elise sigue una filosofía de **un paquete por dominio**. Cada feature de
frontend que arrastra una peer-dep o un ecosistema distinto (formularios,
tablas, feedback, i18n) vive en su propio paquete, para que un consumidor
externo instale solo lo que usa.

Reglas:

- Si una feature arrastra una dep pesada (`@tanstack/react-table`, `react-hook-form`,
  `i18next`, etc.) → paquete propio.
- Si una feature pertenece a un dominio claramente distinto (UI vs. localización
  vs. validación) → paquete propio.
- Si dos features comparten dominio y peer-deps, pueden cohabitar (ej. `toasts`
  y `alerts` podrían fusionarse a futuro en `elise-feedback` si se confirma que
  comparten audiencia).
- Evitar paquetes "agregadores" que solo re-exportan: añaden mantenimiento sin
  beneficio para el consumidor.

## Patrones de diseño

### Compound components

Los componentes complejos se exportan como múltiples sub-componentes composables:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@calumet/elise-ui/card";

<Card>
  <CardHeader>
    <CardTitle>Titulo</CardTitle>
    <CardDescription>Descripcion</CardDescription>
  </CardHeader>
  <CardContent>Contenido</CardContent>
  <CardFooter>Pie</CardFooter>
</Card>;
```

Este patrón proviene de [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction) y permite componer la UI de forma flexible y accesible.

### forwardRef

Todos los componentes interactivos usan `React.forwardRef` para exponer el ref al elemento DOM subyacente:

```tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", ...props }, ref) => {
    return <button ref={ref} className={cn(baseClasses, className)} {...props} />;
  },
);
```

### Utilidad `cn()`

Función que combina [`clsx`](https://github.com/lukeed/clsx) + [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) para concatenar clases CSS sin conflictos:

```tsx
import { cn } from "@/lib/cn";

cn("px-4 py-2", condition && "bg-primary", className);
// Resuelve conflictos de Tailwind automaticamente
```

### Patrón `asChild` (Radix)

Muchos componentes soportan la prop `asChild` de Radix, que permite renderizar el componente como un hijo personalizado en lugar del elemento por defecto:

```tsx
import { Button } from "@calumet/elise-ui/button";

// Renderiza como <a> en lugar de <button>
<Button asChild>
  <a href="/pagina">Ir a pagina</a>
</Button>;
```

Consulta la [documentación de Radix sobre asChild](https://www.radix-ui.com/primitives/docs/guides/composition) para más detalles.

## Sistema de build

Todos los paquetes de librería usan [tsup](https://tsup.egoist.dev/) como bundler:

- **Formatos de salida**: ESM (`.mjs`) + CommonJS (`.cjs`)
- **Declaraciones TypeScript**: generadas automáticamente (`.d.ts`)
- **Source maps**: habilitados
- **Orden de build**: `icons → ui → i18n → forms → tables → toasts → alerts → showcase`

La app de showcase usa [Vite](https://vite.dev/) con:

- `@vitejs/plugin-react` para React/JSX
- `@tailwindcss/vite` para procesar Tailwind CSS v4 sin PostCSS

Para detalles de setup en apps consumidoras, ver [Guía de inicio](guia-inicio.md) y la
[documentación oficial de Tailwind](https://tailwindcss.com/docs/installation/framework-guides/vite).

## TypeScript

Configuración base compartida en `tsconfig.base.json`:

- **Target**: ES2020
- **Module**: ESNext
- **Strict mode**: habilitado
- **JSX**: react-jsx
- **Module resolution**: Bundler

Cada paquete extiende la configuración base y agrega sus propios paths y configuraciones específicas.

---

Siguiente: [Temas](temas.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md) | [Linter y formato](linter.md)
