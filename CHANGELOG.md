# Changelog

Cambios que afectan a quien consume los paquetes. Empieza en la 0.3.0 de
`@calumet/elise-ui`; lo anterior está solo en el historial de git.

## `@calumet/elise-ui` 0.4.0

Sube la minor y no la patch porque hay cinco cambios que rompen: por debajo de
la 1.0 es ahí donde van.

### Rompe

- **Los tres controles marcables son campos.** `Switch`, `Checkbox`,
  `RadioGroup` y `RadioGroupItem` traen su propio rótulo, ayuda y error, con el
  enlace de accesibilidad resuelto. `label` es obligatorio, y dejan de aceptar
  las props crudas del primitivo de Radix. `RadioGroupItem` tampoco acepta ya
  hijos sueltos: el texto va en `label`.

  ```tsx
  // antes
  <div className="flex items-center gap-2">
    <Checkbox id="acepta" />
    <Label htmlFor="acepta">Acepto</Label>
  </div>

  // ahora
  <Checkbox label="Acepto" />
  ```

  En los radios, el rótulo, la ayuda y el error pasan al **grupo**, porque la
  pregunta se hace una vez y las opciones son las respuestas. Cada opción
  conserva su `description` y puede señalarse con `invalid`.

- **`AlertDialog` usa el marco de `Dialog`.** Cabecera y pie sobre banda tenue,
  cuerpo en blanco. Entra `AlertDialogBody`, y la descripción tiene que mudarse
  ahí: dentro de `AlertDialogHeader` quedaría sobre el gris. El ancho por
  defecto baja de 480px al estrecho de la escala, 380px.

- **`ScrollArea` deja de dibujar su barra.** Es un `div` con `overflow-auto`,
  así que sus props pasan de las del primitivo de Radix (`type`,
  `scrollHideDelay`, `dir`) a las de un `div`. Sale la dependencia
  `@radix-ui/react-scroll-area`.

- **Las entradas de navegación con hijas van dentro de `AppShellNavGroup`.**
  Escritas como hermanas, un `<ul>` colgaba directamente de otro `<ul>`. El
  grupo es el dueño del `<li>` y recibe la fila y la lista.

  ```tsx
  // antes
  <AppShellNavItem …>Clientes</AppShellNavItem>
  <AppShellNavSubList>…</AppShellNavSubList>

  // ahora
  <AppShellNavGroup defaultOpen>
    <AppShellNavItem …>Clientes</AppShellNavItem>
    <AppShellNavSubList>…</AppShellNavSubList>
  </AppShellNavGroup>
  ```

- **`AvatarFallback` hereda el tamaño de texto del `Avatar`** en vez de fijar el
  suyo. Un fallback con tipografía propia tiene que declararla.

- **Cambia el aspecto, no la API.** El valor de `--muted` sube y con él el
  encabezado de las tablas y las filas apuntadas. Las tres zonas del diálogo
  pasan a 16px de relleno a los costados, antes 20. Las fichas del
  `MultiCombobox` dejan de ser un `Badge` y toman la forma de `Chip`. El
  deslizador y el interruptor apagado usan `--track` y ya no un gris de
  superficie.

### Agrega

- **Primitivas.** `Link`, `Code` y `Kbd`.
- **Marco de aplicación.** `AppShell` y sus diecisiete partes, incluidas
  `AppShellNavGroup`, `AppShellNavAction`, `AppShellNavFooter`,
  `AppShellHeaderBrand`, `AppShellHeaderSearch`, `AppShellHeaderActions`,
  `AppShellHeaderAction` y `AppShellUserMenu`.
- **Campos.** `DateField`, `TimePicker`, `NumberField`, `SearchField`,
  `TagInput`, `Rating`, `SegmentedControl`, `ColorPicker` e `InlineError`.
- **Datos.** `Stat`, `DescriptionList`, `Timeline`, `Tree` y `AvatarGroup`.
- **`Chip`**, separado de `Badge`: el badge es un estado que el sistema afirma y
  el chip un dato que alguien puso y puede quitar. No existe un `Tag`.
- **`Table` cierra su contrato**: `variant` con los tres modos, `listSlot` y
  `format` por columna, `paginate`, `loading`, `clickDelegate` y la ranura
  `filters`. `DataTable` de `@calumet/elise-tables` pasa por ellos y ya no
  duplica la tarjeta ni la paginación.
- **`Pagination`** gana `variant="table"` y `end`, más `PaginationFirst`,
  `PaginationLast`, `PaginationStep` y `PaginationLabel`.
- **`Field`** gana `labelHidden`, y exporta `useFieldIds` y `FieldRequiredMark`
  para que otro campo con su propia maquetación no copie el cableado.
- **`Avatar`** gana `size` en cuatro pasos y `shape` en redondo o cuadrado, con
  el radio emparejado al tamaño. El 40 redondo sigue siendo el de por defecto.
- **Tokens.** Seis capas de apilado con nombre (`z-sticky`, `z-overlay`,
  `z-modal`, `z-popover`, `z-tooltip`, `z-toast`) y `--track`, el tramo sin
  llenar de un control que muestra un estado o un recorrido.
