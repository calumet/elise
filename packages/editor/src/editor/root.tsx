import { Plate, usePlateEditor } from "platejs/react";
import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { newId } from "../ids";
import type { EditorDocument, EditorNode, EditorSchema } from "../types";
import { components } from "./components";
import { ServicesProvider, type EditorServices } from "./context";
import { buildPlugins } from "./plugins";

export type EditorRootProps = Omit<EditorServices, "schema"> & {
  schema: EditorSchema;
  value: EditorDocument;
  onChange: (value: EditorDocument) => void;
  className?: string;
  children?: React.ReactNode;
};

export const createDocument = (locale: string): EditorDocument => ({
  version: 1,
  locale,
  content: [{ id: newId(), type: "p", children: [{ text: "" }] }],
});

export const EditorRoot = ({
  schema,
  value,
  onChange,
  locales,
  onUploadImage,
  onUploadFile,
  searchLinks,
  className,
  children,
}: EditorRootProps): React.JSX.Element => {
  const plugins = React.useMemo(() => buildPlugins(schema), [schema]);
  const editor = usePlateEditor(
    {
      plugins,
      components: components as never,
      value: value.content as never,
      shouldNormalizeEditor: true,
    },
    [plugins],
  );
  const latest = React.useRef(value);
  React.useEffect(() => {
    latest.current = value;
  });
  const emitted = React.useRef<EditorNode[]>(value.content);

  React.useEffect(() => {
    if (value.content !== emitted.current) {
      emitted.current = value.content;
      editor.tf.setValue(value.content as never);
    }
  }, [value.content, editor]);

  const services = React.useMemo(
    () => ({ schema, locales, onUploadImage, onUploadFile, searchLinks }),
    [schema, locales, onUploadImage, onUploadFile, searchLinks],
  );

  const body = (
    <Plate
      editor={editor}
      onValueChange={({ value: next }) => {
        emitted.current = next as unknown as EditorNode[];
        onChange({ ...latest.current, content: emitted.current });
      }}
    >
      <div data-slot="editor" className={className}>
        {children}
      </div>
    </Plate>
  );

  return (
    <ServicesProvider value={services}>
      {schema.blocks.includes("columns") ? (
        <DndProvider backend={HTML5Backend}>{body}</DndProvider>
      ) : (
        body
      )}
    </ServicesProvider>
  );
};
