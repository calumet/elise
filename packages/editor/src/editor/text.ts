import {
  ElementApi,
  KEYS,
  NodeApi,
  TextApi,
  type NodeEntry,
  type Path,
  type TElement,
  type TNode,
} from "platejs";
import type { PlateEditor } from "platejs/react";

import { newId } from "../ids";
import { lastIndex } from "./structure";

const LINES = new Set<string>([KEYS.p]);

export const isLine = (node: TNode | undefined): node is TElement =>
  ElementApi.isElement(node) && LINES.has(String(node.type));

export const isTextBlock = (node: TNode | undefined): node is TElement =>
  ElementApi.isElement(node) && node.type === "text";

export const buildText = (children: TElement[] = []): TElement => ({
  id: newId(),
  type: "text",
  children: children.length ? children : [{ id: newId(), type: KEYS.p, children: [{ text: "" }] }],
});

const holdsBlocks = (editor: PlateEditor, path: Path): boolean =>
  path.length === 0 || NodeApi.get<TElement>(editor, path)?.type === "column";

export const normalizeTextNode = (editor: PlateEditor, [node, path]: NodeEntry): boolean => {
  if (isTextBlock(node)) {
    if (!holdsBlocks(editor, path.slice(0, -1))) {
      editor.tf.unwrapNodes({ at: path });
      return true;
    }
    const index = node.children.findIndex((child) => !isLine(child));
    if (index < 0) return false;
    const child = node.children[index];
    if (TextApi.isText(child) || (ElementApi.isElement(child) && editor.api.isInline(child))) {
      editor.tf.wrapNodes({ id: newId(), type: KEYS.p, children: [] }, { at: [...path, index] });
    } else {
      editor.tf.liftNodes({ at: [...path, index] });
    }
    return true;
  }

  if (!isLine(node) || path.length === 0) return false;
  const parentPath = path.slice(0, -1);
  if (!holdsBlocks(editor, parentPath)) return false;
  const siblings =
    (parentPath.length ? NodeApi.get<TElement>(editor, parentPath)?.children : editor.children) ??
    [];
  let end = lastIndex(path);
  while (isLine(siblings[end + 1])) end += 1;
  const first = editor.api.start(path);
  const last = editor.api.end([...parentPath, end]);
  if (!first || !last) return false;
  editor.tf.wrapNodes(
    { id: newId(), type: "text", children: [] },
    { at: { anchor: first, focus: last }, match: (n, p) => p.length === path.length && isLine(n) },
  );
  return true;
};
