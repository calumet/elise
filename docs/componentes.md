# Componentes

`@elise/ui` exporta 45 componentes construidos sobre [Radix UI Primitives](https://www.radix-ui.com/primitives). Todos los componentes son accesibles, soportan `ref` via `React.forwardRef` y se estilizan con Tailwind CSS.

## Importacion

```tsx
// Por componente (recomendado)
import { Button } from "@elise/ui/button";

// Barrel import
import { Button, Dialog, Card } from "@elise/ui";
```

## Catalogo por categoria

### Layout

| Componente | Import | Radix |
| --- | --- | --- |
| Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter | `@elise/ui/card` | — |
| Separator | `@elise/ui/separator` | [Separator](https://www.radix-ui.com/primitives/docs/components/separator) |
| AspectRatio | `@elise/ui/aspect-ratio` | [AspectRatio](https://www.radix-ui.com/primitives/docs/components/aspect-ratio) |
| Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator | `@elise/ui/breadcrumb` | — |
| Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, ... | `@elise/ui/sidebar` | — |
| Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription | `@elise/ui/sheet` | [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) |
| ScrollArea, ScrollBar | `@elise/ui/scroll-area` | [ScrollArea](https://www.radix-ui.com/primitives/docs/components/scroll-area) |

### Formularios

| Componente | Import | Radix / Externo |
| --- | --- | --- |
| Form, FormField, FormLabel, FormControl, FormMessage, FormRow | `@elise/ui/form` | [Form](https://www.radix-ui.com/primitives/docs/components/form) |
| Input | `@elise/ui/input` | — |
| Textarea | `@elise/ui/textarea` | — |
| Label | `@elise/ui/label` | [Label](https://www.radix-ui.com/primitives/docs/components/label) |
| Checkbox | `@elise/ui/checkbox` | [Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) |
| RadioGroup, RadioGroupItem | `@elise/ui/radio-group` | [RadioGroup](https://www.radix-ui.com/primitives/docs/components/radio-group) |
| Select, SelectTrigger, SelectValue, SelectContent, SelectItem | `@elise/ui/select` | [Select](https://www.radix-ui.com/primitives/docs/components/select) |
| Switch | `@elise/ui/switch` | [Switch](https://www.radix-ui.com/primitives/docs/components/switch) |
| Slider | `@elise/ui/slider` | [Slider](https://www.radix-ui.com/primitives/docs/components/slider) |
| OTPField | `@elise/ui/otp-field` | — |
| PasswordField | `@elise/ui/password-field` | — |

### Navegacion

| Componente | Import | Radix |
| --- | --- | --- |
| Tabs, TabsList, TabsTrigger, TabsContent | `@elise/ui/tabs` | [Tabs](https://www.radix-ui.com/primitives/docs/components/tabs) |
| Accordion, AccordionItem, AccordionTrigger, AccordionContent | `@elise/ui/accordion` | [Accordion](https://www.radix-ui.com/primitives/docs/components/accordion) |
| Collapsible, CollapsibleTrigger, CollapsibleContent | `@elise/ui/collapsible` | [Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible) |
| NavigationMenu, NavigationMenuList, NavigationMenuItem, ... | `@elise/ui/navigation-menu` | [NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) |
| Menubar, MenubarMenu, MenubarTrigger, MenubarContent, ... | `@elise/ui/menubar` | [Menubar](https://www.radix-ui.com/primitives/docs/components/menubar) |
| DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, ... | `@elise/ui/dropdown-menu` | [DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) |
| ContextMenu, ContextMenuTrigger, ContextMenuContent, ... | `@elise/ui/context-menu` | [ContextMenu](https://www.radix-ui.com/primitives/docs/components/context-menu) |
| Pagination, PaginationContent, PaginationItem | `@elise/ui/pagination` | — |

### Feedback

| Componente | Import | Radix |
| --- | --- | --- |
| Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose | `@elise/ui/toast` | [Toast](https://www.radix-ui.com/primitives/docs/components/toast) |
| AlertDialog, AlertDialogTrigger, AlertDialogContent, ... | `@elise/ui/alert-dialog` | [AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog) |
| Progress | `@elise/ui/progress` | [Progress](https://www.radix-ui.com/primitives/docs/components/progress) |
| Skeleton | `@elise/ui/skeleton` | — |

### Overlay

| Componente | Import | Radix |
| --- | --- | --- |
| Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription | `@elise/ui/dialog` | [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) |
| Popover, PopoverTrigger, PopoverContent | `@elise/ui/popover` | [Popover](https://www.radix-ui.com/primitives/docs/components/popover) |
| HoverCard, HoverCardTrigger, HoverCardContent | `@elise/ui/hover-card` | [HoverCard](https://www.radix-ui.com/primitives/docs/components/hover-card) |
| Tooltip, TooltipProvider, TooltipTrigger, TooltipContent | `@elise/ui/tooltip` | [Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip) |

### Media

| Componente | Import | Radix / Externo |
| --- | --- | --- |
| Avatar, AvatarImage, AvatarFallback | `@elise/ui/avatar` | [Avatar](https://www.radix-ui.com/primitives/docs/components/avatar) |
| Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext | `@elise/ui/carousel` | [Embla Carousel](https://www.embla-carousel.com/) |
| Calendar | `@elise/ui/calendar` | [react-day-picker](https://react-day-picker.js.org/) |
| DatePicker, DateRangePicker | `@elise/ui/date-picker` | [react-day-picker](https://react-day-picker.js.org/) |

### Acciones

| Componente | Import | Radix / Externo |
| --- | --- | --- |
| Button | `@elise/ui/button` | — (usa [Slot](https://www.radix-ui.com/primitives/docs/utilities/slot) de Radix) |
| Toggle | `@elise/ui/toggle` | [Toggle](https://www.radix-ui.com/primitives/docs/components/toggle) |
| ToggleGroup, ToggleGroupItem | `@elise/ui/toggle-group` | [ToggleGroup](https://www.radix-ui.com/primitives/docs/components/toggle-group) |
| Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem, ToolbarLink | `@elise/ui/toolbar` | [Toolbar](https://www.radix-ui.com/primitives/docs/components/toolbar) |
| Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator | `@elise/ui/command` | [cmdk](https://cmdk.paco.me/) |

### Datos

| Componente | Import | Radix |
| --- | --- | --- |
| Table, TableHeader, TableBody, TableRow, TableHead, TableCell | `@elise/ui/table` | — |

> Para tablas con funcionalidad avanzada (filtros, paginacion, ordenamiento, exportacion), usa el componente `DataTable` de `@elise/utils/tables`. Ver [Utilidades](utilidades.md#tables---datatable).

## Ejemplo: Button

El componente `Button` es el mas utilizado y demuestra los patrones principales de Elise.

### Variantes

```tsx
import { Button } from "@elise/ui/button";

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

| Prop | Tipo | Default | Descripcion |
| --- | --- | --- | --- |
| `variant` | `"solid" \| "outline" \| "ghost"` | `"solid"` | Estilo visual |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | `"md"` | Tamano |
| `tone` | `"success" \| "warning" \| "danger"` | — | Color semantico (sobreescribe el variant) |
| `asChild` | `boolean` | `false` | Renderiza el hijo en lugar de `<button>` |

Ademas, acepta todas las props nativas de `<button>` (onClick, disabled, type, etc.).

## Patron `asChild`

Muchos componentes soportan `asChild` para renderizar un elemento diferente al por defecto, manteniendo el comportamiento y los estilos:

```tsx
import { Button } from "@elise/ui/button";

// Renderiza como <a> con estilos de Button
<Button asChild>
  <a href="/otra-pagina">Navegar</a>
</Button>
```

Este patron viene de Radix UI. Consulta la [guia de composicion de Radix](https://www.radix-ui.com/primitives/docs/guides/composition) para mas detalles.

---

Siguiente: [Utilidades](utilidades.md) | [Temas](temas.md)
