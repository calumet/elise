export type EditorText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

export type EditorNode = {
  id: string;
  type: string;
  children: (EditorNode | EditorText)[];
  [key: string]: unknown;
};

export type EditorInline = EditorText | EditorNode;

export type Translation = string | EditorInline[];

export type EditorDocument = {
  version: 1;
  locale: string;
  content: EditorNode[];
  translations?: Record<string, Record<string, Translation>>;
};

export type EditorMark = "bold" | "italic" | "code";

export type EditorSchema = {
  name: string;
  blocks: readonly string[];
  marks: readonly EditorMark[];
  links: boolean;
};

export const isText = (node: EditorInline | EditorNode): node is EditorText => "text" in node;
