import { toggleList } from "@platejs/list";
import { ElementApi, KEYS, NodeApi, PathApi, type Path, type TElement } from "platejs";
import type { PlateEditor } from "platejs/react";

import { newId } from "../ids";
import { useLabels } from "../labels";
import { blockSettings } from "../settings";
import type { EditorSchema } from "../types";
import { buildColumn, unitPath } from "./structure";

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
  | "video"
  | "columns"
  | "spacer"
  | "button"
  | "gallery"
  | "file";

export type InsertItem = {
  id: InsertItemId;
  block: string;
  label: string;
  keywords: string;
};

const paragraph = (): TElement => ({ id: newId(), type: KEYS.p, children: [{ text: "" }] });

export const placeBlock = (
  editor: PlateEditor,
  placed: TElement | TElement[],
  replace: boolean,
): void => {
  const nodes = Array.isArray(placed) ? placed : [placed];
  const anchor = editor.selection?.anchor.path;
  const entry = anchor
    ? editor.api.node(
        nodes.some((item) => item.type === "columns")
          ? anchor.slice(0, 1)
          : unitPath(editor, anchor),
      )
    : undefined;
  const path = entry ? entry[1] : [editor.children.length];
  const empty = entry
    ? entry[0].type === KEYS.p && NodeApi.string(entry[0]) === "" && !entry[0].listStyleType
    : false;
  const at = replace && empty ? path : entry ? PathApi.next(path) : path;
  editor.tf.withoutNormalizing(() => {
    if (replace && empty) editor.tf.removeNodes({ at: path });
    editor.tf.insertNodes(nodes, { at });
  });
  const target = editor.api.node(at);
  const isVoid = target && ElementApi.isElement(target[0]) && editor.api.isVoid(target[0]);
  const next = isVoid && editor.api.node(PathApi.next(at)) ? PathApi.next(at) : at;
  editor.tf.select(editor.api.start(next) ?? undefined);
  editor.tf.focus();
};

export const insertLine = (editor: PlateEditor, at: Path, text = ""): void => {
  editor.tf.insertNodes({ ...paragraph(), children: [{ text }] }, { at });
  editor.tf.select(editor.api.end(at));
  editor.tf.focus();
};

export const openLine = (editor: PlateEditor): void => {
  const anchor = editor.selection?.anchor.path;
  const entry = anchor ? editor.api.node<TElement>(unitPath(editor, anchor)) : undefined;
  if (!entry) {
    insertLine(editor, [editor.children.length]);
    return;
  }
  const [node, path] = entry;
  if (node.type === KEYS.p && !node.listStyleType && NodeApi.string(node) === "") {
    editor.tf.select(editor.api.start(path) ?? undefined);
    editor.tf.focus();
    return;
  }
  insertLine(editor, PathApi.next(path));
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

const defaults = (type: string): Record<string, unknown> =>
  Object.fromEntries(
    (blockSettings[type] ?? [])
      .filter((def) => def.key !== "count")
      .map((def) => [def.key, def.default]),
  );

export const buildColumns = (count = 2, extra: Record<string, unknown> = {}): TElement => ({
  id: newId(),
  type: "columns",
  ...defaults("columns"),
  ...extra,
  children: Array.from({ length: count }, () => buildColumn()),
});

export const buildSpacer = (): TElement => ({
  id: newId(),
  type: "spacer",
  ...defaults("spacer"),
  children: [{ text: "" }],
});

export const buildButton = (label: string): TElement => ({
  id: newId(),
  type: "button",
  ...defaults("button"),
  label,
  children: [{ text: "" }],
});

export const buildGallery = (images: { src: string; alt: string }[] = []): TElement => ({
  id: newId(),
  type: "gallery",
  images,
  children: [{ text: "" }],
});

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
    {
      id: "columns",
      block: "columns",
      label: t.columns,
      keywords: "columns layout side by side grid",
    },
    { id: "spacer", block: "spacer", label: t.spacer, keywords: "spacer space gap empty" },
    {
      id: "button",
      block: "button",
      label: t.buttonBlock,
      keywords: "button link call to action cta",
    },
    {
      id: "gallery",
      block: "gallery",
      label: t.gallery,
      keywords: "gallery images photos pictures",
    },
    { id: "file", block: "file", label: t.file, keywords: "file download attachment document pdf" },
  ];
  const allowed = new Set(schema.blocks);
  return all.filter((item) => allowed.has(item.block));
};
