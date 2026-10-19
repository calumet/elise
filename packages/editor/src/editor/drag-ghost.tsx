import type { DragItemNode } from "@platejs/dnd";
import * as React from "react";
import { useDragLayer } from "react-dnd";
import { createPortal } from "react-dom";

import { renderBlocks } from "../render/content";
import type { EditorNode } from "../types";
import { contentClassName } from "../views";
import { useServices } from "./context";

const MAX_HEIGHT = 256;
const INSET = 12;
const EDGE = 8;

type Start = { width: number; height: number; grab: number };

const draggedElement = (item: DragItemNode | null): EditorNode | undefined =>
  item && "element" in item ? (item.element as EditorNode | undefined) : undefined;

const measureStart = (id: string, pointerY: number): Start | null => {
  const block = document.querySelector(`[data-block-id="${CSS.escape(id)}"]`);
  if (!block) return null;
  const rect = block.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    grab: Math.min(Math.max(pointerY - rect.top, 0), Math.min(rect.height, MAX_HEIGHT)),
  };
};

export const DragGhost = (): React.JSX.Element | null => {
  const { schema } = useServices();
  const { item, offset, startY, dragging } = useDragLayer((monitor) => ({
    item: monitor.getItem<DragItemNode | null>(),
    offset: monitor.getClientOffset(),
    startY: monitor.getInitialClientOffset()?.y,
    dragging: monitor.isDragging(),
  }));
  const element = draggedElement(item);
  const id = element?.id;
  const start = React.useMemo(
    () => (id && startY !== undefined ? measureStart(String(id), startY) : null),
    [id, startY],
  );
  if (!dragging || !offset || !element || !start) return null;
  const width = Math.min(start.width + INSET * 2, window.innerWidth - EDGE * 2);
  const left = Math.min(Math.max(offset.x + 16 - INSET, EDGE), window.innerWidth - width - EDGE);
  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-popover"
      style={{
        width,
        transform: `translate(${left}px, ${offset.y - start.grab - INSET}px)`,
      }}
    >
      <div
        className={`${contentClassName(schema)} relative max-h-64 scale-102 overflow-hidden rounded-xl border border-border bg-card p-3 opacity-90 shadow-xl transition-opacity duration-(--duration-fast) ease-out starting:opacity-0`}
      >
        {renderBlocks([element], schema)}
        {start.height > MAX_HEIGHT ? (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
