import { deleteColumn, deleteRow, insertTableColumn, insertTableRow } from "@platejs/table";
import { ElementApi, type NodeEntry, type Path, type TElement } from "platejs";
import type { PlateEditor } from "platejs/react";

import { tableShape } from "../settings";
import type { EditorNode } from "../types";
import { blockEntry } from "./structure";

const sameList = (a: unknown, b: string[]): boolean =>
  Array.isArray(a) && a.length === b.length && a.every((item, index) => item === b[index]);

export const normalizeTableNode = (editor: PlateEditor, [node, path]: NodeEntry): boolean => {
  if (!ElementApi.isElement(node) || node.type !== "table") return false;
  const shape = tableShape(node as unknown as EditorNode);
  if (
    node.headerRow !== shape.headerRow ||
    node.headerColumn !== shape.headerColumn ||
    !sameList(node.columnAlign, shape.columnAlign)
  ) {
    editor.tf.setNodes(shape, { at: path });
    return true;
  }
  const rows = node.children as TElement[];
  for (const [rowIndex, row] of rows.entries()) {
    if (!ElementApi.isElement(row)) continue;
    for (const [cellIndex, cell] of (row.children as TElement[]).entries()) {
      if (!ElementApi.isElement(cell)) continue;
      const inHeaderRow = shape.headerRow && rowIndex === 0;
      const header = inHeaderRow || (shape.headerColumn && cellIndex === 0);
      const align = shape.columnAlign[cellIndex];
      const want = {
        type: header ? "th" : "td",
        scope: header ? (inHeaderRow ? "col" : "row") : undefined,
        align: align && align !== "left" ? align : undefined,
      };
      if (cell.type !== want.type || cell.scope !== want.scope || cell.align !== want.align) {
        editor.tf.setNodes(want, { at: [...path, rowIndex, cellIndex] });
        return true;
      }
    }
  }
  return false;
};

const tablePath = (editor: PlateEditor, id: string): Path | undefined =>
  blockEntry(editor, id)?.[1];

const intoCell = (editor: PlateEditor, cell: Path): void => {
  const start = editor.api.start(cell);
  if (start) editor.tf.select(start);
};

export const addTableRow = (
  editor: PlateEditor,
  id: string,
  row?: number,
  before = false,
): void => {
  const at = tablePath(editor, id);
  if (!at) return;
  if (row === undefined) insertTableRow(editor, { at, select: false });
  else insertTableRow(editor, { fromRow: [...at, row], before, select: false });
};

export const addTableColumn = (
  editor: PlateEditor,
  id: string,
  column?: number,
  before = false,
): void => {
  const at = tablePath(editor, id);
  const table = at ? editor.api.node<TElement>(at)?.[0] : undefined;
  const firstRow = table?.children[0] as TElement | undefined;
  if (!at || !firstRow) return;
  const index = column ?? firstRow.children.length - 1;
  insertTableColumn(editor, { fromCell: [...at, 0, index], before, select: false });
};

export const removeTableRow = (editor: PlateEditor, id: string, row: number): void => {
  const at = tablePath(editor, id);
  if (!at) return;
  intoCell(editor, [...at, row, 0]);
  deleteRow(editor);
};

export const removeTableColumn = (editor: PlateEditor, id: string, column: number): void => {
  const at = tablePath(editor, id);
  if (!at) return;
  intoCell(editor, [...at, 0, column]);
  deleteColumn(editor);
};
