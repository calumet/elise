# Componentes

`@calumet/elise-ui` exporta 78 subrutas, la mayoría construidas sobre [Radix UI Primitives](https://www.radix-ui.com/primitives). Todos son accesibles y se estilizan con Tailwind CSS. Los más antiguos usan `React.forwardRef`; los nuevos son funciones planas al estilo de React 19, donde `ref` llega como prop normal (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).

> Antes de usar los componentes, completa el setup de Tailwind CSS v4 (Vite + `@tailwindcss/vite`) de la [Guía de inicio](guia-inicio.md).

> `@calumet/elise-ui/theme` no es un componente de catálogo sino la raíz que
> reparte el tema (`ThemeProvider`, `useTheme`, `applyTheme`). Está en
> [Temas](temas.md).

> Los cambios que rompen compatibilidad entre versiones están en el
> [CHANGELOG](../CHANGELOG.md).

> Para elegir entre dos componentes parecidos, o para saber quién es dueño de
> una medida, ver [Reglas de interfaz](reglas-ui.md).

## Importación

```tsx
// Por componente (recomendado)
import { Button } from "@calumet/elise-ui/button";

// Barrel import
import { Button, Dialog, Card } from "@calumet/elise-ui";
```

## Catálogo por categoría

### Primitivas

La capa base sobre la que se compone todo lo demás. Sin ella, cada pantalla
resuelve su layout con Tailwind crudo y termina inventando su propia escala de
espaciado y su propia jerarquía tipográfica, que es justo lo que un design
system debería evitar.

| Componente              | Import                        | Propósito                                       |
| ----------------------- | ----------------------------- | ----------------------------------------------- |
| Box                     | `@calumet/elise-ui/box`       | Contenedor: espaciado, superficie, borde, radio |
| BlockStack, InlineStack | `@calumet/elise-ui/stack`     | Apilado en el eje de bloque / en línea          |
| Grid                    | `@calumet/elise-ui/grid`      | Rejilla de columnas, mobile-first               |
| Container               | `@calumet/elise-ui/container` | Ancho máximo + centrado + gutter responsive     |
| Bleed                   | `@calumet/elise-ui/bleed`     | Rompe el padding del contenedor padre           |
| Text                    | `@calumet/elise-ui/text`      | Primitiva tipográfica                           |
| Link                    | `@calumet/elise-ui/link`      | Enlace, con `tone` y `rel` automático           |
| Code                    | `@calumet/elise-ui/code`      | Un identificador dentro de la frase             |
| Kbd                     | `@calumet/elise-ui/kbd`       | Una tecla, en relieve                           |

Las de layout aceptan `as` para elegir la etiqueta HTML, y todas admiten
`className` al final para escapar del sistema cuando hace falta.

`Code` y `Kbd` son dos y no uno con variante porque nombrar una tecla y citar un
valor no son lo mismo: la tecla va en relieve y se lee como algo que se pulsa. Un
atajo de varias teclas son varios `Kbd`, ya que meter dos en una sola caja dibuja
una tecla que no existe.

`Link` va subrayado y no solo teñido, porque el color por sí solo no distingue
nada para quien no lo separa del texto de alrededor, y dentro de un párrafo no
hay forma de saber dónde acaba lo pulsable. Con `target="_blank"` se pone su
`rel` solo.

> **Por que los valores son un conjunto cerrado.** Las props no aceptan valores
> arbitrarios (`padding={4}`, no `padding="17px"`). Además de mantener la
> escala, es un requisito técnico de Tailwind, que escanea el código fuente en
> build y nunca genera una clase construida por interpolación (`` `p-${n}` ``).
> Por eso cada valor posible vive en un mapa estático.

#### BlockStack e InlineStack

Se nombran por el eje lógico de CSS y no por "vertical" y "horizontal", porque
así el nombre sigue siendo correcto si el modo de escritura cambia.

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

`background` setea también el color de texto que le corresponde (`card` trae
`text-card-foreground`), así que los pares nunca se desemparejan.

#### Grid

`columns` aplica desde el ancho más chico y los breakpoints lo sobrescriben
hacia arriba, al estilo mobile-first.

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

Cada `size` ya trae su interlineado y su tracking desde los tokens, así que no
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

`as` y `size` son independientes a propósito, de modo que un `h2` puede verse
pequeño sin dejar de ser un `h2` para el lector de pantalla.

### Layout

| Componente                                                                                           | Import                           | Radix                                                                           |
| ---------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter                                | `@calumet/elise-ui/card`         | —                                                                               |
| Separator                                                                                            | `@calumet/elise-ui/separator`    | [Separator](https://www.radix-ui.com/primitives/docs/components/separator)      |
| AspectRatio                                                                                          | `@calumet/elise-ui/aspect-ratio` | [AspectRatio](https://www.radix-ui.com/primitives/docs/components/aspect-ratio) |
| Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator                      | `@calumet/elise-ui/breadcrumb`   | —                                                                               |
| Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, ...                                        | `@calumet/elise-ui/sidebar`      | —                                                                               |
| Sheet, SheetTrigger, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription | `@calumet/elise-ui/sheet`        | [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)            |
| ScrollArea, ScrollBar                                                                                | `@calumet/elise-ui/scroll-area`  | [ScrollArea](https://www.radix-ui.com/primitives/docs/components/scroll-area)   |

### Formularios

| Componente                                                    | Import                                | Radix / Externo                                                                 |
| ------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| Field                                                         | `@calumet/elise-ui/field`             | —                                                                               |
| Form, FormField, FormLabel, FormControl, FormMessage, FormRow | `@calumet/elise-ui/form`              | [Form](https://www.radix-ui.com/primitives/docs/components/form)                |
| Input                                                         | `@calumet/elise-ui/input`             | —                                                                               |
| Textarea                                                      | `@calumet/elise-ui/textarea`          | —                                                                               |
| Label                                                         | `@calumet/elise-ui/label`             | [Label](https://www.radix-ui.com/primitives/docs/components/label)              |
| Checkbox                                                      | `@calumet/elise-ui/checkbox`          | [Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox)        |
| RadioGroup, RadioGroupItem                                    | `@calumet/elise-ui/radio-group`       | [RadioGroup](https://www.radix-ui.com/primitives/docs/components/radio-group)   |
| InlineError                                                   | `@calumet/elise-ui/inline-error`      | —                                                                               |
| DateField                                                     | `@calumet/elise-ui/date-field`        | [react-day-picker](https://react-day-picker.js.org/)                            |
| TimePicker                                                    | `@calumet/elise-ui/time-picker`       | —                                                                               |
| NumberField                                                   | `@calumet/elise-ui/number-field`      | —                                                                               |
| SearchField                                                   | `@calumet/elise-ui/search-field`      | —                                                                               |
| TagInput                                                      | `@calumet/elise-ui/tag-input`         | —                                                                               |
| Rating                                                        | `@calumet/elise-ui/rating`            | —                                                                               |
| SegmentedControl, SegmentedControlItem                        | `@calumet/elise-ui/segmented-control` | [ToggleGroup](https://www.radix-ui.com/primitives/docs/components/toggle-group) |
| ColorPicker                                                   | `@calumet/elise-ui/color-picker`      | —                                                                               |
| Select, SelectTrigger, SelectValue, SelectContent, SelectItem | `@calumet/elise-ui/select`            | [Select](https://www.radix-ui.com/primitives/docs/components/select)            |
| Switch                                                        | `@calumet/elise-ui/switch`            | [Switch](https://www.radix-ui.com/primitives/docs/components/switch)            |
| Slider                                                        | `@calumet/elise-ui/slider`            | [Slider](https://www.radix-ui.com/primitives/docs/components/slider)            |
| OTPField                                                      | `@calumet/elise-ui/otp-field`         | —                                                                               |
| PasswordField                                                 | `@calumet/elise-ui/password-field`    | —                                                                               |
| Combobox, ComboboxField, …                                    | `@calumet/elise-ui/combobox`          | Popover + [cmdk](https://cmdk.paco.me/)                                         |
| MultiCombobox, MultiComboboxField                             | `@calumet/elise-ui/combobox`          | Popover + [cmdk](https://cmdk.paco.me/)                                         |
| FileUpload, FileUploadList, FileUploadItem                    | `@calumet/elise-ui/file-upload`       | —                                                                               |
| Stepper, StepperItem, StepperTitle, StepperDescription        | `@calumet/elise-ui/stepper`           | —                                                                               |

`Checkbox`, `RadioGroupItem` y `Switch` son un `button` con su rol ARIA, no un
`input`, así que envolverlos en un `<label>` no los activaría. Por eso los tres
son campos y no controles sueltos: traen su propio rótulo al lado, más ayuda y
error, con el enlace ya resuelto. `label` es obligatorio, y `labelHidden` lo
esconde a la vista sin quitarlo del árbol de accesibilidad, para cuando lo que
rodea al control ya lo explica (una columna de tabla, una barra de herramientas).

```tsx
<Checkbox
  label="Acepto los términos"
  description="Puedes revocarlo cuando quieras"
  error={errores.acepta}
  required
/>
```

`Checkbox` acepta `checked="indeterminate"` para el caso de una casilla maestra
con solo parte de sus hijas marcadas.

En los radios el reparto es distinto y va por niveles: el rótulo, la ayuda y el
error son del **grupo**, porque la pregunta se hace una vez y las opciones son
las respuestas; un error como «elige una forma de envío» no pertenece a ninguna
opción. Cada opción sí lleva su propia ayuda, para lo que cambia de una a otra, y
puede señalarse con `invalid` como la que dispara el error del grupo.

```tsx
<RadioGroup label="Forma de envío" error={errores.envio} required>
  <RadioGroupItem value="estandar" label="Estándar" description="Llega en tres días" />
  <RadioGroupItem value="expres" label="Exprés" description="Llega mañana" />
</RadioGroup>
```

`InlineError` es el mensaje de error suelto, el mismo que usan `Field` y los tres
controles marcables. Lleva icono además de color, ya que el color por sí solo no
distingue nada para quien no separa el rojo del gris, y debajo de un campo hay
dos textos pequeños seguidos (la ayuda y el error) que si no solo se
diferenciarían por eso.

#### La escala de los campos

`Input`, `SelectTrigger`, `ComboboxTrigger` y `Button` comparten cuatro pasos,
para que una fila que los mezcle cuadre de alto sin que nadie ajuste nada por
fuera.

| `size` | Alto | Texto | Cuándo                                      |
| ------ | ---- | ----- | ------------------------------------------- |
| `sm`   | 32px | 13px  | Barra de herramientas, filtros de una tabla |
| `md`   | 36px | 14px  | Formularios, que es casi todo. Por defecto  |
| `lg`   | 40px | 14px  | Un campo solo que pide protagonismo         |
| `xl`   | 44px | 14px  | Táctil: es el mínimo de área de toque       |

El alto y el texto son los mismos en los cuatro controles; el relleno a los
costados no, porque la caja de un botón la marca el rótulo y la de un campo el
valor que se escribe dentro. La escala vive en `TAMANOS_CAMPO`, dentro de
`input`, y de ahí la toman los otros.

#### Los seis campos compuestos

`NumberField`, `SearchField`, `TagInput`, `Rating`, `TimePicker` y `DateField`
comparten la misma capa de campo que `Field`: `label`, `labelHidden`,
`description`, `error` y `required`.

- **`NumberField`.** `min`, `max`, `step`, prefijo y sufijo. Las flechas del
  teclado suben y bajan.
- **`SearchField`.** Lupa al principio y aspa al final en cuanto hay algo
  escrito. El `input` es de tipo `search`, así que Escape lo vacía.
- **`TagInput`.** Intro o coma cierra una etiqueta; Retroceso con el campo vacío
  quita la última. Cada etiqueta es un `Chip`.
- **`Rating`.** Se puntúa con las flechas. Con `readOnly` sale del tabulador.
- **`TimePicker`.** Campo que se escribe más una lista de horas. En 24 horas y
  `HH:MM`, el mismo criterio que `DateField` con las fechas: un formato que se
  ordena solo y no cambia con el idioma del navegador.
- **`DateField`.** Campo de fecha con calendario emergente. El valor viaja como
  `YYYY-MM-DD` y no como `Date`, porque una fecha de calendario no tiene hora ni
  zona, y en cuanto se guarda un `Date` alguien acaba perdiendo un día al cruzar
  la medianoche. Para el calendario a secas está `Calendar`; para un disparador
  sin campo, `DatePicker`.

`SegmentedControl` es para unas pocas opciones que se excluyen, siempre con una
puesta. Se lee como una sola pieza partida y no como botones sueltos, que es lo
que lo separa de un grupo de alternar: aquí las opciones son las caras de una
misma pregunta. Nunca se queda sin valor, así que volver a pulsar la activa no la
apaga.

#### Field

Agrupa rótulo, control, ayuda y error, y resuelve el enlace de accesibilidad
entre las cuatro partes.

El control se pasa como función y no como hijo directo, de modo que aplicar
`aria-describedby` y `aria-invalid` deja de ser opcional. Con un hijo normal es
fácil escribir el mensaje de error sin enlazarlo, y entonces el lector de
pantalla lo anuncia suelto, sin decir a que campo pertenece.

```tsx
import { Field } from "@calumet/elise-ui/field";

<Field label="Correo" description="Te avisamos ahi" error={errores.email} required>
  {(control) => <Input type="email" {...control} {...register("email")} />}
</Field>;
```

| Prop          | Tipo                                              | Default  | Descripción                            |
| ------------- | ------------------------------------------------- | -------- | -------------------------------------- |
| `label`       | `React.ReactNode`                                 | —        | Requerido                              |
| `children`    | `(control: FieldControlProps) => React.ReactNode` | —        | Requerido; recibe el control           |
| `description` | `React.ReactNode`                                 | —        | Ayuda; sigue visible aunque haya error |
| `error`       | `React.ReactNode`                                 | —        | Su presencia marca el campo inválido   |
| `required`    | `boolean`                                         | —        | Asterisco y `aria-required`            |
| `id`          | `string`                                          | generado | Fuerza el `id` del control             |

La función recibe `id`, `aria-describedby`, `aria-invalid` y `aria-required` ya
calculados. Cuando hay ayuda y error a la vez, `aria-describedby` apunta a los
dos, porque la ayuda hace falta sobre todo en el momento en que algo sale mal. El
párrafo de error lleva `role="alert"` y se anuncia al aparecer, sin esperar a que
el foco vuelva al campo.

`Field` no conoce react-hook-form ni Radix Form. Recibe `error` ya resuelto, así
que sirve igual con `useZodForm`, con estado propio o sin librería.

Para formularios que validan con la API nativa del navegador está `Form` y su
familia, montada sobre Radix Form. Las dos no se mezclan en un mismo campo, ya
que cada una quiere ser dueña del estado.

#### Combobox

Select con búsqueda. `Popover` posiciona el panel y `Command` (cmdk) aporta el
filtrado, la navegación por teclado y el patrón ARIA de combobox:
`role="combobox"`, `aria-expanded`, `aria-controls` y `aria-activedescendant`.
Ninguno de esos atributos se replica a mano.

Usa `Select` cuando las opciones sean pocas y conocidas; `Combobox` cuando haya
suficientes como para que buscar sea más rápido que recorrer la lista.

Viene en dos niveles, igual que en Polaris (`Combobox` + `Listbox` como
primitivo, `Autocomplete` como envoltorio):

- **`Combobox` y sus partes.** El primitivo componible. Sostiene el valor y la
  apertura, y no pinta nada por su cuenta.
- **`ComboboxField`.** El envoltorio para el caso común, un array de opciones.
  Esta construido sobre las partes, así que no puede hacer nada que el primitivo
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

| Prop                | Tipo                      | Default | Descripción                                |
| ------------------- | ------------------------- | ------- | ------------------------------------------ |
| `options`           | `ComboboxOption[]`        | —       | Requerido                                  |
| `value`             | `string`                  | —       | Modo controlado                            |
| `defaultValue`      | `string`                  | —       | Modo no controlado                         |
| `onValueChange`     | `(value: string) => void` | —       | —                                          |
| `placeholder`       | `string`                  | i18n    | Texto del disparador sin selección         |
| `searchPlaceholder` | `string`                  | i18n    | —                                          |
| `emptyMessage`      | `string`                  | i18n    | —                                          |
| `clearable`         | `boolean`                 | `false` | Muestra una X para volver a sin valor      |
| `size`              | `"sm" \| "md" \| "lg"`    | `"md"`  | —                                          |
| `modal`             | `boolean`                 | —       | El panel lleva su propio bloqueo de scroll |
| `name`              | `string`                  | —       | Emite un input oculto para forms nativos   |
| `disabled`          | `boolean`                 | —       | —                                          |

`ComboboxOption` acepta `value`, `label`, `description`, `disabled`, `group`
(agrupa bajo un encabezado), `level` y `keywords`. Con `keywords` se suman
términos extra por los que la opción también se encuentra, útil para que
"bogota" encuentre Colombia.

**`modal` dentro de un diálogo.** El bloqueo de scroll del `Dialog` cancela la
rueda sobre la lista del combobox, que entonces solo se recorre con las flechas
o arrastrando la barra. Con `modal` el panel lleva el suyo y la rueda vuelve a
llegar. Fuera de un diálogo no hace falta.

**`level` para una lista que aplana un árbol.** La raíz es 0 y cada nivel sangra
16px, la misma medida que `Tree`. `group` no cubre este caso, porque agrupa en
un solo escalón y con encabezado, mientras que un árbol tiene profundidad
arbitraria y padres que también se eligen.

```tsx
const menu: ComboboxOption[] = [
  { value: "raiz", label: "Raiz del menu" },
  { value: "academica", label: "Informacion academica", level: 1 },
  { value: "horario", label: "Horario", level: 2 },
];
```

La sangría va en el contenido de la fila y no en la fila, de modo que el
resaltado del teclado sigue midiendo lo mismo a cualquier profundidad.

##### Partes componibles

Para carga asíncrona, secciones a medida o acciones dentro de la lista:

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

| Parte               | Propósito                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `Combobox`          | Raíz: valor, apertura y `Popover`. `closeOnSelect` para múltiple |
| `ComboboxTrigger`   | Botón disparador. `size`, y `onClear` para la X                  |
| `ComboboxValue`     | Texto del disparador; cae en `placeholder` si no recibe children |
| `ComboboxContent`   | Panel + `Command`. `shouldFilter={false}` desactiva el filtrado  |
| `ComboboxInput`     | Campo de búsqueda                                                |
| `ComboboxList`      | Contenedor desplazable                                           |
| `ComboboxEmpty`     | Mensaje de "sin resultados"                                      |
| `ComboboxGroup`     | Sección con encabezado                                           |
| `ComboboxItem`      | Opción. `keywords`, e `icon` para items que son acciones         |
| `ComboboxSeparator` | Divisor                                                          |
| `ComboboxLoading`   | Fila con spinner                                                 |

> `ComboboxValue` no adivina la etiqueta a partir del valor, porque los items
> viven dentro del panel y se desmontan al cerrarlo. Quien compone es dueño de
> su estado y pasa el texto, que en `ComboboxField` sale de sus `options`.

La opción **elegida** se marca con peso semibold y un check al final de la fila;
el fondo gris es el **resaltado del teclado**, que se mueve con las flechas. Son
dos estados distintos y se leen a la vez.

> El check va al final y solo existe cuando el item está elegido, en vez de
> reservarle una columna al inicio. Así todas las filas (opciones, acciones,
> elegidas o no) arrancan en la misma x. Es como lo resuelve Polaris en su
> `TextOption`; con el check al inicio, cualquier fila sin el queda corrida el
> ancho del icono.

Los textos por defecto salen del puente i18n (`ui.comboboxPlaceholder`,
`ui.comboboxSearch`, `ui.comboboxEmpty`, `ui.clear`, `ui.loading`) y cualquiera
se sobrescribe por prop.

##### Selección múltiple

`MultiCombobox` comparte todas las partes con `Combobox`. Lo único que cambia es
que acumula un array y que elegir un item ya elegido lo quita. El panel se queda
abierto por defecto, ya que cerrarlo tras cada elección obliga a reabrir para la
siguiente.

`MultiComboboxField` es el envoltorio equivalente. Muestra lo elegido como chips
removibles dentro del disparador y, a partir de `maxChips`, resume el resto con
«+N» para que el control no crezca sin límite.

```tsx
<MultiComboboxField options={tecnologias} value={stack} onValueChange={setStack} maxChips={2} />
```

> La X de cada chip es un `<span role="button">` y no un `<button>`, dado que
> vive dentro del disparador y un botón dentro de otro es HTML inválido. El
> disparador sigue siendo el único control enfocable con Tab.

#### FileUpload

Área para soltar o elegir archivos.

Reporta **siempre las dos listas** (aceptados y rechazados, con el motivo) en
vez de descartar en silencio lo que no pasa. Un archivo que desaparece sin
explicación es el peor resultado posible de un campo de subida; la idea viene
del `DropZone` de Polaris, que separa `onDropAccepted` de `onDropRejected`.

No guarda los archivos ni los muestra. Esa parte se compone con `FileUploadList`
y `FileUploadItem`, para que la lista pueda vivir donde haga falta.

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

| Prop        | Tipo                                              | Default | Descripción                      |
| ----------- | ------------------------------------------------- | ------- | -------------------------------- |
| `accept`    | `string`                                          | —       | Filtro nativo: `"image/*,.pdf"`  |
| `multiple`  | `boolean`                                         | `false` | —                                |
| `maxSize`   | `number`                                          | —       | Bytes, por archivo               |
| `validator` | `(file: File) => boolean`                         | —       | Regla propia; `false` lo rechaza |
| `onFiles`   | `(aceptados, rechazados: RejectedFile[]) => void` | —       | —                                |
| `invalid`   | `boolean`                                         | —       | Marca el área como inválida      |
| `label`     | `string`                                          | i18n    | Texto principal                  |
| `hint`      | `string`                                          | —       | Formatos y tamaño admitidos      |

`RejectedFile` trae `{ file, reason }`, con `reason` en `"type" | "size" | "custom"`.

#### Stepper

Indicador de progreso por pasos. El orden es la información que transmite y un
lector de pantalla debe poder anunciarlo, de ahí que se renderice como un `<ol>`
y no como una fila de divs.

El estado de cada paso lo decide quien lo usa, con `status`. El componente no lo
deduce de un índice, porque un flujo real salta pasos y vuelve atrás.

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

| Prop          | Tipo                                    | Default           | Descripción                          |
| ------------- | --------------------------------------- | ----------------- | ------------------------------------ |
| `orientation` | `"horizontal" \| "vertical"`            | `"horizontal"`    | En `Stepper`                         |
| `status`      | `"complete" \| "current" \| "upcoming"` | `"upcoming"`      | En `StepperItem`                     |
| `indicator`   | `React.ReactNode`                       | check si completo | Número o icono del indicador         |
| `last`        | `boolean`                               | —                 | Oculta la línea; ponelo en el último |

El paso actual lleva `aria-current="step"`, y completo y actual anuncian su
estado con texto para lectores de pantalla.

### Navegación

| Componente                                                   | Import                              | Radix                                                                                 |
| ------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Tabs, TabsList, TabsTrigger, TabsContent                     | `@calumet/elise-ui/tabs`            | [Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)                      |
| Accordion, AccordionItem, AccordionTrigger, AccordionContent | `@calumet/elise-ui/accordion`       | [Accordion](https://www.radix-ui.com/primitives/docs/components/accordion)            |
| Collapsible, CollapsibleTrigger, CollapsibleContent          | `@calumet/elise-ui/collapsible`     | [Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible)        |
| NavigationMenu, NavigationMenuList, NavigationMenuItem, ...  | `@calumet/elise-ui/navigation-menu` | [NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) |
| Menubar, MenubarMenu, MenubarTrigger, MenubarContent, ...    | `@calumet/elise-ui/menubar`         | [Menubar](https://www.radix-ui.com/primitives/docs/components/menubar)                |
| DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, ...  | `@calumet/elise-ui/dropdown-menu`   | [DropdownMenu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)     |
| ContextMenu, ContextMenuTrigger, ContextMenuContent, ...     | `@calumet/elise-ui/context-menu`    | [ContextMenu](https://www.radix-ui.com/primitives/docs/components/context-menu)       |
| Pagination, PaginationContent, PaginationItem                | `@calumet/elise-ui/pagination`      | —                                                                                     |

### Feedback

| Componente                                                                             | Import                           | Radix                                                                           |
| -------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose          | `@calumet/elise-ui/toast`        | [Toast](https://www.radix-ui.com/primitives/docs/components/toast)              |
| AlertDialog, AlertDialogTrigger, AlertDialogContent, ...                               | `@calumet/elise-ui/alert-dialog` | [AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog) |
| Progress                                                                               | `@calumet/elise-ui/progress`     | [Progress](https://www.radix-ui.com/primitives/docs/components/progress)        |
| Skeleton                                                                               | `@calumet/elise-ui/skeleton`     | —                                                                               |
| Alert, AlertTitle, AlertDescription                                                    | `@calumet/elise-ui/alert`        | —                                                                               |
| Badge                                                                                  | `@calumet/elise-ui/badge`        | —                                                                               |
| Chip                                                                                   | `@calumet/elise-ui/chip`         | —                                                                               |
| Spinner                                                                                | `@calumet/elise-ui/spinner`      | —                                                                               |
| EmptyState, EmptyStateMedia, EmptyStateTitle, EmptyStateDescription, EmptyStateActions | `@calumet/elise-ui/empty-state`  | —                                                                               |

#### Badge vs Chip

Se parecen de lejos y no son lo mismo.

|          | `Badge`                         | `Chip`                   |
| -------- | ------------------------------- | ------------------------ |
| qué dice | un estado que el sistema afirma | un dato que alguien puso |
| color    | `tone` semántico                | `color` sin semántica    |
| se quita | no                              | con `onRemove`           |

Un badge dice «este pedido está despachado»; un chip dice «filtraste por
_frontend_». Por eso el chip no lleva tono: teñir de rojo un filtro que el
usuario escribió no significaría nada. Y por eso su tipografía es la del texto y
no la de una etiqueta, ya que lo que va dentro es contenido que se lee, no un
rótulo que se ojea.

No existe un `Tag`. Lo que se suele llamar así es este chip.

#### Alert vs AlertDialog

`Alert` es un mensaje en línea que se renderiza dentro del flujo de la página y
no interrumpe. `AlertDialog` es modal y bloquea hasta que el usuario decide. Si
el mensaje no exige una decisión, es `Alert`.

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

| Prop        | Tipo                                           | Default  | Descripción                           |
| ----------- | ---------------------------------------------- | -------- | ------------------------------------- |
| `tone`      | `"info" \| "success" \| "warning" \| "danger"` | `"info"` | Superficie, icono y `role` del bloque |
| `icon`      | `React.ReactNode`                              | —        | Sustituye el icono. `null` lo quita   |
| `onDismiss` | `() => void`                                   | —        | Muestra el botón de cierre            |

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

Hereda el color del texto, así que se tiñe con cualquier utilidad `text-*`.
Sigue girando bajo `prefers-reduced-motion` (lleva `data-motion="essential"`),
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

Para el caso "no hay resultados" de una búsqueda, el título debería nombrar el
término buscado en vez de decir solo "Sin resultados".

### Overlay

| Componente                                                                         | Import                         | Radix                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription | `@calumet/elise-ui/dialog`     | [Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)        |
| Popover, PopoverTrigger, PopoverContent                                            | `@calumet/elise-ui/popover`    | [Popover](https://www.radix-ui.com/primitives/docs/components/popover)      |
| HoverCard, HoverCardTrigger, HoverCardContent                                      | `@calumet/elise-ui/hover-card` | [HoverCard](https://www.radix-ui.com/primitives/docs/components/hover-card) |
| Tooltip, TooltipProvider, TooltipTrigger, TooltipContent                           | `@calumet/elise-ui/tooltip`    | [Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)      |

#### Las tres zonas

`Dialog`, `AlertDialog` y `Sheet` reparten su contenido igual: cabecera y pie
fijos sobre banda tenue con su filete, y cuerpo en blanco que es lo único que se
desplaza. Con un formulario largo, el título y las acciones no hay que ir a
buscarlos al final.

```tsx
<SheetContent>
  <SheetHeader>
    <SheetTitle>Filtros</SheetTitle>
  </SheetHeader>
  <SheetBody>…</SheetBody>
  <SheetFooter>
    <Button>Aplicar</Button>
  </SheetFooter>
</SheetContent>
```

Las clases salen de `CABECERA_DIALOGO`, `CUERPO_DIALOGO` y `PIE_DIALOGO`, que
`dialog` exporta sueltas para que las tres superficies usen exactamente las
mismas. Un panel o un diálogo sin su zona de cuerpo pierde el desplazamiento y
las tres zonas se leen como contenido que se quedó arriba y abajo.

### Media

| Componente                                                              | Import                           | Radix / Externo                                                      |
| ----------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| Avatar, AvatarImage, AvatarFallback                                     | `@calumet/elise-ui/avatar`       | [Avatar](https://www.radix-ui.com/primitives/docs/components/avatar) |
| AvatarGroup                                                             | `@calumet/elise-ui/avatar-group` | —                                                                    |
| Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext | `@calumet/elise-ui/carousel`     | [Embla Carousel](https://www.embla-carousel.com/)                    |
| Calendar                                                                | `@calumet/elise-ui/calendar`     | [react-day-picker](https://react-day-picker.js.org/)                 |
| DatePicker, DateRangePicker                                             | `@calumet/elise-ui/date-picker`  | [react-day-picker](https://react-day-picker.js.org/)                 |

### Acciones

| Componente                                                                                    | Import                           | Radix / Externo                                                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| Button                                                                                        | `@calumet/elise-ui/button`       | — (usa [Slot](https://www.radix-ui.com/primitives/docs/utilities/slot) de Radix) |
| Toggle                                                                                        | `@calumet/elise-ui/toggle`       | [Toggle](https://www.radix-ui.com/primitives/docs/components/toggle)             |
| ToggleGroup, ToggleGroupItem                                                                  | `@calumet/elise-ui/toggle-group` | [ToggleGroup](https://www.radix-ui.com/primitives/docs/components/toggle-group)  |
| Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem, ToolbarLink  | `@calumet/elise-ui/toolbar`      | [Toolbar](https://www.radix-ui.com/primitives/docs/components/toolbar)           |
| Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator | `@calumet/elise-ui/command`      | [cmdk](https://cmdk.paco.me/)                                                    |

`Toggle` sirve suelto, con `pressed` y `onPressedChange`, y también dentro de un
`ToggleGroup`, donde el valor lo lleva el grupo y la opción se identifica con
`value`. `ToggleGroupItem` es el nombre explícito para ese segundo caso.

### Datos

| Componente                                                    | Import                               | Radix |
| ------------------------------------------------------------- | ------------------------------------ | ----- |
| Table, TableHeader, TableBody, TableRow, TableHead, TableCell | `@calumet/elise-ui/table`            | —     |
| Stat, StatLabel, StatValue, StatChange                        | `@calumet/elise-ui/stat`             | —     |
| DescriptionList, DescriptionListItem                          | `@calumet/elise-ui/description-list` | —     |
| Timeline, TimelineItem                                        | `@calumet/elise-ui/timeline`         | —     |
| Tree, TreeItem                                                | `@calumet/elise-ui/tree`             | —     |

`DescriptionList` es un `<dl>` de verdad, con sus `<dt>` y `<dd>`, así que la
relación entre el rótulo y su valor está en el marcado y un lector de pantalla
puede recorrerla por términos. Estrecha se apila y ancha se parte en dos
columnas; mide su propio hueco y no la ventana, ya que la misma lista puede ir a
lo ancho de una página o dentro de una tarjeta.

`Tree` lleva el patrón de árbol de ARIA entero, y esa es la razón de que exista
como componente en vez de resolverse con listas anidadas y un `Collapsible` por
rama: anuncia el nivel y cuántos hermanos hay, y el teclado se mueve como se
espera de un árbol (arriba y abajo recorren lo que se ve, derecha abre o entra,
izquierda cierra o sube al padre). El foco entra una sola vez y desde ahí se mueve
con las flechas, porque con un `tabIndex` por nodo, tabular por un árbol de
cincuenta hojas serían cincuenta paradas.

> Para tablas con funcionalidad avanzada (filtros, paginación, ordenamiento, exportación), usa el componente `DataTable` de `@calumet/elise-tables`. Ver [Utilidades](utilidades.md#tables---datatable).

#### Table

`Table` no es solo el marcado de una tabla: arma la tarjeta entera, con su
contorno, su encabezado fijo y su pie de paginación. `DataTable` de
`@calumet/elise-tables` se apoya en ella y no monta la suya.

| Prop            | Tipo                          | Default  | Descripción                               |
| --------------- | ----------------------------- | -------- | ----------------------------------------- |
| `variant`       | `"auto" \| "table" \| "list"` | `"auto"` | Cómo se dibuja cuando el ancho aprieta    |
| `listSlot`      | por columna                   | —        | Dónde cae esa columna en el modo lista    |
| `format`        | por columna                   | —        | Alineación y formato de la celda          |
| `paginate`      | `boolean`                     | `false`  | Enciende la franja del pie                |
| `loading`       | `boolean`                     | `false`  | Atenúa las filas mientras llega la página |
| `clickDelegate` | en `TableRow`                 | —        | Toda la fila lleva a un sitio             |
| `filters`       | `ReactNode`                   | —        | Ranura sobre la tabla                     |

**Los tres modos.** `auto` es tabla mientras quepa y lista cuando no, midiendo su
propio hueco y no la ventana, porque la misma tabla puede ir a lo ancho de una
página o dentro de una tarjeta estrecha. El corte está en 490px. En modo lista
cada fila deja de ser una rejilla de celdas y pasa a ser un bloque, y `listSlot`
dice qué papel juega cada columna ahí.

**Paginación.** La franja del pie es un `Pagination` con `variant="table"`: se
reparte en tres bandas para que los pasos queden centrados aunque los extremos
midan distinto. Lo que va a los lados (el «filas por página», el recuento) entra
por `paginationEnd`.

**`loading`.** Atenúa las filas en vez de taparlas con un panel: la tabla que ya
estaba sigue leyéndose mientras llega la siguiente página, que es lo que hace
falta cuando se cambia de página y no cuando se carga por primera vez.

#### ColorPicker

Área de saturación y brillo, barra de tono, barra de alfa opcional y campo hex.

| Prop            | Tipo                      | Default | Descripción                                 |
| --------------- | ------------------------- | ------- | ------------------------------------------- |
| `value`         | `string`                  | —       | Hex de 6 o de 8                             |
| `defaultValue`  | `string`                  | —       | Sin controlar                               |
| `onValueChange` | `(value: string) => void` | —       | En cada paso del arrastre                   |
| `onValueCommit` | `(value: string) => void` | —       | Al soltar                                   |
| `alpha`         | `boolean`                 | `false` | Añade la barra de opacidad y emite hex de 8 |
| `name`          | `string`                  | —       | Para enviarlo en un formulario              |

Lee HSL, HSLA, RGB, RGBA y hex de 3, 4, 6 y 8, que es lo que se copia de una hoja
de estilos o de una guía de marca sin tener que convertirlo antes. Siempre emite
hex, de 6 o de 8 con `alpha`, para que quien lo reciba no tenga que aceptar cinco
formatos.

Por dentro el modelo es HSV y no HSL, porque el área de dos ejes es literalmente
saturación por brillo. El tono se guarda aparte del color y no se deduce del hex:
en negro puro y en blanco puro el tono no existe, así que arrastrar hasta una
esquina y volver lo perdería y el selector saltaría al rojo solo.

La aritmética vive en `lib/color.ts`, separada del componente para poder
comprobarla contra valores conocidos.

## Marco de aplicación

La pieza que contiene a las demás: cabecera arriba, navegación al lado y el área
donde entra cada pantalla. No es un componente suelto sino un chasis con estado y
partes componibles, y por eso vive en su propia categoría.

| Componente                                             | Import                        | Radix |
| ------------------------------------------------------ | ----------------------------- | ----- |
| AppShell, AppShellHeader, AppShellNav, AppShellMain, … | `@calumet/elise-ui/app-shell` | —     |

```tsx
import {
  AppShell,
  AppShellHeader,
  AppShellHeaderBrand,
  AppShellHeaderSearch,
  AppShellHeaderActions,
  AppShellHeaderAction,
  AppShellUserMenu,
  AppShellNav,
  AppShellNavToggle,
  AppShellNavGroup,
  AppShellNavItem,
  AppShellNavSubList,
  AppShellNavSubItem,
  AppShellNavFooter,
  AppShellMain,
} from "@calumet/elise-ui/app-shell";

<AppShell>
  <AppShellHeader>
    <AppShellNavToggle />
    <AppShellHeaderBrand>
      <Text size="lg" weight="bold">Calumet</Text>
    </AppShellHeaderBrand>
    <AppShellHeaderSearch shortcut={["Ctrl", "K"]} onClick={abrirBuscador}>
      Buscar
    </AppShellHeaderSearch>
    <AppShellHeaderActions>
      <AppShellHeaderAction label="Notificaciones" icon={<Campana />} onClick={…} />
      <AppShellUserMenu name="Juan D." detail="Calumet S.A.S." initials="JD">
        <DropdownMenuItem>Perfil</DropdownMenuItem>
      </AppShellUserMenu>
    </AppShellHeaderActions>
  </AppShellHeader>

  <AppShellNav>
    <ul className="list-none p-0">
      <AppShellNavItem href="/" icon={<Casa />} count={12} active>Inicio</AppShellNavItem>
      <AppShellNavGroup defaultOpen>
        <AppShellNavItem href="/clientes" icon={<Gente />} childActive>Clientes</AppShellNavItem>
        <AppShellNavSubList>
          <AppShellNavSubItem href="/segmentos" active>Segmentos</AppShellNavSubItem>
        </AppShellNavSubList>
      </AppShellNavGroup>
    </ul>
    <AppShellNavFooter>
      <AppShellNavItem href="/ajustes" icon={<Rueda />}>Ajustes</AppShellNavItem>
    </AppShellNavFooter>
  </AppShellNav>

  <AppShellMain>{children}</AppShellMain>
</AppShell>;
```

### Las partes

| Parte                   | Qué es                                                    |
| ----------------------- | --------------------------------------------------------- |
| `AppShell`              | El marco. Lleva el estado del cajón y el guardia de ancho |
| `AppShellHeader`        | La barra superior. Reparte sus tres bandas sola           |
| `AppShellHeaderBrand`   | Logo y nombre. Se va donde no cabe                        |
| `AppShellHeaderSearch`  | El disparador de la búsqueda, con su atajo                |
| `AppShellHeaderActions` | La banda del final: acciones y, al cierre, la cuenta      |
| `AppShellHeaderAction`  | Una acción de solo icono                                  |
| `AppShellUserMenu`      | La cuenta, sobre `DropdownMenu`                           |
| `AppShellNavToggle`     | Abre y cierra el cajón. Solo donde la barra está plegada  |
| `AppShellNav`           | La navegación lateral                                     |
| `AppShellNavSection`    | Grupo de entradas con su rótulo                           |
| `AppShellNavGroup`      | Una entrada con hijas, plegable                           |
| `AppShellNavItem`       | Una entrada                                               |
| `AppShellNavAction`     | Acción que aparece al apuntar una entrada                 |
| `AppShellNavSubList`    | La lista de hijas, con su guía                            |
| `AppShellNavSubItem`    | Una hija                                                  |
| `AppShellNavFooter`     | Zona fija al pie de la navegación                         |
| `AppShellMain`          | El área de contenido                                      |

### Cómo se comporta

**Cada parte dice en qué celda cae.** El marco es una rejilla de dos filas, y la
cabecera, la navegación y el contenido llevan su sitio escrito encima, así que
el orden en que se escriban da igual y el marco no tiene que reconocer a
ninguno. Eso es lo que permite envolverlos: un `<CabeceraDeLaApp />` propio que
por dentro emita un `AppShellHeader` sigue cayendo en la fila de arriba, a
cualquier profundidad. Lo que sí rompe la colocación es meterlos dentro de un
`<div>`, porque entonces el hijo de la rejilla es el `<div>` y no la parte.

**El cajón cuelga de la fila de contenido y no de la ventana**, de modo que la
cabecera sigue a la vista y alcanzable mientras la navegación está abierta. Por
eso el cajón no es un `Sheet`, que es de posición fija.

**Un solo `<nav>`.** Lo que cambia entre escritorio y cajón es posicionamiento, y
para eso basta el breakpoint. Montarlo dos veces duplicaría cualquier `id` y
dejaría dos landmarks de navegación donde solo hay una. Lleva nombre accesible,
que sin él un lector de pantalla los lista todos como «navegación» sin poder
distinguirlos.

**`AppShellMain` solo se vuelve inerte donde el cajón existe.** Por encima del
breakpoint no hay velo que lo tape, así que dejarlo inerte lo haría inalcanzable
a plena vista.

**Las entradas con hijas van en `AppShellNavGroup`**, que es el dueño del `<li>`.
Dentro de un `<ul>` solo pueden ir `<li>`, así que la lista de hijas tiene que
colgar del `<li>` del padre y no ser su hermana. El grupo también es quien puede
plegar: le pone `aria-expanded` y `aria-controls` a la fila del padre, y la lista
plegada va `inert`, porque recortarla no basta y se llegaría a enlaces invisibles.

**La guía de continuidad** baja desde el icono del padre y dobla en codo sobre la
hija activa; por debajo de ella ya no sigue. Un borde izquierdo plano diría «estas
van juntas», y el codo además dice cuál se está viendo. Se refleja en RTL.

### Cabecera: las tres bandas

Las dos bandas de los lados valen `1fr`, de modo que miden lo mismo y el buscador
queda centrado en la ventana aunque el nombre crezca.

> **No les pongas `min-w-0`.** Anula el mínimo automático de su pista, y entonces
> el centro, que es de tamaño fijo, se reparte antes que las `fr` y se lleva el
> ancho entero: las bandas quedan en cero y su contenido se sale por encima del
> buscador. Quien encoge es el texto de dentro, que ya se corta.

Por debajo del breakpoint deja de haber tres bandas y pasa a ser una fila con un
solo hueco, con el buscador como lo que crece. Centrar el buscador solo tiene
sentido cuando sobra ancho; en estrecho lo que se nota es el ritmo.

## Ejemplo: Button

El componente `Button` es el más utilizado y demuestra los patrones principales de Elise.

### Variantes

```tsx
import { Button } from "@calumet/elise-ui/button";

<Button variant="solid">Solido</Button>    // Fondo de color
<Button variant="outline">Contorno</Button> // Solo borde
<Button variant="ghost">Fantasma</Button>   // Sin fondo ni borde
```

### Tamaños

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

| Prop      | Tipo                                 | Default   | Descripción                               |
| --------- | ------------------------------------ | --------- | ----------------------------------------- |
| `variant` | `"solid" \| "outline" \| "ghost"`    | `"solid"` | Estilo visual                             |
| `size`    | `"sm" \| "md" \| "lg" \| "icon"`     | `"md"`    | Tamaño                                    |
| `tone`    | `"success" \| "warning" \| "danger"` | —         | Color semántico (sobreescribe el variant) |
| `asChild` | `boolean`                            | `false`   | Renderiza el hijo en lugar de `<button>`  |

Además, acepta todas las props nativas de `<button>` (onClick, disabled, type, etc.).

## Patrón `asChild`

Muchos componentes soportan `asChild` para renderizar un elemento diferente al por defecto, manteniendo el comportamiento y los estilos:

```tsx
import { Button } from "@calumet/elise-ui/button";

// Renderiza como <a> con estilos de Button
<Button asChild>
  <a href="/otra-pagina">Navegar</a>
</Button>;
```

Este patrón viene de Radix UI. Consulta la [guía de composición de Radix](https://www.radix-ui.com/primitives/docs/guides/composition) para más detalles.

---

Siguiente: [Utilidades](utilidades.md) | [Temas](temas.md)
