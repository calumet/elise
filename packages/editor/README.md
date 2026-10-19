# @calumet/elise-editor

Editor de texto enriquecido y de bloques sobre [Plate](https://platejs.org). Esta versión (0.1) trae el núcleo sin interfaz: el documento, los esquemas, el editor y sus comandos, y el render a HTML. La barra, el menú `/` y los diálogos se montan encima con componentes de Elise.

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

```tsx
import { Editor, createDocument, documentSchema } from "@calumet/elise-editor";

<Editor.Root
  schema={documentSchema}
  value={doc}
  onChange={setDoc}
  onUploadImage={subir}
  searchLinks={buscar}
>
  <Editor.Content renderSlashMenu={(menu) => <MiMenu menu={menu} />} />
</Editor.Root>;
```

Los comandos viven en `useEditorCommands()`, que se usa desde cualquier hijo de `Editor.Root`: `toggleMark`, `toggleList`, `toggleBlock`, `setLink`, `removeLink`, `insert`, `insertImage`, `insertVideo`, las acciones de tabla, `undo` y `redo`. `items` es la lista de bloques que el esquema permite insertar. Para el estado de los botones hay `useMarkActive`, `useBlockActive`, `useListActive`, `useInTable` y `useLinkUrl`.

Los elementos del editor y del render salen de un solo archivo, `src/views.tsx`.

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

Las etiquetas salen del namespace `editor` de `@calumet/elise-i18n` con su valor por defecto en inglés: `bulletedList`, `numberedList`, `heading2`, `heading3`, `quote`, `image`, `table`, `callout`, `divider`, `video`, `placeholderMessage` y `placeholderDocument`.
