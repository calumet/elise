import type { TRange } from "platejs";
import type { PlateEditor } from "platejs/react";

export type Measurable = { getBoundingClientRect: () => DOMRect; contextElement?: Element };

const measure = (editor: PlateEditor, read: () => DOMRect | undefined): Measurable => ({
  getBoundingClientRect: () => {
    try {
      return read() ?? new DOMRect();
    } catch {
      return new DOMRect();
    }
  },
  get contextElement() {
    try {
      return editor.api.toDOMNode(editor) ?? undefined;
    } catch {
      return undefined;
    }
  },
});

export const rangeAnchor = (editor: PlateEditor, range: TRange): Measurable =>
  measure(editor, () => editor.api.toDOMRange(range)?.getBoundingClientRect());

export const blockAnchor = (editor: PlateEditor, path: number[]): Measurable =>
  measure(editor, () => {
    const entry = editor.api.node(path);
    return entry ? editor.api.toDOMNode(entry[0])?.getBoundingClientRect() : undefined;
  });
