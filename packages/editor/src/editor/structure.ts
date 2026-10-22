import {
  ElementApi,
  KEYS,
  NodeApi,
  PathApi,
  type NodeEntry,
  type Path,
  type TElement,
  type TNode,
} from "platejs";
import type { PlateEditor } from "platejs/react";

import { newId } from "../ids";
import {
  COLUMN_LIMIT,
  coerceSetting,
  settingDefs,
  type SettingKey,
  type SettingValue,
} from "../settings";

export type DropPosition = "before" | "after" | "inside";

const FIXED = new Set(["column", "tr", "td", "th", "a"]);

const paragraph = (): TElement => ({ id: newId(), type: KEYS.p, children: [{ text: "" }] });

export const buildColumn = (children: TElement[] = [paragraph()]): TElement => ({
  id: newId(),
  type: "column",
  children,
});

export const lastIndex = (path: Path): number => path[path.length - 1] ?? 0;

export const blockEntry = (editor: PlateEditor, id: string): NodeEntry<TElement> | undefined =>
  editor.api.node<TElement>({ id, at: [] }) as NodeEntry<TElement> | undefined;

export const isColumns = (node: TNode | undefined): boolean =>
  ElementApi.isElement(node) && node.type === "columns";

export const unitPath = (editor: PlateEditor, path: Path): Path =>
  isColumns(editor.children[path[0] ?? 0]) && path.length >= 3
    ? path.slice(0, 3)
    : path.slice(0, 1);

export const isMovable = (node: TElement | undefined): boolean =>
  Boolean(node && !FIXED.has(String(node.type)));

const destination = (
  editor: PlateEditor,
  from: Path,
  target: Path,
  position: DropPosition,
): Path | null => {
  const dragged = NodeApi.get<TElement>(editor, from);
  const anchor = NodeApi.get<TElement>(editor, target);
  if (!isMovable(dragged) || !anchor) return null;
  if (PathApi.equals(from, target) || PathApi.isAncestor(from, target)) return null;

  let to: Path;
  if (position === "inside") {
    if (anchor.type !== "column") return null;
    const same = PathApi.equals(PathApi.parent(from), target);
    to = [...target, anchor.children.length - (same ? 1 : 0)];
  } else {
    if (anchor.type === "column" || FIXED.has(String(anchor.type))) return null;
    const parent = PathApi.parent(target);
    const holder = parent.length ? NodeApi.get<TElement>(editor, parent) : undefined;
    if (parent.length && holder?.type !== "column") return null;
    let slot = lastIndex(target) + (position === "after" ? 1 : 0);
    if (PathApi.isSibling(from, target) && lastIndex(from) < slot) slot -= 1;
    to = [...parent, slot];
  }

  const parent = to.slice(0, -1);
  const holder = parent.length ? NodeApi.get<TElement>(editor, parent) : undefined;
  if (dragged?.type === "columns" && holder?.type === "column") return null;
  return PathApi.equals(to, from) ? null : to;
};

export const canMoveBlock = (
  editor: PlateEditor,
  id: string,
  targetId: string,
  position: DropPosition,
): boolean => {
  const from = blockEntry(editor, id);
  const target = blockEntry(editor, targetId);
  return Boolean(from && target && destination(editor, from[1], target[1], position));
};

export const moveBlock = (
  editor: PlateEditor,
  id: string,
  targetId: string,
  position: DropPosition,
): boolean => {
  const from = blockEntry(editor, id);
  const target = blockEntry(editor, targetId);
  const to = from && target && destination(editor, from[1], target[1], position);
  if (!from || !to) return false;
  editor.tf.moveNodes({ at: from[1], to });
  return true;
};

export const siblingTarget = (
  editor: PlateEditor,
  id: string,
  direction: "up" | "down",
): { id: string; position: DropPosition } | null => {
  const entry = blockEntry(editor, id);
  if (!entry || !isMovable(entry[0])) return null;
  const path = direction === "up" ? PathApi.previous(entry[1]) : PathApi.next(entry[1]);
  const sibling =
    path && NodeApi.has(editor, path) ? NodeApi.get<TElement>(editor, path) : undefined;
  return sibling?.id
    ? { id: String(sibling.id), position: direction === "up" ? "before" : "after" }
    : null;
};

const reId = (node: TElement): TElement => ({
  ...node,
  id: newId(),
  children: node.children.map((child) => (ElementApi.isElement(child) ? reId(child) : child)),
});

export const duplicateBlock = (editor: PlateEditor, id: string): string | null => {
  const entry = blockEntry(editor, id);
  if (!entry || !isMovable(entry[0])) return null;
  const copy = reId(entry[0]);
  editor.tf.insertNodes(copy, { at: PathApi.next(entry[1]) });
  return String(copy.id);
};

