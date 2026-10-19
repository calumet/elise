import {
  createDocument,
  documentSchema,
  Editor,
  messageSchema,
  useEditorCommands,
  useMarkActive,
} from "@calumet/elise-editor";
import type { EditorDocument, EditorSchema, SlashMenuState } from "@calumet/elise-editor";
import { EditorContent, fromHtml, toHtml } from "@calumet/elise-editor/render";
import { useMemo, useState } from "react";

const readFile = (file: File) =>
  new Promise<{ src: string; alt?: string }>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: String(reader.result), alt: file.name });
    reader.readAsDataURL(file);
  });

const Bar = () => {
  const commands = useEditorCommands();
  const bold = useMarkActive("bold");
  return (
    <div data-testid="bar" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      <button
        type="button"
        aria-pressed={bold}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => commands.toggleMark("bold")}
      >
        bold
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => commands.toggleMark("italic")}
      >
        italic
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => commands.setLink("https://calumet.dev")}
      >
        link
      </button>
      {commands.items.map((item) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (item.id === "video")
              commands.insertVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            else if (item.id === "image") {
              void commands.insertImage(
                new File([new Uint8Array([137, 80])], "pixel.png", { type: "image/png" }),
                "A pixel",
              );
            } else commands.insert(item.id);
          }}
        >
          {item.id}
        </button>
      ))}
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => commands.undo()}>
        undo
      </button>
    </div>
  );
};

const Slash = ({ menu }: { menu: SlashMenuState }) =>
  menu.open ? (
    <ul data-testid="slash">
      {menu.matches.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            aria-pressed={index === menu.active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => menu.pick(index)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  ) : null;

const Harness = ({
  title,
  schema,
  upload,
}: {
  title: string;
  schema: EditorSchema;
  upload: boolean;
}) => {
  const [value, setValue] = useState<EditorDocument>(() => createDocument("es-CO"));
  const html = useMemo(() => toHtml(value, { schema }), [value, schema]);
  const stable = useMemo(
    () => toHtml(fromHtml(html, { schema }), { schema }) === html,
    [html, schema],
  );

  return (
    <section>
      <h3>{title}</h3>
      <Editor.Root
        schema={schema}
        value={value}
        onChange={setValue}
        onUploadImage={upload ? readFile : undefined}
      >
        <Bar />
        <Editor.Content renderSlashMenu={(menu) => <Slash menu={menu} />} />
      </Editor.Root>
      <p data-testid="roundtrip">{stable ? "stable" : "mismatch"}</p>
      <div data-testid="rendered">
        <EditorContent value={value} schema={schema} />
      </div>
      <pre data-testid="html" style={{ whiteSpace: "pre-wrap" }}>
        {html}
      </pre>
    </section>
  );
};

const EditorDemo = () => (
  <div>
    <Harness title="messageSchema" schema={messageSchema} upload={false} />
    <Harness title="documentSchema" schema={documentSchema} upload />
  </div>
);

export default EditorDemo;
