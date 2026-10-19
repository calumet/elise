import {
  Editor,
  pageSchema,
  useBlockCommands,
  useEditorCommands,
  useOutline,
  useOutlineDnd,
  useSelectedBlock,
  type EditorDocument,
  type EditorNode,
  type OutlineNode,
  type SettingValue,
} from "@calumet/elise-editor";
import { EditorContent, fromHtml, toHtml } from "@calumet/elise-editor/render";
import { BlockStack } from "@calumet/elise-ui/stack";
import { Text } from "@calumet/elise-ui/text";
import { useState } from "react";

const text = (id: string, type: string, content: string, extra = {}): EditorNode => ({
  id,
  type,
  ...extra,
  children: [{ text: content }],
});

const column = (id: string, ...children: EditorNode[]): EditorNode => ({
  id,
  type: "column",
  children,
});

const solid = (id: string, type: string, extra: Record<string, unknown>): EditorNode => ({
  id,
  type,
  ...extra,
  children: [{ text: "" }],
});

const photo = (hue: number): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 240;
  const brush = canvas.getContext("2d");
  if (brush) {
    brush.fillStyle = `hsl(${hue} 55% 40%)`;
    brush.fillRect(0, 0, 320, 240);
  }
  return canvas.toDataURL("image/png");
};

const createPage = (): EditorDocument => ({
  version: 1,
  locale: "en-US",
  content: [
    text("intro", "p", "Welcome to the page editor."),
    {
      id: "cols",
      type: "columns",
      ratio: "wide-first",
      gap: "medium",
      align: "top",
      background: "card",
      stack: true,
      children: [
        column(
          "c1",
          text("c1h", "h3", "Left column"),
          text("c1p", "p", "Text in the first column."),
        ),
        column("c2", text("c2p", "p", "Text in the second column.")),
      ],
    },
    solid("sp", "spacer", { size: "medium" }),
    solid("btn", "button", { label: "Apply now", href: "/apply", variant: "primary" }),
    solid("gal", "gallery", {
      images: [
        { src: photo(10), alt: "Red" },
        { src: photo(200), alt: "Blue" },
      ],
    }),
    solid("file", "file", { src: "/files/guide.pdf", name: "Guide.pdf", size: 204800 }),
    text("last", "p", "The end."),
  ],
});

const uploadImage = (file: File): Promise<{ src: string; alt?: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: String(reader.result) });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const uploadFile = (file: File): Promise<{ src: string; name: string; size?: number }> =>
  Promise.resolve({ src: `/files/${file.name}`, name: file.name, size: file.size });

