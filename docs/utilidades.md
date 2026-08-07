# Utilidades

Las utilidades de frontend de Elise están organizadas en paquetes independientes,
cada uno con su propio scope y peer-deps. Instala solo los que necesites.

```tsx
import { useZodForm, z } from "@calumet/elise-forms";
import { toast, Toaster } from "@calumet/elise-toasts";
import { openAlert, AlertHost } from "@calumet/elise-alerts";
import { DataTable } from "@calumet/elise-tables";
import { formatDate, useDateRange } from "@calumet/elise-i18n/dates";
```

| Paquete                 | Propósito                                 | Peer-deps clave                                                      |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| `@calumet/elise-forms`  | Formularios con `useZodForm`              | react-hook-form, zod, @hookform/resolvers                            |
| `@calumet/elise-toasts` | Notificaciones (event bus + `Toaster`)    | `@calumet/elise-ui`, `@calumet/elise-icons`                          |
| `@calumet/elise-alerts` | Alertas modales (event bus + `AlertHost`) | `@calumet/elise-ui`, `@calumet/elise-icons`                          |
| `@calumet/elise-tables` | `DataTable` con filtros y export          | `@calumet/elise-ui`, `@calumet/elise-icons`, `@tanstack/react-table` |
| `@calumet/elise-i18n`   | Traducciones + formateo localizado (Intl) | (solo React)                                                         |

> **Internacionalización**: el sistema de traducciones (`I18nProvider`, `useTranslation`),
> formateo de fechas y números y la integración automática con `elise-tables`/
> `elise-alerts`/`elise-toasts` están documentados en [`docs/i18n.md`](i18n.md).

> **Migración desde `@calumet/elise-utils`**: este paquete agregador fue eliminado.
> Los imports cambian de `@calumet/elise-utils/<modulo>` a `@calumet/elise-<modulo>`.
> La API de cada módulo es idéntica.

---

## Forms - `useZodForm()`

