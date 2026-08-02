# Componentes

`@calumet/elise-ui` exporta 58 componentes, la mayoria construidos sobre [Radix UI Primitives](https://www.radix-ui.com/primitives). Todos son accesibles y se estilizan con Tailwind CSS. Los mas antiguos usan `React.forwardRef`; los nuevos son funciones planas al estilo de React 19, donde `ref` llega como prop normal (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).

> Antes de usar los componentes, completa el setup de Tailwind CSS v4 (Vite + `@tailwindcss/vite`) de la [Guia de inicio](guia-inicio.md).

## Importacion

```tsx
// Por componente (recomendado)
import { Button } from "@calumet/elise-ui/button";

// Barrel import
import { Button, Dialog, Card } from "@calumet/elise-ui";
```

## Catalogo por categoria

### Primitivas

La capa base sobre la que se compone todo lo demas. Sin ella, cada pantalla
resuelve su layout con Tailwind crudo y termina inventando su propia escala de
espaciado y su propia jerarquia tipografica — que es justo lo que un design
system deberia evitar.

| Componente              | Import                        | Proposito                                       |
| ----------------------- | ----------------------------- | ----------------------------------------------- |
| Box                     | `@calumet/elise-ui/box`       | Contenedor: espaciado, superficie, borde, radio |
| BlockStack, InlineStack | `@calumet/elise-ui/stack`     | Apilado en el eje de bloque / en linea          |
| Grid                    | `@calumet/elise-ui/grid`      | Rejilla de columnas, mobile-first               |
| Container               | `@calumet/elise-ui/container` | Ancho maximo + centrado + gutter responsive     |
| Bleed                   | `@calumet/elise-ui/bleed`     | Rompe el padding del contenedor padre           |
| Text                    | `@calumet/elise-ui/text`      | Primitiva tipografica                           |

Todas aceptan `as` para elegir la etiqueta HTML, y `className` al final para
escapar del sistema cuando hace falta.

> **Por que los valores son un conjunto cerrado.** Las props no aceptan valores
> arbitrarios (`padding={4}`, no `padding="17px"`). Ademas de mantener la
> escala, es un requisito tecnico: Tailwind escanea el codigo fuente en build,
> asi que una clase construida por interpolacion (`` `p-${n}` ``) nunca se
> genera. Por eso cada valor posible vive en un mapa estatico.

#### BlockStack e InlineStack

Se nombran por el eje logico de CSS y no por "vertical" y "horizontal": el
nombre sigue siendo correcto si el modo de escritura cambia.

```tsx
import { BlockStack, InlineStack } from "@calumet/elise-ui/stack";

<BlockStack gap={4}>
  <Text size="lg" weight="semibold">
    Facturacion
  </Text>
  <InlineStack gap={2} justify="between">
    <Badge tone="success">Al dia</Badge>
    <Button size="sm">Ver detalle</Button>
  </InlineStack>
</BlockStack>;
```

| Prop      | Tipo                                                                | Default                   |
| --------- | ------------------------------------------------------------------- | ------------------------- |
| `gap`     | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 10 \| 12 \| 16`            | `0`                       |
| `align`   | `"start" \| "center" \| "end" \| "stretch" \| "baseline"`           | `"center"` en InlineStack |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | —                         |
| `wrap`    | `boolean` (solo InlineStack)                                        | `true`                    |

#### Box

```tsx
import { Box } from "@calumet/elise-ui/box";

<Box padding={4} background="card" border radius="xl" shadow="sm">
  contenido
</Box>;
```

| Prop                                | Tipo                                                                               | Default  |
| ----------------------------------- | ---------------------------------------------------------------------------------- | -------- |
| `padding` / `paddingX` / `paddingY` | escala de espaciado                                                                | —        |
| `background`                        | `"none" \| "card" \| "popover" \| "muted" \| "secondary" \| "accent" \| "sidebar"` | `"none"` |
| `border`                            | `boolean \| "strong"`                                                              | —        |
| `radius`                            | `"none" \| "sm" \| "md" \| "lg" \| "xl" \| "full"`                                 | —        |
| `shadow`                            | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl"`                                   | —        |
| `overflowHidden`                    | `boolean`                                                                          | —        |

`background` setea tambien el color de texto que le corresponde (`card` trae
`text-card-foreground`), asi que los pares nunca se desemparejan.

#### Grid

Mobile-first: `columns` aplica desde el ancho mas chico y los breakpoints lo
sobrescriben hacia arriba.

```tsx
<Grid columns={1} smColumns={2} lgColumns={4} gap={4}>
  {items.map((i) => (
    <Card key={i.id} />
  ))}
</Grid>
```

#### Bleed

Rompe el padding del padre con margen negativo, para que algo llegue al borde
sin tener que sacarle el padding al contenedor entero.

```tsx
<Box padding={4} background="card" border radius="xl" overflowHidden>
  <Text weight="semibold">Resumen</Text>
  <Bleed x={4}>
    <Separator />
  </Bleed>
  <Text size="sm" tone="muted">
    El separador llega de borde a borde.
  </Text>
</Box>
```

El valor tiene que coincidir con el padding del padre; si no, el contenido se
desborda.

#### Text

Cada `size` ya trae su interlineado y su tracking desde los tokens, asi que no
hay que combinar `text-*` con `leading-*` y `tracking-*` a mano.

```tsx
<Text as="h2" size="xl" weight="bold" balance>Plan Empresa</Text>
<Text size="sm" tone="muted">Renueva el 14 de septiembre</Text>
<Text size="sm" lines={2}>Descripcion larga que se corta a dos lineas…</Text>
```

| Prop       | Tipo                                                                                | Default     |
| ---------- | ----------------------------------------------------------------------------------- | ----------- |
| `as`       | `React.ElementType`                                                                 | `"p"`       |
| `size`     | `"2xs" \| "xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl"`                 | `"base"`    |
| `weight`   | `"normal" \| "medium" \| "semibold" \| "bold"`                                      | `"normal"`  |
| `tone`     | `"default" \| "muted" \| "primary" \| "success" \| "warning" \| "danger" \| "info"` | `"default"` |
| `align`    | `"start" \| "center" \| "end"`                                                      | —           |
| `truncate` | `boolean`                                                                           | —           |
| `lines`    | `2 \| 3 \| 4`                                                                       | —           |
| `balance`  | `boolean`                                                                           | —           |

`as` y `size` son independientes a proposito: un `h2` puede verse pequeño sin
dejar de ser un `h2` para el lector de pantalla.

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
| Combobox, ComboboxField, …                                    | `@calumet/elise-ui/combobox`       | Popover + [cmdk](https://cmdk.paco.me/)                                       |
| MultiCombobox, MultiComboboxField                             | `@calumet/elise-ui/combobox`       | Popover + [cmdk](https://cmdk.paco.me/)                                       |
| FileUpload, FileUploadList, FileUploadItem                    | `@calumet/elise-ui/file-upload`    | —                                                                             |
| Stepper, StepperItem, StepperTitle, StepperDescription        | `@calumet/elise-ui/stepper`        | —                                                                             |

#### Combobox

Select con busqueda. `Popover` posiciona el panel y `Command` (cmdk) aporta el
filtrado, la navegacion por teclado y el patron ARIA de combobox —
`role="combobox"`, `aria-expanded`, `aria-controls` y `aria-activedescendant`.
Ninguno de esos atributos se replica a mano.

Usa `Select` cuando las opciones sean pocas y conocidas; `Combobox` cuando haya
suficientes como para que buscar sea mas rapido que recorrer la lista.

Viene en dos niveles, igual que en Polaris (`Combobox` + `Listbox` como
primitivo, `Autocomplete` como envoltorio):

- **`Combobox` y sus partes** — el primitivo componible. Sostiene el valor y la
  apertura, y no pinta nada por su cuenta.
- **`ComboboxField`** — el envoltorio para el caso comun, un array de opciones.
  Esta construido sobre las partes, asi que no puede hacer nada que el primitivo
  no permita.

##### ComboboxField

```tsx
import { ComboboxField, type ComboboxOption } from "@calumet/elise-ui/combobox";

const paises: ComboboxOption[] = [
  { value: "co", label: "Colombia", description: "Bogota", keywords: ["bogota"] },
  { value: "mx", label: "Mexico", description: "Ciudad de Mexico" },
];

<ComboboxField options={paises} value={pais} onValueChange={setPais} clearable />;
```

| Prop                | Tipo                      | Default | Descripcion                              |
| ------------------- | ------------------------- | ------- | ---------------------------------------- |
| `options`           | `ComboboxOption[]`        | —       | Requerido                                |
| `value`             | `string`                  | —       | Modo controlado                          |
| `defaultValue`      | `string`                  | —       | Modo no controlado                       |
| `onValueChange`     | `(value: string) => void` | —       | —                                        |
| `placeholder`       | `string`                  | i18n    | Texto del disparador sin seleccion       |
| `searchPlaceholder` | `string`                  | i18n    | —                                        |
| `emptyMessage`      | `string`                  | i18n    | —                                        |
| `clearable`         | `boolean`                 | `false` | Muestra una X para volver a sin valor    |
| `size`              | `"sm" \| "md" \| "lg"`    | `"md"`  | —                                        |
| `name`              | `string`                  | —       | Emite un input oculto para forms nativos |
| `disabled`          | `boolean`                 | —       | —                                        |

`ComboboxOption` acepta `value`, `label`, `description`, `disabled`, `group`
(agrupa bajo un encabezado) y `keywords` — terminos extra por los que la opcion
tambien se encuentra, util para que "bogota" encuentre Colombia.

##### Partes componibles

Para carga asincrona, secciones a medida o acciones dentro de la lista:

```tsx
<Combobox value={valor} onValueChange={setValor} open={abierto} onOpenChange={setAbierto}>
  <ComboboxTrigger onClear={valor ? () => setValor("") : undefined}>
    <ComboboxValue placeholder="Buscar paquete…">{valor}</ComboboxValue>
  </ComboboxTrigger>

  {/* shouldFilter={false}: la lista ya viene filtrada de afuera */}
  <ComboboxContent shouldFilter={false}>
    <ComboboxInput value={texto} onValueChange={setTexto} />
    <ComboboxList>
      {cargando ? (
        <ComboboxLoading />
      ) : (
        <>
          <ComboboxEmpty>Ningun paquete coincide</ComboboxEmpty>
          {resultados.map((p) => (
            <ComboboxItem key={p} value={p}>
              {p}
            </ComboboxItem>
          ))}
          <ComboboxSeparator />
          <ComboboxItem value="__nuevo" onSelect={crear}>
            + Crear paquete nuevo
          </ComboboxItem>
        </>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

| Parte               | Proposito                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `Combobox`          | Raiz: valor, apertura y `Popover`. `closeOnSelect` para multiple |
| `ComboboxTrigger`   | Boton disparador. `size`, y `onClear` para la X                  |
| `ComboboxValue`     | Texto del disparador; cae en `placeholder` si no recibe children |
| `ComboboxContent`   | Panel + `Command`. `shouldFilter={false}` desactiva el filtrado  |
| `ComboboxInput`     | Campo de busqueda                                                |
| `ComboboxList`      | Contenedor desplazable                                           |
| `ComboboxEmpty`     | Mensaje de "sin resultados"                                      |
| `ComboboxGroup`     | Seccion con encabezado                                           |
| `ComboboxItem`      | Opcion. `keywords`, e `icon` para items que son acciones         |
| `ComboboxSeparator` | Divisor                                                          |
| `ComboboxLoading`   | Fila con spinner                                                 |

> `ComboboxValue` no adivina la etiqueta a partir del valor: los items viven
> dentro del panel y se desmontan al cerrarlo. Quien compone es dueño de su
> estado y pasa el texto — `ComboboxField` lo resuelve desde sus `options`.

La opcion **elegida** se marca con peso semibold y un check al final de la fila;
el fondo gris es el **resaltado del teclado**, que se mueve con las flechas. Son
dos estados distintos y se leen a la vez.

> El check va al final y solo existe cuando el item esta elegido, en vez de
> reservarle una columna al inicio. Asi todas las filas —opciones, acciones,
> elegidas o no— arrancan en la misma x. Es como lo resuelve Polaris en su
> `TextOption`; con el check al inicio, cualquier fila sin el queda corrida el
> ancho del icono.

Los textos por defecto salen del puente i18n (`ui.comboboxPlaceholder`,
`ui.comboboxSearch`, `ui.comboboxEmpty`, `ui.clear`, `ui.loading`) y cualquiera
se sobrescribe por prop.

##### Seleccion multiple

`MultiCombobox` comparte todas las partes con `Combobox`: solo cambia que
acumula un array y que elegir un item ya elegido lo quita. El panel se queda
abierto por defecto — cerrarlo tras cada eleccion obliga a reabrir para la
siguiente.

`MultiComboboxField` es el envoltorio equivalente. Muestra lo elegido como chips
removibles dentro del disparador y, a partir de `maxChips`, resume el resto con
«+N» para que el control no crezca sin limite.

```tsx
<MultiComboboxField options={tecnologias} value={stack} onValueChange={setStack} maxChips={2} />
```

> La X de cada chip es un `<span role="button">`, no un `<button>`: vive dentro
> del disparador, y un boton dentro de otro es HTML invalido. El disparador
> sigue siendo el unico control enfocable con Tab.

#### FileUpload

Area para soltar o elegir archivos.

Reporta **siempre las dos listas** —aceptados y rechazados, con el motivo— en
vez de descartar en silencio lo que no pasa. Un archivo que desaparece sin
explicacion es el peor resultado posible de un campo de subida; la idea viene
del `DropZone` de Polaris, que separa `onDropAccepted` de `onDropRejected`.

No guarda los archivos ni los muestra: eso se compone con `FileUploadList` y
`FileUploadItem`, para que la lista pueda vivir donde haga falta.

```tsx
<FileUpload
  multiple
  accept="image/*,.pdf"
  maxSize={1024 * 1024}
  hint="Imagenes o PDF, hasta 1 MB por archivo"
  onFiles={(aceptados, rechazados) => {
    setArchivos((p) => [...p, ...aceptados]);
    setRechazados(rechazados);
  }}
/>

<FileUploadList>
  {archivos.map((f, i) => (
    <FileUploadItem key={i} name={f.name} size={f.size} onRemove={() => quitar(i)} />
  ))}
</FileUploadList>
```

| Prop        | Tipo                                              | Default | Descripcion                      |
| ----------- | ------------------------------------------------- | ------- | -------------------------------- |
| `accept`    | `string`                                          | —       | Filtro nativo: `"image/*,.pdf"`  |
| `multiple`  | `boolean`                                         | `false` | —                                |
| `maxSize`   | `number`                                          | —       | Bytes, por archivo               |
| `validator` | `(file: File) => boolean`                         | —       | Regla propia; `false` lo rechaza |
| `onFiles`   | `(aceptados, rechazados: RejectedFile[]) => void` | —       | —                                |
| `invalid`   | `boolean`                                         | —       | Marca el area como invalida      |
| `label`     | `string`                                          | i18n    | Texto principal                  |
| `hint`      | `string`                                          | —       | Formatos y tamano admitidos      |

`RejectedFile` trae `{ file, reason }`, con `reason` en `"type" | "size" | "custom"`.

#### Stepper

Indicador de progreso por pasos. Es un `<ol>` de verdad, no una fila de divs: el
orden es la informacion que transmite, y un lector de pantalla debe poder
anunciarlo.

El estado de cada paso lo decide quien lo usa, con `status`. El componente no lo
deduce de un indice, porque un flujo real salta pasos y vuelve atras.

```tsx
<Stepper>
  {pasos.map((p, i) => (
    <StepperItem
      key={p.titulo}
      status={i < actual ? "complete" : i === actual ? "current" : "upcoming"}
      indicator={i < actual ? undefined : i + 1}
      last={i === pasos.length - 1}
    >
      <StepperTitle>{p.titulo}</StepperTitle>
      <StepperDescription>{p.descripcion}</StepperDescription>
    </StepperItem>
  ))}
</Stepper>
```

| Prop          | Tipo                                    | Default           | Descripcion                          |
| ------------- | --------------------------------------- | ----------------- | ------------------------------------ |
| `orientation` | `"horizontal" \| "vertical"`            | `"horizontal"`    | En `Stepper`                         |
| `status`      | `"complete" \| "current" \| "upcoming"` | `"upcoming"`      | En `StepperItem`                     |
| `indicator`   | `React.ReactNode`                       | check si completo | Numero o icono del indicador         |
| `last`        | `boolean`                               | —                 | Oculta la linea; ponelo en el ultimo |

El paso actual lleva `aria-current="step"`, y completo y actual anuncian su
estado con texto para lectores de pantalla.

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
