# Arquitectura

## Monorepo

Elise esta organizado como un monorepo gestionado con [pnpm workspaces](https://pnpm.io/workspaces). Todos los paquetes residen en `packages/` y se referencian entre si con el protocolo `workspace:*`.

```
elise/
├── packages/
│   ├── ui/           @calumet/elise-ui        Componentes UI
│   ├── utils/        @calumet/elise-utils     Utilidades y hooks
│   ├── icons/        @calumet/elise-icons     Iconos (Radix)
│   ├── linter/       @calumet/elise-linter    Config ESLint + Prettier
│   ├── showcase/     showcase         App demo
│   └── blocks/       (futuro)         Bloques prefabricados
├── package.json                       Scripts globales
├── pnpm-workspace.yaml                Config workspaces
├── tsconfig.base.json                 TypeScript base compartido
└── eslint.config.js                   ESLint raiz (flat config)
```

## Grafo de dependencias

```
@calumet/elise-icons  ──────────────────┐
                                │
@calumet/elise-ui  ────── @calumet/elise-icons  │
                                │
@calumet/elise-utils ──── @calumet/elise-ui ────┤
              └── @calumet/elise-icons  │
                                │
showcase ──────── @calumet/elise-ui ────┤
              ├── @calumet/elise-utils  │
              └── @calumet/elise-icons ─┘
```

## Paquetes

### @calumet/elise-ui

Libreria principal de componentes. Construida sobre [Radix UI Primitives](https://www.radix-ui.com/primitives) para accesibilidad y estilizada con [Tailwind CSS v4](https://tailwindcss.com/).

- **45 componentes** exportados individualmente y via barrel
- **Sistema de temas** con ThemeProvider (light/dark)
- **Tokens CSS** personalizados (`--elise-*`) mapeados a utilidades de Tailwind
- **Peer dependencies**: React 19, React DOM 19

### @calumet/elise-utils

Utilidades de alto nivel que componen los componentes de `@calumet/elise-ui` en abstracciones mas complejas.

| Sub-modulo | Descripcion                 | Dependencia externa                                                                                                         |
| ---------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `./forms`  | Hook `useZodForm()`         | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                                                   |
| `./tables` | Componente `DataTable`      | [TanStack React Table v8](https://tanstack.com/table)                                                                       |
| `./toasts` | Sistema de notificaciones   | — (usa event bus interno)                                                                                                   |
| `./alerts` | Sistema de alertas modales  | — (usa event bus interno)                                                                                                   |
| `./dates`  | Formateo y rangos de fechas | [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) |

### @calumet/elise-icons

Wrapper de re-exportacion sobre [`@radix-ui/react-icons`](https://www.radix-ui.com/icons). Centraliza la dependencia de iconos para que los consumidores solo necesiten importar desde `@calumet/elise-icons`.

### @calumet/elise-linter

Configuracion compartida de herramientas de calidad de codigo:

- **ESLint** (flat config): tres presets combinables — `base`, `react`, `tailwind`
- **Prettier**: 100 caracteres, 2 espacios, trailing commas, LF
- Plugins: `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import`, `eslint-plugin-better-tailwindcss`

## Patrones de diseno

### Compound components

Los componentes complejos se exportan como multiples sub-componentes composables:

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

Este patron proviene de [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction) y permite componer la UI de forma flexible y accesible.

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

Funcion que combina [`clsx`](https://github.com/lukeed/clsx) + [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) para concatenar clases CSS sin conflictos:

```tsx
import { cn } from "@/lib/cn";

cn("px-4 py-2", condition && "bg-primary", className);
// Resuelve conflictos de Tailwind automaticamente
```

### Patron `asChild` (Radix)

Muchos componentes soportan la prop `asChild` de Radix, que permite renderizar el componente como un hijo personalizado en lugar del elemento por defecto:

```tsx
import { Button } from "@calumet/elise-ui/button";

// Renderiza como <a> en lugar de <button>
<Button asChild>
  <a href="/pagina">Ir a pagina</a>
</Button>;
```

Consulta la [documentacion de Radix sobre asChild](https://www.radix-ui.com/primitives/docs/guides/composition) para mas detalles.

## Sistema de build

Todos los paquetes de libreria usan [tsup](https://tsup.egoist.dev/) como bundler:

- **Formatos de salida**: ESM (`.mjs`) + CommonJS (`.cjs`)
- **Declaraciones TypeScript**: generadas automaticamente (`.d.ts`)
- **Source maps**: habilitados
- **Orden de build**: `icons → ui → utils → showcase`

La app de showcase usa [Vite](https://vite.dev/) con el plugin de React para desarrollo con hot reload.

## TypeScript

Configuracion base compartida en `tsconfig.base.json`:

- **Target**: ES2020
- **Module**: ESNext
- **Strict mode**: habilitado
- **JSX**: react-jsx
- **Module resolution**: Bundler

Cada paquete extiende la configuracion base y agrega sus propios paths y configuraciones especificas.

---

Siguiente: [Temas](temas.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md)
