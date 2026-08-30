# Changelog

Cambios que afectan a quien consume los paquetes. Empieza en la 0.3.0 de
`@calumet/elise-ui`; lo anterior está solo en el historial de git.

## `@calumet/elise-ui` 0.9.0, `elise-tables` 0.3.0, `elise-toasts` 0.4.0 y `elise-alerts` 0.3.0

### Agrega

- **Cada hoja dice dónde está su código.** Montar Elise pedía una ruta escrita a
  mano por paquete instalado, y otra distinta según el registro: el código
  compilado vive en `dist` desde GitHub Packages y en `jsr` desde JSR. Tailwind
  resuelve cada `@source` contra el archivo que lo declara, no contra el CSS de
  la app, así que ahora los declaran `elise.css` y el `tailwind.css` nuevo de
  `elise-tables`, `elise-toasts` y `elise-alerts`, y siguen siendo válidos desde
  dentro de `node_modules`. Un `@source` que apunta a una carpeta inexistente se
  ignora sin error, así que las dos rutas conviven en la misma hoja y el snippet
  es el mismo en los dos registros. Tampoco hay que repetir
  `@import "tailwindcss"`: la hoja ya lo trae, y la detección automática de
  Tailwind sigue anclada al CSS de la app, no al de la librería.

  ```
  antes   @import "tailwindcss";
          @import "@calumet/elise-ui/tailwind/elise.css";
          @source "../node_modules/@calumet/elise-ui/dist";
          @source "../node_modules/@calumet/elise-tables/dist";

  ahora   @import "@calumet/elise-ui/tailwind/elise.css";
          @import "@calumet/elise-tables/tailwind.css";
  ```

  Sigue habiendo una línea por paquete instalado, y ese es el piso: Tailwind
  resuelve los enlaces de pnpm al directorio real del store, donde una hoja no
  ve a sus hermanas. El montaje viejo no se rompe; un `@source` repetido solo
  escanea dos veces.

- **`@calumet/elise-ui/styles.css`, el sistema ya compilado.** Un import en el
  punto de entrada de la app y no hay nada que configurar: ni Tailwind, ni
  plugin de Vite, ni `@source`. Son 105 KB minificados que el `build` del
  paquete arma con el CLI de Tailwind desde `src/tailwind/standalone.css`, y
  cubren también `elise-tables`, `elise-toasts` y `elise-alerts`.

  A cambio, los tokens del sistema no quedan disponibles para el marcado propio
  de la app; para eso está la vía con Tailwind. Las tipografías siguen aparte en
  `fonts.css`, porque sus `url()` apuntan a los archivos de Fontsource dentro
  de `node_modules` y esas rutas no sobreviven al publicado.

## `@calumet/elise-ui` 0.8.1

Tres correcciones, todas del mismo tipo: cosas que el componente no resolvía y
cada pantalla tenía que acordarse de hacer bien.

### Corrige

- **El rótulo de una pestaña se partía en dos renglones.** `TabsTrigger` no
  llevaba `whitespace-nowrap`, así que dentro de la fila flex encogía hasta su
  ancho de contenido mínimo, que en una etiqueta de dos palabras es la palabra
  más larga. Medido a 320, 360 y 414: «Actas y decisiones» pasaba de 157px a 105,
  el ancho de «decisiones», y se partía dentro de una caja de 40px de alto. Es el
  mismo defecto que se corrigió en `Button` y la misma pareja que ya llevan
  `Badge` y `SegmentedControl`.

- **La fila de pestañas se desborda donde no cabe.** Cuatro pestañas piden 514px
  y el área de contenido de un móvil de 360 da 320, así que dos quedaban fuera de
  la pantalla, sin desplazamiento ni nada que lo indicara. Ahora se desplaza a lo
  ancho, como ya hacían `Table` y el `Stepper` horizontal. El recorte vive en una
  envoltura nueva, `data-slot="tabs-list-scroll"`, y no en la propia lista,
  porque `overflow-x` arrastra a `overflow-y` y ahí el anillo de foco de una
  pestaña salía cortado por los cuatro lados. La lista sigue siendo el mismo
  elemento con las mismas clases; lo único que cambia para quien ya la usaba es
  que deja de ser hija directa de su contenedor. De 768 para arriba la fila se
  dibuja idéntica píxel a píxel.

- **Sin navegación, el botón del cajón dejaba la pantalla muerta.** Un marco de
  un solo registro no lleva `AppShellNav`, y ahí el botón se dibujaba igual por
  debajo del breakpoint. Pulsarlo no era inocuo: `AppShellMain` mira
  `cajonAbierto` para volverse inerte, así que el contenido dejaba de responder
  sin velo ni cajón que explicaran por qué, y en un teléfono no hay Escape que lo
  recupere. Ahora `AppShellNav` se anuncia al marco al montarse: sin ninguna, el
  botón no se dibuja y el contenido no puede quedar inerte. Con navegación, el
  cajón, el velo y el estado inerte se comportan igual que antes.