export const removeBlock = (editor: PlateEditor, id: string): boolean => {
  const entry = blockEntry(editor, id);
  if (!entry || !isMovable(entry[0])) return false;
  editor.tf.removeNodes({ at: entry[1] });
  return true;
};

const isBlank = (column: TElement): boolean =>
  column.children.length === 1 &&
  ElementApi.isElement(column.children[0]) &&
  NodeApi.string(column) === "" &&
  column.children[0].type === KEYS.p;

export const setColumnCount = (editor: PlateEditor, path: Path, count: number): void => {
  const columns = NodeApi.get<TElement>(editor, path);
  if (!columns) return;
  const target = Math.min(Math.max(count, 1), COLUMN_LIMIT);
  const current = columns.children as TElement[];
  editor.tf.withoutNormalizing(() => {
    if (target > current.length) {
      for (let at = current.length; at < target; at += 1) {
        editor.tf.insertNodes(buildColumn(), { at: [...path, at] });
      }
      return;
    }
    const keep = current[target - 1]!;
    const moved = current
      .slice(target)
      .filter((column) => !isBlank(column))
      .flatMap((column) => column.children as TElement[]);
    for (let at = current.length - 1; at >= target; at -= 1) {
      editor.tf.removeNodes({ at: [...path, at] });
    }
    if (moved.length === 0) return;
    const keepPath = [...path, target - 1];
    if (isBlank(keep)) editor.tf.removeNodes({ at: [...keepPath, 0] });
    editor.tf.insertNodes(moved, { at: [...keepPath, isBlank(keep) ? 0 : keep.children.length] });
  });
};

export const applySettings = (
  editor: PlateEditor,
  id: string,
  patch: Record<string, SettingValue>,
): boolean => {
  const entry = blockEntry(editor, id);
  if (!entry) return false;
  const defs = settingDefs(String(entry[0].type));
  const props: Record<string, SettingValue> = {};
  let complete = true;
  let count: number | undefined;
  const byKey = new Map(defs.map((candidate) => [candidate.key, candidate]));
  for (const [key, raw] of Object.entries(patch)) {
    const def = byKey.get(key as SettingKey);
    const value = def && coerceSetting(def, raw);
    if (!def || value === undefined) {
      complete = false;
    } else if (def.key === "count") {
      count = Number(value);
    } else {
      props[key] = value;
    }
  }
  editor.tf.withoutNormalizing(() => {
    if (Object.keys(props).length) editor.tf.setNodes(props, { at: entry[1] });
    if (count !== undefined) setColumnCount(editor, entry[1], count);
  });
  return complete;
};

export const normalizeColumnNode = (editor: PlateEditor, [node, path]: NodeEntry): boolean => {
  if (!ElementApi.isElement(node)) return false;

  if (node.type === "columns") {
    if (path.length > 1) {
      editor.tf.unwrapNodes({ at: path });
      return true;
    }
    const stray = node.children.findIndex(
      (child) => !ElementApi.isElement(child) || child.type !== "column",
    );
    if (stray >= 0) {
      editor.tf.wrapNodes(buildColumn([]), { at: [...path, stray] });
      return true;
    }
    if (node.children.length === 0) {
      editor.tf.removeNodes({ at: path });
      return true;
    }
    if (node.children.length > COLUMN_LIMIT) {
      const overflow = node.children[COLUMN_LIMIT] as TElement;
      const into = [...path, COLUMN_LIMIT - 1];
      const size = (node.children[COLUMN_LIMIT - 1] as TElement).children.length;
      editor.tf.withoutNormalizing(() => {
        editor.tf.insertNodes(overflow.children as TElement[], { at: [...into, size] });
        editor.tf.removeNodes({ at: [...path, COLUMN_LIMIT] });
      });
      return true;
    }
    const clean: Record<string, SettingValue> = {};
    let dirty = false;
    for (const def of settingDefs("columns")) {
      if (def.key === "count") continue;
      const value = coerceSetting(def, node[def.key]);
      if (value !== undefined && value === node[def.key]) continue;
      clean[def.key] = value ?? def.default;
      dirty = true;
    }
    if (dirty) {
      editor.tf.setNodes(clean, { at: path });
      return true;
    }
    if (node.count !== undefined) {
      editor.tf.unsetNodes("count", { at: path });
      return true;
    }
    return false;
  }

  if (node.type === "column") {
    const parent =
      path.length > 1 ? NodeApi.get<TElement>(editor, PathApi.parent(path)) : undefined;
    if (parent?.type !== "columns") {
      editor.tf.unwrapNodes({ at: path });
      return true;
    }
    if (node.children.length === 0) {
      editor.tf.insertNodes(paragraph(), { at: [...path, 0] });
      return true;
    }
  }
  return false;
};
