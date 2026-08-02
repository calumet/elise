# Referencias externas

Elise se construye sobre librerías de código abierto bien documentadas. Aquí están los links a la documentación oficial de cada dependencia principal.

## Core

| Librería                | Uso en Elise                                                                         | Documentación                        |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| **Radix UI Primitives** | Base de todos los componentes de `@calumet/elise-ui` (accesibilidad, comportamiento) | https://www.radix-ui.com/primitives  |
| **Lucide Icons**        | Iconos en `@calumet/elise-icons` (re-export de `lucide-react`)                       | https://lucide.dev/icons/            |
| **Tailwind CSS v4**     | Sistema de estilos y tokens CSS                                                      | https://tailwindcss.com/docs         |
| **React 19**            | Framework de UI                                                                      | https://react.dev/                   |
| **TypeScript**          | Tipado estático en todo el proyecto                                                  | https://www.typescriptlang.org/docs/ |

## Utilidades de formularios

| Librería                | Uso en Elise                                                    | Documentación                                |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| **react-hook-form**     | Manejo de estado y validación de formularios (vía `useZodForm`) | https://react-hook-form.com/                 |
| **@hookform/resolvers** | Conecta Zod con react-hook-form                                 | https://github.com/react-hook-form/resolvers |
| **Zod**                 | Definición de schemas y validación de datos                     | https://zod.dev/                             |

## Tablas

| Librería                    | Uso en Elise                                             | Documentación                     |
| --------------------------- | -------------------------------------------------------- | --------------------------------- |
| **TanStack React Table v8** | Motor de `DataTable` (filtros, ordenamiento, paginación) | https://tanstack.com/table/latest |

## Componentes especializados

| Librería             | Uso en Elise                                                 | Documentación                    |
| -------------------- | ------------------------------------------------------------ | -------------------------------- |
| **Embla Carousel**   | Motor del componente `Carousel`                              | https://www.embla-carousel.com/  |
| **react-day-picker** | Motor de `Calendar`, `DatePicker` y `DateRangePicker`        | https://react-day-picker.js.org/ |
| **cmdk**             | Motor del componente `Command` (paleta de comandos/búsqueda) | https://cmdk.paco.me/            |

## Utilidades CSS

| Librería                           | Uso en Elise                                      | Documentación                             |
| ---------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| **clsx**                           | Concatenación condicional de clases CSS           | https://github.com/lukeed/clsx            |
| **tailwind-merge**                 | Resolución de conflictos entre clases de Tailwind | https://github.com/dcastil/tailwind-merge |
| **class-variance-authority (CVA)** | Manejo de variantes de componentes                | https://cva.style/docs                    |

## Herramientas de build

| Herramienta           | Uso en Elise                                         | Documentación                                                   |
| --------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| **pnpm**              | Package manager y workspaces                         | https://pnpm.io/                                                |
| **tsup**              | Bundler de paquetes de librería (ESM + CJS + .d.ts)  | https://tsup.egoist.dev/                                        |
| **Vite**              | Dev server de la app showcase                        | https://vite.dev/                                               |
| **@tailwindcss/vite** | Integración de Tailwind CSS v4 en Vite (sin PostCSS) | https://tailwindcss.com/docs/installation/framework-guides/vite |
| **ESLint**            | Linter de código (flat config)                       | https://eslint.org/                                             |
| **Prettier**          | Formateador de código                                | https://prettier.io/                                            |

## Design systems de referencia

No son dependencias. Se consultan para decidir gramática de tokens, división de
componentes y alcance del catálogo; el [plan](plan.md) detalla qué se toma de
cada uno.

| Sistema               | Se consulta para                                                               |
| --------------------- | ------------------------------------------------------------------------------ |
| **Polaris** (Shopify) | Gramática de tokens y el patrón de primitivo componible más envoltorio opinado |
| **Astryx** (Meta)     | El modelo de tres capas y el alcance del catálogo                              |

Documentación: https://polaris.shopify.com/ y https://astryx.meta.com/

---

Volver a: [Guía de inicio](guia-inicio.md) | [Arquitectura](arquitectura.md) | [Linter y formato](linter.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md)
