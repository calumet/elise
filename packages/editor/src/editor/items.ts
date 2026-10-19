import { toggleList } from "@platejs/list";
import { ElementApi, KEYS, NodeApi, PathApi, type TElement } from "platejs";
import type { PlateEditor } from "platejs/react";

import { newId } from "../ids";
import { useLabels } from "../labels";
import type { EditorSchema } from "../types";

export type InsertItemId =
  | "h2"
  | "h3"
  | "bulleted"
  | "numbered"
  | "quote"
  | "image"
  | "table"
  | "callout"
  | "divider"
  | "video";

export type InsertItem = {
  id: InsertItemId;
  block: string;
  label: string;
  keywords: string;
};

const paragraph = (): TElement => ({ id: newId(), type: KEYS.p, children: [{ text: "" }] });

export const placeBlock = (editor: PlateEditor, node: TElement, replace: boolean): void => {
  const entry = editor.selection
    ? editor.api.node([editor.selection.anchor.path[0] ?? 0])
    : undefined;
  const path = entry ? entry[1] : [editor.children.length];
  const empty = entry ? NodeApi.string(entry[0]) === "" && !entry[0].listStyleType : false;
  const at = replace && empty ? path : entry ? PathApi.next(path) : path;
  editor.tf.withoutNormalizing(() => {
    if (replace && empty) editor.tf.removeNodes({ at: path });
    editor.tf.insertNodes(node, { at });
  });
  const target = editor.api.node(at);
  const isVoid = target && ElementApi.isElement(target[0]) && editor.api.isVoid(target[0]);
  const next = isVoid && editor.api.node(PathApi.next(at)) ? PathApi.next(at) : at;
  editor.tf.select(editor.api.start(next) ?? undefined);
  editor.tf.focus();
};

const cell = (type: "td" | "th"): TElement => ({ id: newId(), type, children: [paragraph()] });

export const buildTable = (rows = 3, columns = 3): TElement => ({
  id: newId(),
  type: KEYS.table,
  children: Array.from({ length: rows }, (_, row) => ({
    id: newId(),
    type: KEYS.tr,
    children: Array.from({ length: columns }, () => cell(row === 0 ? "th" : "td")),
  })),
});

export const buildCallout = (): TElement => ({
  id: newId(),
  type: "callout",
  tone: "info",
  children: [paragraph()],
});

export const buildDivider = (): TElement => ({ id: newId(), type: "hr", children: [{ text: "" }] });

export const retype = (editor: PlateEditor, type: string): void => {
  editor.tf.setNodes({ type });
  editor.tf.focus();
};

export const setList = (editor: PlateEditor, style: "disc" | "decimal"): void => {
  toggleList(editor, { listStyleType: style });
  editor.tf.focus();
};

export const useInsertItems = (schema: EditorSchema): InsertItem[] => {
  const t = useLabels();
  const all: InsertItem[] = [
    { id: "h2", block: "h2", label: t.heading2, keywords: "heading title h2" },
    { id: "h3", block: "h3", label: t.heading3, keywords: "heading subtitle h3" },
    { id: "bulleted", block: "list", label: t.bulletedList, keywords: "list bullets ul" },
    { id: "numbered", block: "list", label: t.numberedList, keywords: "list numbers ol" },
    { id: "quote", block: "blockquote", label: t.quote, keywords: "quote blockquote cite" },
    { id: "image", block: "img", label: t.image, keywords: "image picture photo upload" },
    { id: "table", block: "table", label: t.table, keywords: "table grid rows columns" },
    { id: "callout", block: "callout", label: t.callout, keywords: "callout note alert info" },
    { id: "divider", block: "hr", label: t.divider, keywords: "divider rule line hr separator" },
    { id: "video", block: "media_embed", label: t.video, keywords: "video youtube vimeo embed" },
  ];
  return all.filter((item) => schema.blocks.includes(item.block));
};