Hook que integra [react-hook-form](https://react-hook-form.com/) con [Zod](https://zod.dev/) para validación de formularios con inferencia de tipos automática.

### Uso basico

```tsx
import { useZodForm, z } from "@calumet/elise-forms";
import { Form, FormField, FormLabel, FormControl, FormMessage } from "@calumet/elise-ui/form";
import { Input } from "@calumet/elise-ui/input";
import { Button } from "@calumet/elise-ui/button";

const schema = z.object({
  nombre: z.string().min(2, "Minimo 2 caracteres"),
  email: z.string().email("Email invalido"),
});

function ContactForm() {
  const form = useZodForm(schema, {
    defaultValues: { nombre: "", email: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    // data tiene tipo { nombre: string; email: string }
    console.log(data);
  });

  return (
    <Form onSubmit={onSubmit}>
      <FormField name="nombre" serverInvalid={!!form.formState.errors.nombre}>
        <FormLabel>Nombre</FormLabel>
        <FormControl asChild>
          <Input {...form.register("nombre")} placeholder="Tu nombre" />
        </FormControl>
        <FormMessage>{form.formState.errors.nombre?.message}</FormMessage>
      </FormField>

      <FormField name="email" serverInvalid={!!form.formState.errors.email}>
        <FormLabel>Email</FormLabel>
        <FormControl asChild>
          <Input {...form.register("email")} placeholder="tu@email.com" />
        </FormControl>
        <FormMessage>{form.formState.errors.email?.message}</FormMessage>
      </FormField>

      <Button type="submit">Enviar</Button>
    </Form>
  );
}
```

### API

```typescript
function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, "resolver">,
): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>>;
```

> El hook separa `z.input<TSchema>` (valores que entran al form, antes de coerciones) de `z.output<TSchema>` (valores que salen de `handleSubmit`, después de validar y transformar). Esto te da tipos correctos cuando el schema usa `z.coerce.*`, `transform`, defaults, etc.

- `schema`: Esquema Zod que define la estructura y validación del formulario
- `options`: Todas las opciones de `useForm` de react-hook-form **excepto** `resolver` (que se configura automáticamente)
- Retorna: Objeto `UseFormReturn` de react-hook-form con tipos inferidos del schema

> **Dependencias externas**: Consulta la documentación de [Zod](https://zod.dev/) para definir schemas y [react-hook-form](https://react-hook-form.com/) para el manejo del formulario.

---

## Toasts - Notificaciones

Sistema de notificaciones no-bloqueantes basado en un event bus interno. No requiere hooks ni contexto — puedes disparar toasts desde cualquier parte del código.

### Setup

Agrega `<Toaster />` una sola vez en el root de tu aplicación:

```tsx
import { Toaster } from "@calumet/elise-toasts";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      {/* Tu app */}
    </>
  );
}
```

### Disparar un toast

```tsx
import { toast, dismiss } from "@calumet/elise-toasts";

// Toast basico
toast({ title: "Guardado", description: "Los cambios se guardaron correctamente." });

// Con variante
toast({ title: "Error", description: "No se pudo conectar.", variant: "error" });

// Con accion
toast({
  title: "Archivo eliminado",
  description: "Se movio a la papelera.",
  variant: "alert",
  actionLabel: "Deshacer",
  action: () => restaurarArchivo(),
});

// Con duracion personalizada (ms)
toast({ title: "Procesando", description: "Estamos con tu pedido.", duration: 8000 });

// Cerrar un toast especifico
const id = toast({ title: "Cargando", description: "Trayendo los datos." });
dismiss(id);
```

El titulo y la descripcion son obligatorios. El icono va en un disco de 28px y
cada renglon de texto mide 20, asi que un aviso de una sola linea deja el disco
por debajo del titular.

### Variantes

| Variante           | Icono                 | Color           |
| ------------------ | --------------------- | --------------- |
| `"info"` (default) | Info circulo          | `--primary`     |
| `"success"`        | Check circulo         | `--success`     |
| `"alert"`          | Triángulo exclamación | `--warning`     |
| `"error"`          | Cruz circulo          | `--destructive` |

### API `toast()`

```typescript
type ToastOptions = {
  id?: string; // ID personalizado (auto-generado si se omite)
  title: string; // Titulo del toast
  description: string; // Descripcion/cuerpo
  variant?: "info" | "alert" | "error" | "success"; // Default: "info"
  duration?: number; // Duracion en ms (default: 4000)
  actionLabel?: string; // Texto del boton de accion
  action?: () => void; // Callback al hacer click en la accion
};
```

### Posiciones del Toaster

| Valor                   | Ubicación             |
| ----------------------- | --------------------- |
| `"top-right"` (default) | Arriba a la derecha   |
| `"top-left"`            | Arriba a la izquierda |
| `"bottom-right"`        | Abajo a la derecha    |
| `"bottom-left"`         | Abajo a la izquierda  |

---

## Alerts - Alertas modales

Sistema de alertas/confirmaciones modales basado en event bus, similar a toasts pero con dialogo bloqueante. Usa internamente el componente `AlertDialog` de Radix.

### Setup

Agrega `<AlertHost />` una sola vez en el root de tu aplicación:

```tsx
import { AlertHost } from "@calumet/elise-alerts";

function App() {
  return (
    <>
      <AlertHost />
      {/* Tu app */}
    </>
  );
}
```

### Abrir una alerta

```tsx
import { openAlert, closeAlert } from "@calumet/elise-alerts";

// Alerta informativa
openAlert({
  title: "Informacion",
  description: "Tu sesion expirara en 5 minutos.",
  variant: "info",
});

// Confirmacion
openAlert({
  title: "Eliminar archivo",
  description: "Esta accion no se puede deshacer. ¿Estas seguro?",
  variant: "confirm",
  confirmLabel: "Si, eliminar",
  cancelLabel: "Cancelar",
  onConfirm: () => eliminarArchivo(),
  onCancel: () => console.log("Cancelado"),
});

// Alerta de error
openAlert({
  title: "Error de conexion",
  description: "No se pudo contactar al servidor.",
  variant: "error",
});
```

### Variantes

| Variante            | Icono                  | Color           | Comportamiento                                           |
| ------------------- | ---------------------- | --------------- | -------------------------------------------------------- |
| `"alert"` (default) | Triángulo exclamación  | `--warning`     | Muestra botón cancelar si hay `onCancel` o `cancelLabel` |
| `"info"`            | Info circulo           | `--primary`     | Solo botón "Aceptar"                                     |
| `"error"`           | Cruz circulo           | `--destructive` | Solo botón "Aceptar"                                     |
| `"confirm"`         | Signo de interrogación | `--primary`     | Siempre muestra "Confirmar" + "Cancelar"                 |
| `"success"`         | Check circulo          | `--success`     | Solo botón "Aceptar"                                     |

### API `openAlert()`

```typescript
type AlertOptions = {
  id?: string; // ID personalizado (auto-generado si se omite)
  title?: string; // Titulo de la alerta
  description?: string; // Descripcion/cuerpo
  variant?: "alert" | "info" | "error" | "confirm" | "success"; // Default: "alert"
  confirmLabel?: string; // Texto del boton de confirmacion (default: "Aceptar")
  cancelLabel?: string; // Texto del boton de cancelar (default: "Cancelar")
  onConfirm?: () => void; // Callback al confirmar
  onCancel?: () => void; // Callback al cancelar
};
```

---

## Tables - DataTable

Componente de tabla avanzada con filtros, ordenamiento, paginación y exportación. Construido sobre [TanStack React Table v8](https://tanstack.com/table/latest).

### Uso basico

```tsx
import { DataTable, type ColumnDef } from "@calumet/elise-tables";

type Persona = {
  nombre: string;
  email: string;
  rol: string;
};

const columns: ColumnDef<Persona>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "rol", header: "Rol" },
];

const data: Persona[] = [
  { nombre: "Ana", email: "ana@mail.com", rol: "Admin" },
  { nombre: "Luis", email: "luis@mail.com", rol: "Editor" },
];

function MiTabla() {
  return <DataTable columns={columns} data={data} />;
}
```

### Con filtros

Los filtros se configuran vía `meta.filterVariant` en la definición de columnas:

```tsx
const columns: ColumnDef<Persona>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    meta: { filterVariant: "text" }, // Filtro de texto libre
  },
  {
    accessorKey: "rol",
    header: "Rol",
    meta: { filterVariant: "select" }, // Filtro multi-select
  },
  {
    accessorKey: "salario",
    header: "Salario",
    meta: { filterVariant: "range" }, // Filtro min/max
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    meta: { filterVariant: "date" }, // Selector de fecha
  },
  {
    accessorKey: "periodo",
    header: "Periodo",
    meta: { filterVariant: "daterange" }, // Selector de rango de fechas
  },
];
```

| filterVariant | Descripción                          | Control                                     |
| ------------- | ------------------------------------ | ------------------------------------------- |
| `"text"`      | Búsqueda de texto libre              | Input con icono de lupa                     |
| `"select"`    | Selección múltiple de valores únicos | Popover con Command (búsqueda + checkboxes) |
| `"range"`     | Rango numérico min/max               | Dos inputs numéricos                        |
| `"date"`      | Fecha individual                     | DatePicker                                  |
| `"daterange"` | Rango de fechas                      | DateRangePicker                             |

### Con exportación y refresh

```tsx
function MiTabla() {
  const { data, refetch } = useMisDatos();

  return (
    <DataTable
      name="empleados" // Nombre para el archivo exportado
      columns={columns}
      data={data}
      exportTo // Habilita boton de exportacion (CSV/JSON)
      refresh={refetch} // Habilita boton de refresh
      initialPageSize={25} // Filas por pagina iniciales
      pageSizeOptions={[10, 25, 50, 100]}
    />
  );
}
```

### Props

| Prop              | Tipo                             | Default           | Descripción                              |
| ----------------- | -------------------------------- | ----------------- | ---------------------------------------- |
| `columns`         | `ColumnDef<TData>[]`             | _requerido_       | Definición de columnas (TanStack)        |
| `data`            | `TData[]`                        | _requerido_       | Datos a mostrar                          |
| `name`            | `string`                         | —                 | Nombre para archivos de exportación      |
| `isLoading`       | `boolean`                        | —                 | Muestra mensaje de carga si no hay datos |
| `exportTo`        | `boolean`                        | —                 | Habilita exportación CSV/JSON            |
| `refresh`         | `() => void \| Promise<unknown>` | —                 | Callback para botón de refresh           |
| `pageSizeOptions` | `number[]`                       | `[5, 10, 25, 50]` | Opciones de tamaño de página             |
| `initialPageSize` | `number`                         | —                 | Tamaño de página inicial                 |

> **Dependencia externa**: La definición de columnas (`ColumnDef`) y toda la API de tablas viene de [TanStack React Table v8](https://tanstack.com/table/latest/docs/introduction). Consulta su documentación para guías de columnas, celdas personalizadas y features avanzados.

---

## Icons

`@calumet/elise-icons` re-exporta todos los iconos de [`lucide-react`](https://lucide.dev/icons/).

```tsx
import { Search, ChevronDown, X } from "@calumet/elise-icons";

<Search className="size-4" />
<ChevronDown className="size-4 text-muted-foreground" />
```

> Consulta la [galería de Lucide](https://lucide.dev/icons/) para ver todos los iconos disponibles con sus nombres de importación.

---

Siguiente: [Temas](temas.md) | [Componentes](componentes.md) | [Referencias](referencias.md)
