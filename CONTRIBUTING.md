# Contribuir a Elise

Gracias por tu interés en contribuir a Elise.

## Configuración de Desarrollo

1. Haz fork y clona el repositorio.
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Compila todos los paquetes:
   ```bash
   pnpm build
   ```
4. Ejecuta linting:
   ```bash
   pnpm lint
   ```

## Estructura del Proyecto

```txt
elise/
  packages/
    ui/           # Componentes UI (Radix + Tailwind)
    forms/        # useZodForm (react-hook-form + Zod)
    tables/       # DataTable (TanStack React Table)
    toasts/       # Sistema de toasts (event bus + Toaster)
    alerts/       # Sistema de alertas modales (event bus + AlertHost)
    i18n/         # Internacionalización y formateo (Intl)
    icons/        # Iconos (re-export de Lucide)
    linter/       # Config compartida de ESLint + Prettier
    showcase/     # App demo interactiva (Vite + React 19)
    blocks/       # (reservado para uso futuro)
  docs/           # Documentación del proyecto
```

Cada utilidad de frontend vive en su propio paquete (`elise-forms`, `elise-tables`, etc.) para que los consumidores externos instalen solo lo que necesiten. Ver criterios de fragmentación en [`docs/arquitectura.md`](docs/arquitectura.md#criterios-de-fragmentacion-de-paquetes).

## Flujo de Desarrollo

### Realizar Cambios

1. Crea una rama nueva para tu feature o fix.
2. Haz los cambios en el paquete correspondiente.
3. Ejecuta linting: `pnpm lint`
4. Formatea código: `pnpm format`
5. Compila paquetes: `pnpm build`

### Desarrollo de Paquetes

Cada paquete tiene su propio modo de desarrollo:

```bash
# Watch para @calumet/elise-ui solamente
pnpm dev

# Watch para todos los paquetes + showcase en paralelo
pnpm dev:showcase
```

### Probar Cambios

Usa la app showcase para validar tus cambios visualmente:

```bash
pnpm dev:showcase
# Abre http://localhost:5173
```

La showcase incluye demos de todos los componentes y utilidades. Si agregas un componente nuevo, crea una sección demo en `packages/showcase/src/sections/`.

## Estilo de Código

La configuración de ESLint y Prettier está centralizada en `@calumet/elise-linter`. No necesitas configurar nada adicional.

- Para proyectos no web usa `configs.base` o `configs.react`.
- Si usas `configs.tailwind`, instala también `tailwindcss` y `eslint-plugin-better-tailwindcss`.

- Usa TypeScript para todo el código.
- Sigue el estilo de código existente.
- Usa `React.forwardRef` para componentes interactivos.
- Usa la utilidad `cn()` para concatenar clases de Tailwind.
- Usa el atributo `data-slot` para identificar sub-componentes.
- Prefija parámetros no usados con `_`.

### Formateo automático

```bash
# Verificar formato
pnpm format:check

# Aplicar formato
pnpm format

# Verificar y corregir linting
pnpm lint:fix
```

## Mensajes de Commit

Usa mensajes claros y descriptivos con [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add Breadcrumb component`
- `fix: correct theme toggle in dark mode`
- `docs: update utilities documentation`
- `refactor: standardize import statements`
- `chore: update Radix dependencies`

## Pull Requests

1. Asegura que linting y build pasen sin errores.
2. Actualiza documentación si aplica.
3. Si agregas un componente nuevo a `elise-ui`, agrégalo al barrel export en `packages/ui/src/components/index.ts`.
4. Si agregas una utilidad a un paquete existente (`elise-forms`, `elise-tables`, etc.), documéntala en `docs/utilidades.md`.
5. Si propones un paquete nuevo, valida primero contra los [criterios de fragmentación](docs/arquitectura.md#criterios-de-fragmentacion-de-paquetes).
6. Referencia issues relacionados.

## Versionado y Publicación

- Los paquetes se publican bajo el scope `@calumet/elise-*`.
- No republiques una versión existente.
- Para cualquier cambio publicable, incrementa versión en su `package.json` antes de publicar.
- Política de versionado:
  - `patch` para correcciones (`0.1.0 -> 0.1.1`)
  - `minor` para features retrocompatibles (`0.1.x -> 0.2.0`)
  - `major` para cambios incompatibles

## ¿Preguntas?

Puedes abrir un issue para discutir antes de empezar cambios grandes.
