# @calumet/elise-forms

`useZodForm` conecta react-hook-form con Zod en una sola llamada, ya con el resolver puesto.

## Instalación

```bash
pnpm add jsr:@calumet/elise-forms     # JSR
pnpm add @calumet/elise-forms         # GitHub Packages
```

Requiere React 19. La configuración del registro de GitHub está en el [README del repositorio](../../README.md#consumir-los-paquetes).

## Uso

```tsx
import { useZodForm, z } from "@calumet/elise-forms";

const esquema = z.object({
  email: z.email(),
  edad: z.coerce.number().min(18),
});

const form = useZodForm(esquema);
```

El segundo parámetro admite las mismas opciones que `useForm`, menos `resolver`. Los tipos distinguen la entrada de la salida del esquema, así que `edad` llega como `string` desde el input y sale como `number` en `handleSubmit`.

Reexportamos `z` para que el esquema y el hook vengan de la misma versión de Zod.
