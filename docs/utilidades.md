# Utilidades

`@calumet/elise-utils` proporciona utilidades de alto nivel que componen los componentes de `@calumet/elise-ui` en abstracciones mas complejas. Cada sub-modulo se importa por separado.

```tsx
import { useZodForm } from "@calumet/elise-utils/forms";
import { toast, Toaster } from "@calumet/elise-utils/toasts";
import { openAlert, AlertHost } from "@calumet/elise-utils/alerts";
import { DataTable } from "@calumet/elise-utils/tables";
import { formatDate, useDateRange } from "@calumet/elise-utils/dates";
```

---

## Forms - `useZodForm()`

Hook que integra [react-hook-form](https://react-hook-form.com/) con [Zod](https://zod.dev/) para validacion de formularios con inferencia de tipos automatica.

### Uso basico

```tsx
import { useZodForm } from "@calumet/elise-utils/forms";
import { z } from "zod";
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
function useZodForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">,
): UseFormReturn<z.infer<TSchema>>;
```

- `schema`: Esquema Zod que define la estructura y validacion del formulario
- `options`: Todas las opciones de `useForm` de react-hook-form **excepto** `resolver` (que se configura automaticamente)
- Retorna: Objeto `UseFormReturn` de react-hook-form con tipos inferidos del schema

> **Dependencias externas**: Consulta la documentacion de [Zod](https://zod.dev/) para definir schemas y [react-hook-form](https://react-hook-form.com/) para el manejo del formulario.

---

## Toasts - Notificaciones

Sistema de notificaciones no-bloqueantes basado en un event bus interno. No requiere hooks ni contexto — puedes disparar toasts desde cualquier parte del codigo.

### Setup

Agrega `<Toaster />` una sola vez en el root de tu aplicacion:

```tsx
import { Toaster } from "@calumet/elise-utils/toasts";

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
import { toast, dismiss } from "@calumet/elise-utils/toasts";

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
toast({ title: "Procesando...", duration: 8000 });

// Cerrar un toast especifico
const id = toast({ title: "Cargando..." });
dismiss(id);
```

### Variantes

| Variante           | Icono                 | Color             |
| ------------------ | --------------------- | ----------------- |
| `"info"` (default) | Info circulo          | `--elise-primary` |
| `"success"`        | Check circulo         | `--elise-success` |
| `"alert"`          | Triangulo exclamacion | `--elise-warning` |
| `"error"`          | Cruz circulo          | `--elise-danger`  |

### API `toast()`

```typescript
type ToastOptions = {
  id?: string; // ID personalizado (auto-generado si se omite)
  title?: string; // Titulo del toast
  description?: string; // Descripcion/cuerpo
  variant?: "info" | "alert" | "error" | "success"; // Default: "info"
  duration?: number; // Duracion en ms (default: 4000)
  actionLabel?: string; // Texto del boton de accion
  action?: () => void; // Callback al hacer click en la accion
};
```

### Posiciones del Toaster

| Valor                   | Ubicacion             |
| ----------------------- | --------------------- |
| `"top-right"` (default) | Arriba a la derecha   |
| `"top-left"`            | Arriba a la izquierda |
| `"bottom-right"`        | Abajo a la derecha    |
| `"bottom-left"`         | Abajo a la izquierda  |

---

## Alerts - Alertas modales

Sistema de alertas/confirmaciones modales basado en event bus, similar a toasts pero con dialogo bloqueante. Usa internamente el componente `AlertDialog` de Radix.

### Setup

Agrega `<AlertHost />` una sola vez en el root de tu aplicacion:

```tsx
import { AlertHost } from "@calumet/elise-utils/alerts";

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
import { openAlert, closeAlert } from "@calumet/elise-utils/alerts";

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

| Variante            | Icono                  | Color             | Comportamiento                                           |
| ------------------- | ---------------------- | ----------------- | -------------------------------------------------------- |
| `"alert"` (default) | Triangulo exclamacion  | `--elise-warning` | Muestra boton cancelar si hay `onCancel` o `cancelLabel` |
| `"info"`            | Info circulo           | `--elise-primary` | Solo boton "Aceptar"                                     |
| `"error"`           | Cruz circulo           | `--elise-danger`  | Solo boton "Aceptar"                                     |
| `"confirm"`         | Signo de interrogacion | `--elise-primary` | Siempre muestra "Confirmar" + "Cancelar"                 |
| `"success"`         | Check circulo          | `--elise-success` | Solo boton "Aceptar"                                     |

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

## Dates - Fechas

Utilidades para formateo de fechas y manejo de rangos. Usa `Intl.DateTimeFormat` para internacionalizacion nativa.

### `formatDate()`

```tsx
import { formatDate } from "@calumet/elise-utils/dates";

formatDate(new Date());
// "Feb 27, 2026"

formatDate(new Date(), { locale: "es-CO", month: "long" });
// "27 de febrero de 2026"

formatDate(new Date(), { locale: "en-US", weekday: "long" });
// "Thursday, Feb 27, 2026"
```

### `formatDateRange()`

```tsx
import { formatDateRange } from "@calumet/elise-utils/dates";

formatDateRange({
  from: new Date(2026, 0, 1),
  to: new Date(2026, 0, 31),
});
// "Jan 1, 2026 – Jan 31, 2026"

formatDateRange(
  {
    from: new Date(2026, 0, 1),
    to: new Date(2026, 0, 31),
  },
  { locale: "es-CO" },
);
// "1 ene 2026 – 31 ene 2026"
```

### `useDateRange()`

Hook para manejar estado de un rango de fechas:

```tsx
import { useDateRange } from "@calumet/elise-utils/dates";
import { DateRangePicker } from "@calumet/elise-ui/date-picker";

function MiComponente() {
  const { range, setRange, setFrom, setTo, reset } = useDateRange();

  return (
    <div>
      <DateRangePicker value={range} onChange={setRange} />
      <button onClick={reset}>Limpiar</button>
    </div>
  );
}
```

### API

```typescript
type DateRange = { from?: Date; to?: Date };
type DateFormatOptions = Intl.DateTimeFormatOptions & { locale?: string | string[] };

function formatDate(date: Date, options?: DateFormatOptions): string;
function formatDateRange(range: DateRange, options?: DateFormatOptions): string;
function useDateRange(options?: { initial?: DateRange }): {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  setFrom: (from?: Date) => void;
  setTo: (to?: Date) => void;
  reset: () => void;
};
```

> Las opciones de formato son las mismas de [`Intl.DateTimeFormatOptions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options).

---

## Tables - DataTable

Componente de tabla avanzada con filtros, ordenamiento, paginacion y exportacion. Construido sobre [TanStack React Table v8](https://tanstack.com/table/latest).

### Uso basico

```tsx
import { DataTable, type ColumnDef } from "@calumet/elise-utils/tables";

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

Los filtros se configuran via `meta.filterVariant` en la definicion de columnas:

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

| filterVariant | Descripcion                          | Control                                     |
| ------------- | ------------------------------------ | ------------------------------------------- |
| `"text"`      | Busqueda de texto libre              | Input con icono de lupa                     |
| `"select"`    | Seleccion multiple de valores unicos | Popover con Command (busqueda + checkboxes) |
| `"range"`     | Rango numerico min/max               | Dos inputs numericos                        |
| `"date"`      | Fecha individual                     | DatePicker                                  |
| `"daterange"` | Rango de fechas                      | DateRangePicker                             |

### Con exportacion y refresh

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

| Prop              | Tipo                             | Default           | Descripcion                              |
| ----------------- | -------------------------------- | ----------------- | ---------------------------------------- |
| `columns`         | `ColumnDef<TData>[]`             | _requerido_       | Definicion de columnas (TanStack)        |
| `data`            | `TData[]`                        | _requerido_       | Datos a mostrar                          |
| `name`            | `string`                         | —                 | Nombre para archivos de exportacion      |
| `isLoading`       | `boolean`                        | —                 | Muestra mensaje de carga si no hay datos |
| `exportTo`        | `boolean`                        | —                 | Habilita exportacion CSV/JSON            |
| `refresh`         | `() => void \| Promise<unknown>` | —                 | Callback para boton de refresh           |
| `pageSizeOptions` | `number[]`                       | `[5, 10, 25, 50]` | Opciones de tamano de pagina             |
| `initialPageSize` | `number`                         | —                 | Tamano de pagina inicial                 |

> **Dependencia externa**: La definicion de columnas (`ColumnDef`) y toda la API de tablas viene de [TanStack React Table v8](https://tanstack.com/table/latest/docs/introduction). Consulta su documentacion para guias de columnas, celdas personalizadas y features avanzados.

---

## Icons

`@calumet/elise-icons` re-exporta todos los iconos de [`@radix-ui/react-icons`](https://www.radix-ui.com/icons).

```tsx
import { MagnifyingGlassIcon, ChevronDownIcon, Cross2Icon } from "@calumet/elise-icons";

<MagnifyingGlassIcon className="size-4" />
<ChevronDownIcon className="size-4 text-muted-foreground" />
```

> Consulta la [galeria de Radix Icons](https://www.radix-ui.com/icons) para ver todos los iconos disponibles con sus nombres de importacion.

---

Siguiente: [Temas](temas.md) | [Componentes](componentes.md) | [Referencias](referencias.md)
