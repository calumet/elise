import { Input } from "@calumet/elise-ui/input";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";
import * as React from "react";

import { isText } from "../types";
import type { EditorInline, EditorNode, EditorSchema, Translation } from "../types";
import { components } from "./components";
import { ServicesProvider, useServices } from "./context";
import { buildPlugins } from "./plugins";
import { FormatRow } from "./toolbar";

const FIELD =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:border-muted-foreground data-empty:border-dashed data-empty:bg-muted focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background data-empty:focus-within:border-solid data-empty:focus-within:bg-card";

const toInlines = (value: Translation | undefined): EditorInline[] =>
  value === undefined ? [{ text: "" }] : typeof value === "string" ? [{ text: value }] : value;

const joinLines = (nodes: EditorNode[]): EditorInline[] =>
  nodes.flatMap((node, index) => [...(index ? [{ text: "\n" }] : []), ...node.children]);

const blank = (inlines: EditorInline[]): boolean =>
  inlines.every((child) => (isText(child) ? child.text.trim() === "" : blank(child.children)));

type FieldProps = {
  value: Translation | undefined;
  formatted: boolean;
  heading: boolean;
  label: string;
  placeholder: string;
  onChange: (value: Translation | undefined) => void;
};

const RichField = ({
  value,
  formatted,
  heading,
  label,
  placeholder,
  onChange,
}: FieldProps): React.JSX.Element => {
  const parent = useServices();
  const schema = React.useMemo<EditorSchema>(
    () => ({
      name: "translation",
      blocks: ["p"],
      marks: parent.schema.marks,
      links: parent.schema.links,
    }),
    [parent.schema],
  );
  const services = React.useMemo(() => ({ ...parent, schema }), [parent, schema]);
  const plugins = React.useMemo(() => buildPlugins(schema), [schema]);
  const editor = usePlateEditor({
    plugins,
    components: components as never,
    value: [{ type: "p", children: toInlines(value) }] as never,
  });
  const [empty, setEmpty] = React.useState(() => blank(toInlines(value)));

  return (
    <ServicesProvider value={services}>
      <Plate
        editor={editor}
        onValueChange={({ value: next }) => {
          const inlines = joinLines(next as unknown as EditorNode[]);
          const nothing = blank(inlines);
          setEmpty(nothing);
          onChange(nothing ? undefined : inlines);
        }}
      >
        <div data-empty={empty || undefined} className={`group/field ${FIELD}`}>
          <PlateContent
            aria-label={label}
            placeholder={placeholder}
            renderPlaceholder={({ attributes, children }) => (
              <span
                {...attributes}
                style={{ ...attributes.style, opacity: 1 }}
                className="font-normal text-muted-foreground"
              >
                {children}
              </span>
            )}
            className={`min-w-0 break-words outline-none ${heading ? "font-semibold" : ""}`}
          />
          {formatted ? <FormatRow className="mt-1 hidden group-focus-within/field:flex" /> : null}
        </div>
      </Plate>
    </ServicesProvider>
  );
};

export const TranslationField = (props: FieldProps & { plain: boolean }): React.JSX.Element => {
  const { plain, value, label, placeholder, onChange } = props;
  const [draft, setDraft] = React.useState(typeof value === "string" ? value : "");
  if (!plain) return <RichField {...props} />;
  return (
    <Input
      dir="auto"
      aria-label={label}
      placeholder={placeholder}
      value={draft}
      data-empty={draft.trim() === "" || undefined}
      className="data-empty:border-dashed data-empty:bg-muted data-empty:focus-visible:border-solid data-empty:focus-visible:bg-card"
      onChange={(event) => {
        setDraft(event.target.value);
        onChange(event.target.value.trim() === "" ? undefined : event.target.value);
      }}
    />
  );
};