const OutlineItem = ({
  node,
  selectedId,
  onSelect,
}: {
  node: OutlineNode;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) => {
  const { ref, isDragging, position } = useOutlineDnd(node.id);
  return (
    <li>
      <button
        ref={ref}
        type="button"
        data-testid={`outline-${node.id}`}
        data-type={node.type}
        data-drop={position ?? undefined}
        aria-current={node.id === selectedId || undefined}
        onClick={() => onSelect(node.id)}
        style={{
          paddingInlineStart: node.depth * 16,
          opacity: isDragging ? 0.4 : 1,
          fontWeight: node.id === selectedId ? 700 : 400,
          borderTop: position === "before" ? "2px solid" : undefined,
          borderBottom: position === "after" ? "2px solid" : undefined,
          outline: position === "inside" ? "2px solid" : undefined,
        }}
      >
        {node.label}
      </button>
      {node.children.length ? (
        <ul>
          {node.children.map((child) => (
            <OutlineItem key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

const Controls = () => {
  const commands = useEditorCommands();
  const blocks = useBlockCommands();
  const selected = useSelectedBlock();
  const outline = useOutline();

  return (
    <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
      <div data-testid="insert-bar" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {commands.items.map((item) => (
          <button key={item.id} type="button" onClick={() => commands.insert(item.id)}>
            {item.label}
          </button>
        ))}
        {commands.templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => commands.insertTemplate(template.id)}
          >
            {template.label}
          </button>
        ))}
        <label>
          File
          <input
            type="file"
            data-testid="file-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void commands.insertFile(file);
            }}
          />
        </label>
      </div>
      <ul data-testid="outline" style={{ listStyle: "none", padding: 0 }}>
        {outline.map((node) => (
          <OutlineItem
            key={node.id}
            node={node}
            selectedId={selected?.id}
            onSelect={blocks.select}
          />
        ))}
      </ul>
      <div data-testid="settings">
        {selected ? (
          <fieldset>
            <legend data-testid="selected-label">{selected.label}</legend>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => blocks.move(selected.id, "up")}
                disabled={!selected.canMoveUp}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => blocks.move(selected.id, "down")}
                disabled={!selected.canMoveDown}
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => blocks.duplicate(selected.id)}
                disabled={!selected.movable}
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => blocks.remove(selected.id)}
                disabled={!selected.movable}
              >
                Delete
              </button>
              {selected.parentId ? (
                <button type="button" onClick={() => blocks.selectParent()}>
                  Select parent
                </button>
              ) : null}
            </div>
            {selected.settings.map((field) => {
              const set = (value: SettingValue) =>
                blocks.update(selected.id, { [field.key]: value });
              if (field.kind === "select") {
                return (
                  <label key={field.key} style={{ display: "block" }}>
                    {field.label}
                    <select
                      data-testid={`setting-${field.key}`}
                      value={String(field.value)}
                      onChange={(event) => set(event.target.value)}
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              if (field.kind === "toggle") {
                return (
                  <label key={field.key} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      data-testid={`setting-${field.key}`}
                      checked={Boolean(field.value)}
                      onChange={(event) => set(event.target.checked)}
                    />
                    {field.label}
                  </label>
                );
              }
              if (field.kind === "number") {
                return (
                  <label key={field.key} style={{ display: "block" }}>
                    {field.label}
                    <input
                      type="number"
                      data-testid={`setting-${field.key}`}
                      min={field.min}
                      max={field.max}
                      value={Number(field.value)}
                      onChange={(event) => set(Number(event.target.value))}
                    />
                  </label>
                );
              }
              if (field.kind === "images") {
                const images = field.value as { src: string; alt: string }[];
                return (
                  <div key={field.key}>
                    {field.label}: {images.length}
                    <input
                      type="file"
                      accept="image/*"
                      data-testid="setting-images"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const uploaded = await commands.uploadImage(file);
                        set([...images, { src: uploaded.src, alt: file.name }]);
                      }}
                    />
                    <button type="button" onClick={() => set(images.slice(0, -1))}>
                      Remove last
                    </button>
                  </div>
                );
              }
              return (
                <label key={field.key} style={{ display: "block" }}>
                  {field.label}
                  <input
                    data-testid={`setting-${field.key}`}
                    defaultValue={String(field.value)}
                    key={`${selected.id}-${String(field.value)}`}
                    onBlur={(event) => set(event.target.value)}
                  />
                </label>
              );
            })}
          </fieldset>
        ) : (
          <Text size="sm" tone="muted">
            No block selected
          </Text>
        )}
      </div>
    </div>
  );
};

const PageEditorDemo = () => {
  const [page, setPage] = useState(createPage);
  const [showHtml, setShowHtml] = useState(false);
  const html = showHtml ? toHtml(page, { schema: pageSchema }) : "";

  return (
    <BlockStack gap={3}>
      <Text size="sm" weight="semibold">
        Page (0.2 core harness)
      </Text>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Editor.Root
          schema={pageSchema}
          value={page}
          onChange={setPage}
          onUploadImage={uploadImage}
          onUploadFile={uploadFile}
          className="contents"
        >
          <div data-testid="page-editor" style={{ paddingInlineStart: 32 }}>
            <Editor.Content aria-label="Page" className="min-h-40" />
          </div>
          <Controls />
        </Editor.Root>
      </div>
      <button type="button" data-testid="toggle-html" onClick={() => setShowHtml((v) => !v)}>
        {showHtml ? "Hide" : "Show"} HTML and render
      </button>
      {showHtml ? (
        <>
          <pre data-testid="html" style={{ whiteSpace: "pre-wrap", fontSize: 11 }}>
            {html}
          </pre>
          <div data-testid="roundtrip">
            {toHtml(fromHtml(html, { schema: pageSchema }), { schema: pageSchema }) === html
              ? "stable"
              : "unstable"}
          </div>
          <div data-testid="render">
            <EditorContent value={page} schema={pageSchema} />
          </div>
        </>
      ) : null}
    </BlockStack>
  );
};

export default PageEditorDemo;