## `@calumet/elise-ui` 0.8.0

Sube la minor porque cambia la forma del marco y con ella lo que `AppShell`
acepta como hijo.

### Rompe

- **`AppShell` es una rejilla y cada parte declara su celda.** Era una columna
  flex con un nodo intermedio, `data-slot="app-shell-body"`, que ya no existe:
  una regla que lo apuntara se queda sin blanco. Un hijo que no sea una de las
  partes tampoco cae solo en su sitio; para ocupar el área de contenido necesita
  `col-start-2 row-start-2`, que es lo que ya trae `AppShellMain`.

### Corrige

- **La cabecera se puede envolver.** `AppShell` la buscaba entre sus hijos por
  `displayName` para dejarla fuera de la fila de contenido, así que una
  `<CabeceraDeLaApp />` propia que por dentro emitiera un `AppShellHeader` caía
  dentro de esa fila, al lado de la navegación y encogida a lo que sobrara.
  Ahora cada parte lleva su celda escrita y el marco no mira a sus hijos.
  Medido con la cabecera, la navegación y el contenido envueltos cada uno en dos
  componentes: las cuatro cajas dan lo mismo que sin envolver a 360, 768 y 1280,
  en LTR y en RTL, con el cajón abierto y cerrado, y sin envolver la captura es
  idéntica píxel a píxel a la de 0.7.1.
  Cierra [#25](https://github.com/calumet/elise/issues/25).

## `@calumet/elise-ui` 0.7.1

### Corrige

- **Las bandas de la cabecera y el pie de la navegación se pueden envolver.**
  `AppShellHeader` repartía sus hijos mirándoles el `displayName`, así que una
  banda sacada a un componente propio no caía en su columna sino junto a la
  marca. `AppShellNav` hacía lo mismo con su pie. Ahora la cabecera es una
  rejilla y cada banda declara su columna, y el pie se ancla con `sticky`; un
  componente de React no agrega nodo al DOM, de modo que envolver deja de
  importar. Medido: envuelta o no, la marca cae en la columna 1, el buscador en
  la 2 y las acciones en la 3, con la misma geometría que antes a 360, 768 y 1280.

  Queda fuera el tercer sitio, `AppShell` buscando su cabecera entre los hijos:
  la fila de contenido es un nodo real del que cuelgan el cajón y su velo, y
  moverla pide rehacer el marco en rejilla.
  Adelanta [#25](https://github.com/calumet/elise/issues/25).

## `@calumet/elise-ui` 0.7.0

Sube la minor porque hay dos cambios que rompen: por debajo de la 1.0 es ahí
donde van.

### Rompe

- **`Input` deja de aceptar el `size` nativo del HTML.** Ahora `size` es el paso
  de la escala y no el ancho en caracteres. Quien usara el atributo tiene que
  pasar a `className` con el ancho que quiera, que además es lo que ya hacía
  falta: `CAMPO_DESNUDO` existe justamente para anular el ancho por defecto de
  veinte caracteres que el atributo impone.

- **`Sheet` toma las tres zonas de `Dialog`.** Cabecera y pie sobre banda tenue
  con su filete, cuerpo en blanco. El panel pierde el hueco de 16px que separaba
  sus partes y pasa de `bg-background` a `bg-card`, que es la superficie sobre
  la que esas zonas están calibradas. Un panel que arme su cuerpo a mano se ve
  distinto hasta que se mude a `SheetBody`.
  Cierra [#27](https://github.com/calumet/elise/issues/27).

### Agrega

- **`Input` y `SelectTrigger` aceptan `size`**, con la misma escala que
  `ComboboxTrigger` y `Button`. Un campo y un botón `sm` en la misma barra de
  herramientas medían 36 contra 32; ahora los cuatro controles miden lo mismo en
  los cuatro pasos, medido: 32, 36, 40 y 44.
  Cierra [#23](https://github.com/calumet/elise/issues/23).

- **La escala gana el paso táctil, `xl`,** 44px, que es el mínimo de área de
  toque y al que no llegaba ninguno de los otros tres. Sale en los cuatro
  controles, `Button` incluido.

- **`SheetBody`.** El cuerpo desplazable del panel, que antes armaba cada
  pantalla.

- **`TAMANOS_CAMPO` y `TamanoCampo`**, exportados desde `input`. Es la escala,
  en un solo sitio, y de ahí la toman `SelectTrigger` y `ComboboxTrigger`.

### Corrige

- **`SelectTrigger` tenía su propia copia de la caja de campo.** Repetía el
  literal en vez de usar `CAJA_CAMPO`, que es de donde salen el borde, el radio,
  el foco y el apagado del resto de los campos.

## `@calumet/elise-ui` 0.6.2, `elise-toasts` 0.3.2, `elise-alerts` 0.2.3 y `elise-tables` 0.2.3

### Corrige

- **El enlace entre paquetes se publicaba clavado a una versión exacta.** Los
  cuatro declaraban sus dependencias del monorepo con `workspace:*`, que al
  publicar se traduce a la versión que tuviera el otro en ese momento. Así,
  `elise-toasts@0.3.1` salió pidiendo `elise-ui@0.6.1` clavado, y cualquier
  parche de `elise-ui` dejaba un aviso de peer sin cumplir en cada
  `pnpm install`. Con `workspace:^` la traducción pasa a `^0.6.1`, que es el
  rango que el propio CHANGELOG venía anotando en prosa.

  Comprobado sobre el tarball, antes y después:

  ```
  antes   "@calumet/elise-ui": "0.6.1"
  ahora   "@calumet/elise-ui": "^0.6.1"
  ```

  Alcanza a `dependencies` y a `peerDependencies`. Ninguna API cambia; lo que
  cambia es lo que va dentro del paquete publicado.
  Cierra [#28](https://github.com/calumet/elise/issues/28).

## `@calumet/elise-ui` 0.6.1

### Corrige

- **`Button` partía y recortaba su rótulo dentro de una fila flex.** Llevaba
  `overflow-hidden` sin `whitespace-nowrap`, y las dos se necesitan juntas: sin
  recorte el rótulo desborda, y sin `nowrap` se parte antes de desbordar.
  Medido a 360px con un rótulo de dos palabras: el botón bajaba de 105px a 82,
  el rótulo pasaba a dos renglones y el bloque de texto llegaba a 37px de alto
  dentro de una caja de 32, así que el segundo renglón se cortaba. Es la misma
  pareja que ya llevaban `Badge` y `SegmentedControl`.
  Cierra [#24](https://github.com/calumet/elise/issues/24).

- **El ejemplo de `AppShellHeader` escondía el botón del cajón.** Lo ponía
  dentro de `AppShellHeaderBrand`, que no se pinta por debajo del breakpoint,
  que es justo donde el cajón existe; por encima se esconde el botón. Medido:
  invisible a 360px y a 1280. El ejemplo pasa a ponerlo suelto, como ya hacían
  el docstring de la marca, la vitrina y `docs/componentes.md`.
  Cierra [#26](https://github.com/calumet/elise/issues/26).

## `@calumet/elise-ui` 0.6.0

### Agrega

- **`Combobox` acepta `modal` y lo reenvía al `Popover`.** También lo aceptan
  `MultiCombobox`, `ComboboxField` y `MultiComboboxField`. Dentro de un
  `Dialog`, el bloqueo de scroll del diálogo cancelaba la rueda sobre la lista,
  que solo se recorría con las flechas o arrastrando la barra. Medido sobre una
  lista que desborda: sin `modal` el desplazamiento se queda en 0 tras una
  rueda de 200px; con `modal` llega a 200. Fuera de un diálogo no cambia nada.
  Cierra [#21](https://github.com/calumet/elise/issues/21).

- **`ComboboxItem` y `ComboboxOption` aceptan `level`.** Para una lista que
  aplana un árbol. La raíz es 0 y cada nivel sangra 16px, la misma medida que
  `Tree`. `group` no cubría el caso: agrupa en un solo escalón y con encabezado,
  y un árbol tiene profundidad arbitraria y padres que también se eligen. La
  sangría va en el contenido de la fila, así que el resaltado del teclado sigue
  midiendo lo mismo a cualquier profundidad.
  Cierra [#22](https://github.com/calumet/elise/issues/22).

## `@calumet/elise-ui` 0.5.3

### Corrige

- **La superficie invertida se daba vuelta en el tema oscuro.** `--inverse` era
  `var(--foreground)`, de modo que en oscuro salía casi blanca y el toast
  aparecía como un panel claro encima de una pantalla oscura. El tema oscuro
  declara ahora la suya, un escalón por encima de `--popover`, que es la capa
  que le corresponde a lo que va encima de todo. En claro no cambia nada.

  De paso, los iconos teñidos del toast dejan de estar calibrados contra el
  fondo equivocado en oscuro. Contra el disco que llevan detrás: info 2.51 →
  3.85, advertencia 1.57 → 5.96, éxito 2.13 → 4.49. El de error baja de 3.42 a
  2.94, que es el único que queda por debajo de 3:1.

## `@calumet/elise-ui` 0.5.1

### Corrige

- **`Button` con `asChild` fallaba siempre al renderizar.** El estado de carga
  emitía dos hijos, el hueco del spinner y el contenido, con un `null` en medio
  cuando no había carga. `Slot` de Radix cuenta ese `null` como un hijo más y su
  `Children.only` rechaza el conjunto, así que cualquier `<Button asChild>`
  reventaba. Nadie lo usaba dentro del repo, así que el camino no se había
  ejecutado nunca. Ahora las dos capas van dentro de una sola expresión y, sin
  carga, el hijo pasa solo.

- **Los iconos dentro de `Button` no llevaban tamaño acotado.** Los de Lucide
  vienen a 24px y al lado de un rótulo de 13–14px se leen como otra jerarquía.
  Se agrega la regla que ya llevaban `Badge`, `Alert`, `DropdownMenu`, `Command`
  y `Sidebar`: `[&_svg:not([class*='size-'])]:size-4`. El `:not` deja pasar un
  tamaño explícito para quien lo necesite.

## `@calumet/elise-ui` 0.5.0

### Rompe

- **La tarjeta pasa a 16px de relleno y 12px entre su cabecera y su cuerpo.**
  Antes eran 24 y 24. Los 12px son los que `FormRow`, `RadioGroup` y
  `CheckboxGroup` ya usan entre campos, así que una tarjeta de formulario queda
  con un solo ritmo vertical. Alcanza a `Card`, `Section` y a todo lo que se
  apoye en ellos. Una pantalla que compensara el relleno viejo con márgenes
  propios queda apretada.

### Agrega

- **`Clickable`.** Una caja entera que se pulsa, con lo mismo que acepta `Box`.
  Con `href` sale un `<a>` y sin él un `<button>`.
- **`Image` y `Thumbnail`.** La imagen exige `alt`, difiere la carga y reserva
  el hueco con `aspectRatio`. La miniatura es cuadrada en 24, 40, 60 y 80.
- **`Section`.** Un grupo con rótulo, como `<section>` con nombre accesible.
  Es el envoltorio opinado sobre `Card`.
- **`CheckboxGroup`.** El rótulo, la ayuda y el error de un grupo de casillas.
- **`ButtonGroup`**, con `attached` para juntar los botones en una pieza.
- **`List` y `ListItem`**, con marcador y sangría propios.
- **`Table` gana `empty`**, lo que ocupa el sitio de las filas cuando no hay
  ninguna. La barra de filtros se queda en pie y la franja de paginar no se
  pinta.
- **`Button` gana `size="icon-sm"`**, el cuadrado de 32px que iguala el alto de
  `sm`.
- **`Card` y `CardTitle` ganan `as`**, para que una tarjeta pueda salir como
  `<section>` con su `<h2>`.

### Arregla

- **La tarjeta y la tabla tenían contornos distintos.** La tabla usaba el bisel
  de cuatro capas y la tarjeta un borde plano con `shadow-sm`. Las dos comparten
  ahora `SUPERFICIE`, que se muda a `lib`.
- **El cuerpo del `Alert` partía las frases.** Era una columna flex, así que un
  texto con un enlace dentro salía en un renglón por trozo.
- **La cabecera de la tarjeta dejaba una fila vacía.** Declaraba dos filas
  siempre, así que una tarjeta con título y sin descripción sumaba el hueco de
  la fila que no existía debajo del rótulo.
- **`Section` con `padding="none"` reescribía el hueco de la tarjeta.** Fijaba
  el suyo en 16px, y con eso una sección sin relleno separaba distinto que una
  con relleno.

## `@calumet/elise-toasts` 0.3.0

### Rompe

- **`title` y `description` pasan a ser obligatorios en `toast()`.** El icono va
  en un disco de 28px y cada renglón de texto mide 20, así que un aviso de una
  sola línea dejaba el disco por debajo del titular. Un `toast({ title })` a
  secas deja de compilar.

  ```ts
  // antes
  toast({ title: "Guardado" });

  // ahora
  toast({ title: "Guardado", description: "Cambios sincronizados." });
  ```

No necesita nada nuevo de `@calumet/elise-ui`.

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
- **Cinco componentes no cabían en una columna estrecha** y su contenido se
  pintaba encima de lo de al lado. Los campos compuestos (`NumberField`,
  `SearchField`, `TimePicker`) no bajaban de 305px, porque el ancho por defecto
  de un `<input>` son veinte caracteres y ese era el mínimo de la caja entera.
  El `SegmentedControl` pedía la suma de sus rótulos, y siendo la pieza más
  ancha de una rejilla se llevaba consigo el ancho de todas las columnas; ahora
  sus opciones encogen. El `OTPField` se envuelve, el `Stepper` horizontal se
  desplaza, y la franja de paginar reparte en dos renglones antes de sacar el
  «filas por página» fuera de la tabla.

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
