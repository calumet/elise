# Componentes

`@calumet/elise-ui` exporta 49 componentes, la mayoria construidos sobre [Radix UI Primitives](https://www.radix-ui.com/primitives). Todos son accesibles y se estilizan con Tailwind CSS. Los mas antiguos usan `React.forwardRef`; los nuevos son funciones planas al estilo de React 19, donde `ref` llega como prop normal (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).

> Antes de usar los componentes, completa el setup de Tailwind CSS v4 (Vite + `@tailwindcss/vite`) de la [Guia de inicio](guia-inicio.md).

## Importacion

```tsx
// Por componente (recomendado)
import { Button } from "@calumet/elise-ui/button";

// Barrel import
import { Button, Dialog, Card } from "@calumet/elise-ui";
```

## Catalogo por categoria

### Layout

| Componente                                                                      | Import                           | Radix                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter           | `@calumet/elise-ui/card`         | —                                                                               |
| Separator                                                                       | `@calumet/elise-ui/separator`    | [Separator](https://www.radix-ui.com/primitives/docs/components/separator)      |
| AspectRatio                                                                     | `@calumet/elise-ui/aspect-ratio` | [AspectRatio](https://www.radix-ui.com/primitives/docs/components/aspect-ratio) |
| Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator | `@calumet/elise-ui/breadcrumb`   | —                                                                               |
| Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, ...                   | `@calumet/elise-ui/sidebar`      | —                                                                               |
| Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription    | `@calumet/elise-ui/sheet`        | [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)            |
| ScrollArea, ScrollBar                                                           | `@calumet/elise-ui/scroll-area`  | [ScrollArea](https://www.radix-ui.com/primitives/docs/components/scroll-area)   |

### Formularios

| Componente                                                    | Import                             | Radix / Externo                                                               |
| ------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| Form, FormField, FormLabel, FormControl, FormMessage, FormRow | `@calumet/elise-ui/form`           | [Form](https://www.radix-ui.com/primitives/docs/components/form)              |
| Input                                                         | `@calumet/elise-ui/input`          | —                                                                             |
| Textarea                                                      | `@calumet/elise-ui/textarea`       | —                                                                             |
| Label                                                         | `@calumet/elise-ui/label`          | [Label](https://www.radix-ui.com/primitives/docs/components/label)            |
| Checkbox                                                      | `@calumet/elise-ui/checkbox`       | [Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox)      |
| RadioGroup, RadioGroupItem                                    | `@calumet/elise-ui/radio-group`    | [RadioGroup](https://www.radix-ui.com/primitives/docs/components/radio-group) |
| Select, SelectTrigger, SelectValue, SelectContent, SelectItem | `@calumet/elise-ui/select`         | [Select](https://www.radix-ui.com/primitives/docs/components/select)          |
| Switch                                                        | `@calumet/elise-ui/switch`         | [Switch](https://www.radix-ui.com/primitives/docs/components/switch)          |
| Slider                                                        | `@calumet/elise-ui/slider`         | [Slider](https://www.radix-ui.com/primitives/docs/components/slider)          |
| OTPField                                                      | `@calumet/elise-ui/otp-field`      | —                                                                             |
| PasswordField                                                 | `@calumet/elise-ui/password-field` | —                                                                             |

### Navegacion

| Componente                                                                                 | Import                              | Radix                                                                                 |
| ------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Tabs, TabsList, TabsTrigger, TabsContent                                                   | `@calumet/elise-ui/tabs`            | [Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)                      |
| Accordion, AccordionItem, AccordionTrigger, AccordionContent                               | `@calumet/elise-ui/accordion`       | [Accordion](https://www.radix-ui.com/primitives/docs/components/accordion)            |
| Collapsible, CollapsibleTrigger, CollapsibleContent                                        | `@calumet/elise-ui/collapsible`     | [Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible)        |
| NavigationMenu, NavigationMenuList, NavigationMenuItem, ...                                | `@calumet/elise-ui/navigation-menu` | [NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) |
| Menubar, MenubarMenu, MenubarTrigger, MenubarContent, ...                                  | `@calumet/elise-ui/menubar`         | [Menubar](https://www.radix-ui.com/primitives/docs/components/menubar)                |
| DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, ...                                | `@calumet/elise-ui/dropdown-menu`   | [DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)     |
| Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator | `@calumet/elise-ui/dropdown-native` | — (HTML `<details>` nativo)                                                           |
| ContextMenu, ContextMenuTrigger, ContextMenuContent, ...                                   | `@calumet/elise-ui/context-menu`    | [ContextMenu](https://www.radix-ui.com/primitives/docs/components/context-menu)       |
| Pagination, PaginationContent, PaginationItem                                              | `@calumet/elise-ui/pagination`      | —                                                                                     |

### Feedback

| Componente                                                                             | Import                           | Radix                                                                           |
| -------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose          | `@calumet/elise-ui/toast`        | [Toast](https://www.radix-ui.com/primitives/docs/components/toast)              |
| AlertDialog, AlertDialogTrigger, AlertDialogContent, ...                               | `@calumet/elise-ui/alert-dialog` | [AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog) |
| Progress                                                                               | `@calumet/elise-ui/progress`     | [Progress](https://www.radix-ui.com/primitives/docs/components/progress)        |
| Skeleton                                                                               | `@calumet/elise-ui/skeleton`     | —                                                                               |
| Alert, AlertTitle, AlertDescription                                                    | `@calumet/elise-ui/alert`        | —                                                                               |
| Badge                                                                                  | `@calumet/elise-ui/badge`        | —                                                                               |
| Spinner                                                                                | `@calumet/elise-ui/spinner`      | —                                                                               |
| EmptyState, EmptyStateMedia, EmptyStateTitle, EmptyStateDescription, EmptyStateActions | `@calumet/elise-ui/empty-state`  | —                                                                               |

#### Alert vs AlertDialog

`Alert` es un mensaje en linea que no interrumpe: se renderiza dentro del flujo de
la pagina. `AlertDialog` es modal y bloquea hasta que el usuario decide. Si el
mensaje no exige una decision, es `Alert`.

Los tonos `danger` y `warning` se anuncian con `role="alert"`, que interrumpe al
lector de pantalla; `info` y `success` usan `role="status"`, que espera a que
termine de leer lo que estaba diciendo.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@calumet/elise-ui/alert";

<Alert tone="warning">
  <AlertTitle>Tu plan vence en 5 dias</AlertTitle>
  <AlertDescription>Renueva para no perder los reportes programados.</AlertDescription>
</Alert>;

// Con boton de cierre
<Alert tone="danger" onDismiss={() => setVisible(false)}>
  <AlertTitle>No pudimos procesar el pago</AlertTitle>
</Alert>;
```

| Prop        | Tipo                                           | Default  | Descripcion                           |
| ----------- | ---------------------------------------------- | -------- | ------------------------------------- |
| `tone`      | `"info" \| "success" \| "warning" \| "danger"` | `"info"` | Superficie, icono y `role` del bloque |
| `icon`      | `React.ReactNode`                              | —        | Sustituye el icono. `null` lo quita   |
| `onDismiss` | `() => void`                                   | —        | Muestra el boton de cierre            |

#### Badge

```tsx
import { Badge } from "@calumet/elise-ui/badge";

<Badge tone="success">Activo</Badge>
<Badge tone="danger" variant="solid">Fallido</Badge>
<Badge tone="neutral" variant="outline" size="sm">Borrador</Badge>
```

| Prop      | Tipo                                                                   | Default     |
| --------- | ---------------------------------------------------------------------- | ----------- |
| `tone`    | `"neutral" \| "brand" \| "success" \| "warning" \| "danger" \| "info"` | `"neutral"` |
| `variant` | `"subtle" \| "solid" \| "outline"`                                     | `"subtle"`  |
| `size`    | `"sm" \| "md"`                                                         | `"md"`      |
| `asChild` | `boolean`                                                              | `false`     |

#### Spinner

Hereda el color del texto, asi que se tiñe con cualquier utilidad `text-*`.
Sigue girando bajo `prefers-reduced-motion` — lleva `data-motion="essential"`,
porque un indicador detenido no comunica que algo sigue en curso.

```tsx
import { Spinner } from "@calumet/elise-ui/spinner";

<Spinner />
<Spinner size="lg" className="text-primary" />

<Button disabled>
  <Spinner size="sm" />
  Guardando
</Button>
```

La etiqueta para lectores de pantalla sale del puente i18n
(`ui.loading`, fallback `"Cargando"`) y se puede sobrescribir con `label`.

#### EmptyState

```tsx
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { FolderOpen } from "@calumet/elise-icons";

<EmptyState>
  <EmptyStateMedia>
    <FolderOpen />
  </EmptyStateMedia>
  <EmptyStateTitle>Todavia no hay proyectos</EmptyStateTitle>
  <EmptyStateDescription>
    Crea el primero para empezar a agrupar tableros, tablas y reportes.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button size="sm">Crear proyecto</Button>
  </EmptyStateActions>
</EmptyState>;
```

Para el caso "no hay resultados" de una busqueda, el titulo deberia nombrar el
termino buscado en vez de decir solo "Sin resultados".

### Overlay

| Componente                                                                         | Import                         | Radix                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription | `@calumet/elise-ui/dialog`     | [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)        |
| Popover, PopoverTrigger, PopoverContent                                            | `@calumet/elise-ui/popover`    | [Popover](https://www.radix-ui.com/primitives/docs/components/popover)      |
| HoverCard, HoverCardTrigger, HoverCardContent                                      | `@calumet/elise-ui/hover-card` | [HoverCard](https://www.radix-ui.com/primitives/docs/components/hover-card) |
| Tooltip, TooltipProvider, TooltipTrigger, TooltipContent                           | `@calumet/elise-ui/tooltip`    | [Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)      |

### Media

| Componente                                                              | Import                          | Radix / Externo                                                      |
| ----------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| Avatar, AvatarImage, AvatarFallback                                     | `@calumet/elise-ui/avatar`      | [Avatar](https://www.radix-ui.com/primitives/docs/components/avatar) |
| Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext | `@calumet/elise-ui/carousel`    | [Embla Carousel](https://www.embla-carousel.com/)                    |
| Calendar                                                                | `@calumet/elise-ui/calendar`    | [react-day-picker](https://react-day-picker.js.org/)                 |
| DatePicker, DateRangePicker                                             | `@calumet/elise-ui/date-picker` | [react-day-picker](https://react-day-picker.js.org/)                 |

### Acciones

| Componente                                                                                    | Import                           | Radix / Externo                                                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| Button                                                                                        | `@calumet/elise-ui/button`       | — (usa [Slot](https://www.radix-ui.com/primitives/docs/utilities/slot) de Radix) |
| Toggle                                                                                        | `@calumet/elise-ui/toggle`       | [Toggle](https://www.radix-ui.com/primitives/docs/components/toggle)             |
| ToggleGroup, ToggleGroupItem                                                                  | `@calumet/elise-ui/toggle-group` | [ToggleGroup](https://www.radix-ui.com/primitives/docs/components/toggle-group)  |
| Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem, ToolbarLink  | `@calumet/elise-ui/toolbar`      | [Toolbar](https://www.radix-ui.com/primitives/docs/components/toolbar)           |
| Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator | `@calumet/elise-ui/command`      | [cmdk](https://cmdk.paco.me/)                                                    |

### Datos

| Componente                                                    | Import                    | Radix |
| ------------------------------------------------------------- | ------------------------- | ----- |
| Table, TableHeader, TableBody, TableRow, TableHead, TableCell | `@calumet/elise-ui/table` | —     |

> Para tablas con funcionalidad avanzada (filtros, paginacion, ordenamiento, exportacion), usa el componente `DataTable` de `@calumet/elise-tables`. Ver [Utilidades](utilidades.md#tables---datatable).

## Ejemplo: Button

El componente `Button` es el mas utilizado y demuestra los patrones principales de Elise.

### Variantes

```tsx
import { Button } from "@calumet/elise-ui/button";

<Button variant="solid">Solido</Button>    // Fondo de color
<Button variant="outline">Contorno</Button> // Solo borde
<Button variant="ghost">Fantasma</Button>   // Sin fondo ni borde
```

### Tamanos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="md">Mediano</Button>   // Default
<Button size="lg">Grande</Button>
<Button size="icon">🔍</Button>      // Cuadrado para iconos
```

### Tonos

```tsx
<Button tone="success">Exito</Button>
<Button tone="warning">Advertencia</Button>
<Button tone="danger">Peligro</Button>
```

### Props

| Prop      | Tipo                                 | Default   | Descripcion                               |
| --------- | ------------------------------------ | --------- | ----------------------------------------- |
| `variant` | `"solid" \| "outline" \| "ghost"`    | `"solid"` | Estilo visual                             |
| `size`    | `"sm" \| "md" \| "lg" \| "icon"`     | `"md"`    | Tamano                                    |
| `tone`    | `"success" \| "warning" \| "danger"` | —         | Color semantico (sobreescribe el variant) |
| `asChild` | `boolean`                            | `false`   | Renderiza el hijo en lugar de `<button>`  |

Ademas, acepta todas las props nativas de `<button>` (onClick, disabled, type, etc.).

## Patron `asChild`

Muchos componentes soportan `asChild` para renderizar un elemento diferente al por defecto, manteniendo el comportamiento y los estilos:

```tsx
import { Button } from "@calumet/elise-ui/button";

// Renderiza como <a> con estilos de Button
<Button asChild>
  <a href="/otra-pagina">Navegar</a>
</Button>;
```

Este patron viene de Radix UI. Consulta la [guia de composicion de Radix](https://www.radix-ui.com/primitives/docs/guides/composition) para mas detalles.

---

Siguiente: [Utilidades](utilidades.md) | [Temas](temas.md)
