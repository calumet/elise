import type { TRange } from "platejs";
import type { PlateEditor } from "platejs/react";

export type Measurable = { getBoundingClientRect: () => DOMRect };

const measure = (read: () => DOMRect | undefined): Measurable => ({
  getBoundingClientRect: () => {
    try {
      return read() ?? new DOMRect();
    } catch {
      return new DOMRect();
    }
  },
});

export const rangeAnchor = (editor: PlateEditor, range: TRange): Measurable =>
  measure(() => editor.api.toDOMRange(range)?.getBoundingClientRect());

export const blockAnchor = (editor: PlateEditor, path: number[]): Measurable =>
  measure(() => {
    const entry = editor.api.node(path);
    return entry ? editor.api.toDOMNode(entry[0])?.getBoundingClientRect() : undefined;
  });
