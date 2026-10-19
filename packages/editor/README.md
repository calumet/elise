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

| Esquema          | Contenido                                                              |
| ---------------- | ---------------------------------------------------------------------- |
| `messageSchema`  | Párrafo, negrita, cursiva, enlace, listas e inline code                |
| `documentSchema` | Lo anterior, más h2, h3, cita, imagen, tabla, callout, divisor y video |
| `pageSchema`     | Lo anterior, más columnas, espacio, botón, galería y archivo           |

`pageSchema` es el de la página: `documentSchema` más columnas, espacio, botón, galería y archivo. Está en la sección de abajo.

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
| `columns` | De 1 a 4 `column`, con `ratio`, `gap`, `align`, `background` y `stack`. Un solo nivel de anidado |
| `spacer`  | `size`: `small`, `medium` o `large`                                                              |
| `button`  | `label`, `href`, `variant` (`primary` o `secondary`). Es un bloque vacío                         |
| `gallery` | `images`: lista de `{ src, alt }`                                                                |
| `file`    | `src`, `name` y `size` en bytes. Sube con `onUploadFile`                                         |

`onUploadFile?: (file: File) => Promise<{ src: string; name: string; size?: number }>` es la única prop nueva. `src` debe ser una dirección http(s) o relativa, porque `fromHtml` descarta las `data:` y `blob:` de los enlaces.

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
| `canMoveTo(id, destino, posición)` | Lo mismo sin mover, para pintar la línea de soltar                                    |

`useEditorCommands()` suma `insert` para `columns`, `spacer`, `button` y `gallery`, `insertFile(archivo)`, `uploadImage(archivo)` y `templates` con `insertTemplate(id)`.

### Estructura y arrastre

`useOutline()` devuelve el documento como árbol de `{ id, type, label, depth, children }` y se mantiene al día con cada cambio. Las columnas aparecen como `columns`, con sus `column` y los bloques de cada una; tablas, avisos y citas son una hoja. La etiqueta es el texto del bloque o, si no tiene, el nombre del tipo.

El arrastre usa `@platejs/dnd` sobre `react-dnd`. `Editor.Root` con `pageSchema` pone el `DndProvider` y cada bloque de la página, o de una columna, lleva un asa (`data-slot="drag-handle"`) y una línea de soltar (`data-slot="drop-line"`) sin estilo. `useOutlineDnd(id)` devuelve `{ ref, isDragging, isOver, position }` para que una fila del esquema arrastre y reciba bloques con el mismo backend, así un bloque va del esquema a la página y al revés.

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
| `div[data-slot=column]`  | `data-id`                                                                                                                                                                                                                                               |
| `div[data-slot=spacer]`  | `data-size` (`small`, `medium`, `large`), `aria-hidden`, `data-id`                                                                                                                                                                                      |
| `div[data-slot=button]`  | `data-id`, y dentro un `a` con `href` y `data-variant` (`primary`, `secondary`)                                                                                                                                                                         |
| `div[data-slot=gallery]` | `data-count`, `data-empty`, `data-id`, y dentro `div[data-slot=gallery-images]` con `img` (`src`, `alt`, `loading`)                                                                                                                                     |
| `div[data-slot=file]`    | `data-size` (bytes), `data-id`, y dentro un `a` con `href` y `download`, y `span[data-slot=file-size]`                                                                                                                                                  |

Con `data-stack="true"` las columnas se apilan por debajo de 40rem. `fromHtml` lee estos mismos atributos, así que el ida y vuelta de lo que produce `pageSchema` es estable.

## Textos

Todos los textos de la interfaz, rótulos accesibles y mensajes de error incluidos, salen del namespace `editor` de `@calumet/elise-i18n` con su valor por defecto en inglés. Las keys y esos valores están en `src/labels.ts`.
