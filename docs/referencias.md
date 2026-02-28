# Referencias externas

Elise se construye sobre librerias de codigo abierto bien documentadas. Aqui estan los links a la documentacion oficial de cada dependencia principal.

## Core

| Libreria                | Uso en Elise                                                                         | Documentacion                        |
| ----------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| **Radix UI Primitives** | Base de todos los componentes de `@calumet/elise-ui` (accesibilidad, comportamiento) | https://www.radix-ui.com/primitives  |
| **Radix Icons**         | Iconos en `@calumet/elise-icons`                                                     | https://www.radix-ui.com/icons       |
| **Tailwind CSS v4**     | Sistema de estilos y tokens CSS                                                      | https://tailwindcss.com/docs         |
| **React 19**            | Framework de UI                                                                      | https://react.dev/                   |
| **TypeScript**          | Tipado estatico en todo el proyecto                                                  | https://www.typescriptlang.org/docs/ |

## Utilidades de formularios

| Libreria                | Uso en Elise                                                    | Documentacion                                |
| ----------------------- | --------------------------------------------------------------- | -------------------------------------------- |
| **react-hook-form**     | Manejo de estado y validacion de formularios (via `useZodForm`) | https://react-hook-form.com/                 |
| **@hookform/resolvers** | Conecta Zod con react-hook-form                                 | https://github.com/react-hook-form/resolvers |
| **Zod**                 | Definicion de schemas y validacion de datos                     | https://zod.dev/                             |

## Tablas

| Libreria                    | Uso en Elise                                             | Documentacion                     |
| --------------------------- | -------------------------------------------------------- | --------------------------------- |
| **TanStack React Table v8** | Motor de `DataTable` (filtros, ordenamiento, paginacion) | https://tanstack.com/table/latest |

## Componentes especializados

| Libreria             | Uso en Elise                                                 | Documentacion                    |
| -------------------- | ------------------------------------------------------------ | -------------------------------- |
| **Embla Carousel**   | Motor del componente `Carousel`                              | https://www.embla-carousel.com/  |
| **react-day-picker** | Motor de `Calendar`, `DatePicker` y `DateRangePicker`        | https://react-day-picker.js.org/ |
| **cmdk**             | Motor del componente `Command` (paleta de comandos/busqueda) | https://cmdk.paco.me/            |

## Utilidades CSS

| Libreria                           | Uso en Elise                                      | Documentacion                             |
| ---------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| **clsx**                           | Concatenacion condicional de clases CSS           | https://github.com/lukeed/clsx            |
| **tailwind-merge**                 | Resolucion de conflictos entre clases de Tailwind | https://github.com/dcastil/tailwind-merge |
| **class-variance-authority (CVA)** | Manejo de variantes de componentes                | https://cva.style/docs                    |

## Herramientas de build

| Herramienta  | Uso en Elise                                        | Documentacion            |
| ------------ | --------------------------------------------------- | ------------------------ |
| **pnpm**     | Package manager y workspaces                        | https://pnpm.io/         |
| **tsup**     | Bundler de paquetes de libreria (ESM + CJS + .d.ts) | https://tsup.egoist.dev/ |
| **Vite**     | Dev server de la app showcase                       | https://vite.dev/        |
| **ESLint**   | Linter de codigo (flat config)                      | https://eslint.org/      |
| **Prettier** | Formateador de codigo                               | https://prettier.io/     |

---

Volver a: [Guia de inicio](guia-inicio.md) | [Arquitectura](arquitectura.md) | [Componentes](componentes.md) | [Utilidades](utilidades.md)
