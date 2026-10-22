import { Plate, usePlateEditor } from "platejs/react";
import * as React from "react";

import { newId } from "../ids";
import { reconcileTranslations, type Graveyard } from "../translations";
import type { EditorDocument, EditorNode, EditorSchema } from "../types";
import { components } from "./components";
import { ServicesProvider, type EditorServices } from "./context";
import { BlockDrag } from "./drag";
import { DocumentProvider, ModeProvider } from "./modes";
import { buildPlugins } from "./plugins";
import { PreviewProvider } from "./preview";

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
  const emit = React.useRef(onChange);
  React.useEffect(() => {
    latest.current = value;
    emit.current = onChange;
  });
  const emitted = React.useRef<EditorNode[]>(value.content);
  const graveyard = React.useRef<Graveyard>(new Map());
  const update = React.useCallback((change: (doc: EditorDocument) => EditorDocument) => {
    latest.current = change(latest.current);
    emit.current(latest.current);
  }, []);
  const access = React.useMemo(() => ({ value, update }), [value, update]);

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
    <div data-slot="editor" className={className}>
      {children}
    </div>
  );

  return (
    <ServicesProvider value={services}>
      <Plate
        editor={editor}
        onValueChange={({ value: next }) => {
          const content = next as unknown as EditorNode[];
          emitted.current = content;
          update((doc) => reconcileTranslations(doc, content, graveyard.current));
        }}
      >
        <DocumentProvider value={access}>
          <ModeProvider>
            <PreviewProvider locale={value.locale}>
              {schema.blocks.includes("columns") ? <BlockDrag>{body}</BlockDrag> : body}
            </PreviewProvider>
          </ModeProvider>
        </DocumentProvider>
      </Plate>
    </ServicesProvider>
  );
};