- **`DropdownMenuItem` mide sus iconos**, que antes salían a su tamaño natural y
  estiraban la fila.

### Arregla

- **El interruptor apagado y el deslizador sin llenar eran invisibles.** Medían
  1.07:1 contra la tarjeta en claro y 1.14:1 en oscuro. Con `--track` suben a
  3.11:1 y 3.60:1, por encima del 3:1 que pide un control.
- **`AppShell` montaba el mismo `<nav>` dos veces**, así que cualquier `id` que
  se le pasara salía duplicado y había dos landmarks de navegación. Ahora es uno
  y lleva nombre accesible.
- **`AppShellMain` podía quedar inerte para siempre.** El guardia de ancho solo
  escuchaba el cambio de breakpoint y no miraba el ancho al montar, de modo que
  montar con el cajón abierto por encima de 768px dejaba el contenido
  inalcanzable a la vista.
- **La lista de hijas plegada seguía en el tabulador**, así que se llegaba a
  enlaces invisibles.
- **La guía de continuidad no se reflejaba en RTL**: el codo nacía del lado
  equivocado y la punta señalaba fuera de la barra.
- **Las bandas de la cabecera colapsaban por debajo de 600px** y su contenido se
  salía por encima del buscador.
- **El error de un campo no llevaba icono** salvo dentro de `Field`. Ahora todos
  usan `InlineError`.
- **Una fila de la tabla parpadeaba con un filete casi negro** al reordenar.
- **El desplazamiento no era el mismo en toda la página.** La lista del
  `TimePicker` y `ScrollArea` dibujaban una barra propia que se escondía en
  reposo, mientras la página y los desplegables usan la nativa.

## `@calumet/elise-tables` 0.2.0

Ninguna prop cambia; lo que cambia es lo que se ve, y por eso sube la minor.

- **`DataTable` deja de armar su propia tarjeta.** Pasa por `variant`, `paginate`
  y `loading` de `Table`, que antes duplicaba con su propio marco y su propia
  franja de paginación. Dos tablas seguidas ya no se ven de sistemas distintos.
- **El «filas por página» se muda dentro del pie**, junto a los pasos, en vez de
  quedar suelto encima de la tabla.
- Requiere `@calumet/elise-ui` 0.4.

## `@calumet/elise-alerts` 0.2.0

`openAlert`, `closeAlert` y `AlertHost` no cambian de firma.

- **El diálogo toma las tres zonas de `AlertDialog`**: el título en la banda de
  arriba y la pregunta, con su icono, en el cuerpo. Antes iban los dos juntos.
- Se estrecha, porque el ancho por defecto de `AlertDialog` baja a 380px.
- Requiere `@calumet/elise-ui` 0.4.

## `@calumet/elise-toasts` 0.2.0

- **El aviso va invertido.** Llega encima de una pantalla llena de tarjetas, y
  otra tarjeta blanca más se confunde con ellas; invertirlo lo despega sin
  recurrir a un color de estado, que ahí significaría otra cosa. Cambian también
  el radio, el relleno y el ancho máximo.
- Requiere `@calumet/elise-ui` 0.4.

## `@calumet/elise-ui` 0.3.0

`Accordion`, `Checkbox`, `RadioGroup`, `Switch`, `Toggle`, `ToggleGroup`,
`Progress` y `Separator` pasan de una implementación propia al primitive de
Radix que la documentación ya les atribuía.

### Rompe

- **`Dropdown` y su familia se retiran.** La variante basada en `<details>`
  duplicaba lo que hace `DropdownMenu` sin llegar a su comportamiento: sin foco
  itinerante, sin cierre al pulsar fuera y sin `data-state`. `DropdownMenu`
  cubre los mismos casos, incluidos encabezado y separador. El subpath
  `@calumet/elise-ui/dropdown-native` deja de existir.
- **`Checkbox` y `Switch` dejan de ser un `input`.** Son un `button` con
  `role="checkbox"` o `role="switch"`. `checked`, `defaultChecked`,
  `onCheckedChange`, `name`, `value`, `disabled` y `required` siguen igual, y
  con `name` se emite un input oculto para que un formulario nativo los envíe.
  `onChange` ya no llega.
- **Un rótulo envolvente deja de activarlos.** `<label><Checkbox />Texto</label>`
  funcionaba porque el input estaba dentro. Con un `button` hay que enlazarlo,
  con `<Checkbox id="x" />` junto a `<Label htmlFor="x">`.
- **`RadioGroupItem` ya no acepta props de `input`.** Recibe `value`,
  `disabled`, `required` e `id`.

### Agrega

- `Accordion` respeta `collapsible`, que antes se aceptaba sin efecto.
- `Checkbox` acepta `checked="indeterminate"`.
- `RadioGroup`, `ToggleGroup`, `Switch` y `Toggle` aceptan modo controlado.
- `ToggleGroup` y `RadioGroup` son una sola parada de tabulación, y las flechas
  recorren las opciones.
- `Progress` acepta `value={null}` para una espera de duración desconocida.
- Los ocho aceptan `asChild` y publican su `data-state`.
- `data-slot` en los 109 sub-componentes que no lo tenían, de modo que
  `has-data-[slot=…]` sirve en todo el catálogo.
