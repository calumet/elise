# @calumet/elise-editor

Editor de texto enriquecido y de bloques sobre [Plate](https://platejs.org): el documento, los esquemas, el editor con su barra, el menú `/` y los diálogos hechos con componentes de Elise, y el render a HTML.

## Instalación

```bash
pnpm add jsr:@calumet/elise-editor    # JSR
pnpm add @calumet/elise-editor        # GitHub Packages
```

Requiere React 19. `@calumet/elise-ui` y `@calumet/elise-i18n` son peers (el segundo es opcional).

## Un documento, tres esquemas

Todo se guarda como un `EditorDocument`: un árbol de bloques, cada uno con un `id` estable.

```ts
type EditorDocument = {
  version: 1;
  locale: string;
  content: EditorNode[];
  translations?: Record<string, Record<string, Translation>>;
};
```

El esquema decide qué se puede insertar, qué ofrece el menú `/`, qué acepta el pegado y qué HTML sale. Lo que quede fuera se descarta al pegar y en `fromHtml`.

| Esquema          | Contenido                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `messageSchema`  | Párrafo, negrita, cursiva, enlace, listas e inline code                                                                      |
| `documentSchema` | Lo anterior, más h2, h3, cita, imagen, tabla, callout, divisor y video                                                       |
| `pageSchema`     | Bloques de texto, título, subtítulo, cita, imagen, galería, video, tabla, aviso, botón, archivo, divisor, espacio y columnas |

`pageSchema` es el de la página: en lugar de un solo documento, una lista de bloques. El texto va dentro de bloques de texto. Está en la sección de abajo.

## Editor

`Editor` es la composición lista para usar. Con `messageSchema` sale el compositor de mensajes: una caja con la fila de iconos debajo. Con `documentSchema`, la hoja con la barra flotante sobre la selección, el menú `/` y el botón `+` al margen de la línea vacía.

```tsx
import { Editor, documentSchema } from "@calumet/elise-editor";

<Editor
  schema={documentSchema}
  value={doc}
  onChange={setDoc}
  onUploadImage={subir}
  searchLinks={buscar}
  aria-label="Contenido de la página"
/>;
```

Para otra disposición están las piezas: `Editor.Root`, `Editor.Toolbar` y `Editor.Content`. `Editor.Content` trae el menú `/` y los diálogos de imagen y video; `renderSlashMenu` lo cambia por uno propio.

```tsx
<Editor.Root schema={documentSchema} value={doc} onChange={setDoc}>
  <Editor.Toolbar />
  <Editor.Content />
</Editor.Root>
```

Con el teclado: Alt+F10 lleva a la barra, Mod+K abre el enlace sobre la selección, y en el menú `/` las flechas recorren, Intro inserta y Esc cierra. El diálogo de enlace busca páginas con `searchLinks` o acepta una dirección, y puede abrirla en otra pestaña.

Los comandos viven en `useEditorCommands()`, que se usa desde cualquier hijo de `Editor.Root`: `toggleMark`, `toggleList`, `toggleBlock`, `setLink`, `removeLink`, `insert`, `insertImage`, `insertVideo`, las acciones de tabla, `undo` y `redo`. `setLink(url, texto, otraPestaña)` guarda `target="_blank"` en el enlace. `items` es la lista de bloques que el esquema permite insertar. Para el estado de los botones hay `useMarkActive`, `useBlockActive`, `useListActive`, `useInTable` y `useLinkUrl`.

Los elementos del editor y del render salen de un solo archivo, `src/views.tsx`, así que lo que se edita y lo que se lee se ven igual.

## La página

Con `pageSchema` el editor suma estos bloques. Cada uno declara los ajustes que se pueden editar, así que un panel genérico los pinta sin conocer el bloque.

| Bloque    | Guarda                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------ |
| `text`    | Párrafos y listas, con su fila de formato: negrita, cursiva, código, enlace y las dos listas     |
| `columns` | De 1 a 4 `column`, con `ratio`, `gap`, `align`, `background` y `stack`. Un solo nivel de anidado |
| `spacer`  | `size`: `small`, `medium` o `large`                                                              |
| `button`  | `label`, `href`, `variant` (`primary` o `secondary`). Es un bloque vacío                         |
| `gallery` | `images`: lista de `{ src, alt }`                                                                |
| `file`    | `src`, `name` y `size` en bytes. Sube con `onUploadFile`                                         |

`onUploadFile?: (file: File) => Promise<{ src: string; name: string; size?: number }>` es la única prop nueva. `src` debe ser una dirección http(s) o relativa, porque `fromHtml` descarta las `data:` y `blob:` de los enlaces.

Un bloque de texto es un editor como el de mensajes: con el bloque elegido aparece debajo del texto, dentro de su contorno, la fila de negrita, cursiva, código, enlace y las dos listas, que se abre y se cierra deslizando lo de abajo (con movimiento reducido solo se desvanece), y la barra flotante no sale dentro de él. Intro sigue dentro del bloque, y en la estructura y al arrastrar es una sola fila con su primera línea por nombre. Título, subtítulo y cita son bloques propios: un párrafo suelto en la página o en una columna se envuelve en un bloque de texto, y un título o una cita dentro de uno sale de él y lo parte en dos. En un bloque de texto con contenido el menú `/` ofrece las listas, título, subtítulo y cita, que sacan la línea a su propio bloque; en uno vacío ofrece todos los bloques, que lo reemplazan. Con `documentSchema` o `messageSchema` el render deja su contenido suelto.

La imagen se elige y se previsualiza con `ImageUpload` de `elise-ui`, en el diálogo y en los ajustes del bloque, donde se reemplaza con `onUploadImage`. El esquema usa `SortableTree`, y por eso el peer `@calumet/elise-ui` pide `>=0.44.0`.

Las columnas no se rompen: una columna no puede quedar vacía ni contener otras columnas, más de cuatro se funden en la cuarta, y cambiar `count` reparte el contenido de las que sobran en la última que queda. Los valores fuera de lista vuelven al de por defecto.

### Ajustes de un bloque

`useSelectedBlock()` devuelve el bloque seleccionado, ya sea por selección de texto o elegido con `select`, con `settings` listos para pintar: cada campo trae `key`, `kind` (`select`, `toggle`, `number`, `text`, `url`, `video` o `images`), `label`, `value`, `default` y, según el tipo, `options` o `min` y `max`. Los rótulos salen del namespace `editor`.

`useBlockCommands()` actúa sobre un bloque por su `id`:

| Comando                            | Hace                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `select(id)`, `selectParent()`     | Selecciona un bloque, o las columnas que contienen al seleccionado                    |
| `update(id, { clave: valor })`     | Cambia ajustes. Devuelve `false` si algún valor no es válido y lo ignora              |
| `duplicate(id)`, `remove(id)`      | Duplica con ids nuevos, o elimina                                                     |
| `move(id, "up" \| "down")`         | Sube o baja entre hermanos, dentro de la misma columna o del documento                |
| `moveTo(id, destino, posición)`    | `before`, `after` o `inside` (solo sobre una `column`). Rechaza lo que anide columnas |
| `canMoveTo(id, destino, posición)` | Lo mismo sin mover, para pintar dónde caería                                          |
| `deselect()`                       | Deja la página sin bloque elegido, como al pulsar fuera de ella                       |

`useEditorCommands()` suma `insert` para `columns`, `spacer`, `button` y `gallery`, `insertFile(archivo)`, `uploadImage(archivo)` y `templates` con `insertTemplate(id)`.

### Estructura y arrastre

`useOutline()` devuelve el documento como árbol de `{ id, type, label, depth, children }` y se mantiene al día con cada cambio. Las columnas aparecen como `columns`, con sus `column` y los bloques de cada una; tablas, avisos y citas son una hoja. La etiqueta es el texto del bloque o, si no tiene, el nombre del tipo.

El arrastre usa `@dnd-kit/core`. `Editor.Root` con `pageSchema` pone el `DndContext` y cada bloque de la página, o de una columna, lleva al margen un asa (`data-slot="drag-handle"`) a la altura de su primera línea, lo único que inicia el arrastre, y debajo un `+` que abre el menú `/` debajo del bloque. Con las columnas elegidas, o con el puntero en su propio hueco, el asa de ese sitio es la de las columnas y las de los bloques de dentro se esconden. Al arrastrar no sale ninguna copia: el bloque mismo se mueve dentro de la página bajo el puntero (`data-dragging`), y los de alrededor se apartan para abrirle sitio donde caería, también dentro de una columna. Mientras se arrastra conserva su tamaño, y el hueco mide lo que medirá al ancho de su destino. El destino sale de la posición del puntero sobre la página tal como estaba al empezar, con un margen alrededor del borde de cada columna para que no salte de un lado a otro. Al soltar se asienta en su lugar y toma el ancho nuevo de forma animada, y con Escape o soltando fuera de la página vuelve al suyo. Con movimiento reducido no hay recorrido, solo el cambio de orden. El movimiento pasa por `moveTo`, así que se deshace como cualquier cambio. El bloque elegido lleva su contorno y el nombre del tipo, encima o debajo según haya sitio, y se esconde antes que pisar el contenido o mientras la barra flotante está abierta. Un bloque recién insertado queda elegido, con sus ajustes a la vista. El asa se aparta del texto `--editor-gutter` (0.75rem por defecto), para dejarla fuera de una hoja con menos margen. El esquema y la página se arrastran cada uno por su lado: un bloque no pasa de uno a otro. En `Editor.Outline` cada fila lleva el asa de `SortableTree`: se arrastra, o con el foco en ella espacio la levanta, las flechas arriba y abajo la mueven, las de los lados cambian su nivel y Escape cancela. Las filas de columna no se mueven, los bloques no admiten hijos y un bloque de columnas no entra en una columna. Cada movimiento pasa por `moveTo`.

### Los paneles

Tres piezas de `Editor` arman la pantalla del editor de páginas alrededor de `Editor.Content`. El marco, la barra y dónde va cada panel son de la aplicación.

| Pieza               | Qué es                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Editor.Outline`    | La estructura en un `SortableTree`, con la selección sincronizada con la página, arrastre y teclado                |
| `Editor.BlockPanel` | Los ajustes del bloque elegido, pintados según su tipo, más subir, bajar, mover a una columna, duplicar y eliminar |
| `Editor.Catalog`    | Bloques y plantillas con buscador. Dice dónde se añade lo nuevo. `onClose` pinta el botón de cerrar                |

```tsx
<Editor.Root
  schema={pageSchema}
  value={pagina}
  onChange={setPagina}
  className="flex min-h-0 flex-1"
>
  <aside aria-label="Estructura">
    <Editor.Outline />
  </aside>
  <Editor.Content aria-label="Contenido de la página" />
  <aside aria-label="Ajustes del bloque">
    <Editor.BlockPanel />
  </aside>
</Editor.Root>
```

`Editor.BlockPanel` pinta cada ajuste con el control que le toca: un `SegmentedControl` hasta cuatro opciones y un `Select` desde cinco, un interruptor para `toggle`, la proporción de las columnas con su dibujo, y las direcciones se validan al salir del campo. Arrastrar no es accesible por sí solo, así que todo lo que se mueve arrastrando se mueve también desde este panel.

### Vista previa

`Editor.Root` guarda si se está editando o viendo la página como la ve quien la visita. `useEditorPreview()` devuelve `{ previewing, preview, edit }`, y `Editor.PreviewButton` es el botón para la barra, con «Vista previa» y «Volver a editar» como textos. En la vista previa `Editor.Content` pinta la página con `EditorContent`, la misma salida que el render, y `Editor.Outline`, `Editor.BlockPanel`, `Editor.Catalog`, `Editor.Toolbar` y las barras flotantes no se pintan; lo que la aplicación ponga alrededor (paneles, la barra de bloques) lo esconde ella con `previewing`. Escape o el botón vuelven a editar con la selección que había. El cambio usa una transición de vista si el navegador la tiene, y con movimiento reducido solo un fundido.

Dentro de `Editor.Content` con `pageSchema`, las columnas se apilan cuando el área mide menos de 32rem, para que una vista previa del ancho de un móvil las muestre como en el teléfono.

### Tablas

Cada fila y cada columna tienen su asa con insertar antes, insertar después y eliminar; al insertar, el cursor va a la primera celda nueva y la tabla sigue elegida. Las asas aparecen al apuntar la fila o la columna, o con el cursor en una de sus celdas, y quedan dentro de la página a cualquier ancho. Con la tabla elegida, `Editor.BlockPanel` ofrece fila y columna de encabezado y la alineación de cada columna, más añadir fila y columna desde el teclado.

La tabla guarda `headerRow`, `headerColumn` y `columnAlign` (`left`, `center` o `right` por columna). La normalización deja las celdas de acuerdo con ellos: `th` con `scope="col"` en la fila de encabezado, `th` con `scope="row"` en la columna, y `align` en cada celda que no vaya a la izquierda. Unir celdas, el ancho de las columnas y elegir varias celdas a la vez quedan fuera.

### Plantillas

`commands.templates` lista las plantillas que el esquema permite: texto con imagen, equipo, preguntas y respuestas, y llamada a la acción. Al insertarlas son bloques ordinarios, no un nodo especial.

## Render

`@calumet/elise-editor/render` no importa el runtime de edición, así que una noticia renderizada en el servidor no carga Plate.

```tsx
import { EditorContent, toHtml, fromHtml } from "@calumet/elise-editor/render";

<EditorContent value={doc} schema={documentSchema} locale="en-US" />;
const html = toHtml(doc, { schema: documentSchema, locale: "en-US" });
const copia = fromHtml(html, { schema: documentSchema });
```

Una traducción que falte cae al idioma base del documento. `fromHtml` usa `DOMParser`, así que corre en el navegador o con jsdom.

### HTML de la página y sanitizado

El diseño de las columnas no depende de las clases: lo da `@calumet/elise-editor/tailwind.css` a partir de atributos `data-*`. Un sanitizador que quite `class` conserva el diseño si deja pasar estos atributos y elementos:

| Elemento                 | Atributos                                                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `div[data-slot=columns]` | `data-count` (1 a 4), `data-ratio` (`equal`, `wide-first`, `wide-second`), `data-gap` (`small`, `medium`, `large`), `data-align` (`top`, `center`, `bottom`), `data-background` (`none`, `card`, `featured`), `data-stack` (`true`, `false`), `data-id` |
| `div[data-slot=text]`    | `data-id`, y dentro `p`, `h2`, `h3`, `ul`, `ol`, `li` y `blockquote`                                                                                                                                                                                    |
| `div[data-slot=column]`  | `data-id`                                                                                                                                                                                                                                               |
| `div[data-slot=spacer]`  | `data-size` (`small`, `medium`, `large`), `aria-hidden`, `data-id`                                                                                                                                                                                      |
| `div[data-slot=button]`  | `data-id`, y dentro un `a` con `href` y `data-variant` (`primary`, `secondary`)                                                                                                                                                                         |
| `div[data-slot=gallery]` | `data-count`, `data-empty`, `data-id`, y dentro `div[data-slot=gallery-images]` con `img` (`src`, `alt`, `loading`)                                                                                                                                     |
| `div[data-slot=file]`    | `data-size` (bytes), `data-id`, y dentro un `a` con `href` y `download`, y `span[data-slot=file-size]`                                                                                                                                                  |
| `table`, `tr`            | `data-id`                                                                                                                                                                                                                                               |
| `th`, `td`               | `data-id`, `data-align` (`center`, `right`; sin él, a la izquierda), y en `th` `scope` (`col` en la fila de encabezado, `row` en la columna)                                                                                                            |

Con `data-stack="true"` las columnas se apilan por debajo de 40rem. `fromHtml` lee estos mismos atributos, así que el ida y vuelta de lo que produce `pageSchema` es estable.

## Textos

Todos los textos de la interfaz, rótulos accesibles y mensajes de error incluidos, salen del namespace `editor` de `@calumet/elise-i18n` con su valor por defecto en inglés. Las keys y esos valores están en `src/labels.ts`.
