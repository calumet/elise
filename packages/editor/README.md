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

`pageSchema` llega en 0.2.

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

## Render

`@calumet/elise-editor/render` no importa el runtime de edición, así que una noticia renderizada en el servidor no carga Plate.

```tsx
import { EditorContent, toHtml, fromHtml } from "@calumet/elise-editor/render";

<EditorContent value={doc} schema={documentSchema} locale="en-US" />;
const html = toHtml(doc, { schema: documentSchema, locale: "en-US" });
const copia = fromHtml(html, { schema: documentSchema });
```

Una traducción que falte cae al idioma base del documento. `fromHtml` usa `DOMParser`, así que corre en el navegador o con jsdom.

## Textos

Todos los textos de la interfaz, rótulos accesibles y mensajes de error incluidos, salen del namespace `editor` de `@calumet/elise-i18n` con su valor por defecto en inglés. Las keys y esos valores están en `src/labels.ts`.
