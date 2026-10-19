import type { DragItemNode } from "@platejs/dnd";
import type { TElement } from "platejs";
import * as React from "react";
import { useDragLayer } from "react-dnd";
import { createPortal } from "react-dom";

import { useLabels } from "../labels";
import { nodeLabel } from "./blocks";
import { blockIcon } from "./icons";

const draggedElement = (item: DragItemNode | null): TElement | undefined =>
  item && "element" in item ? (item.element as TElement | undefined) : undefined;

export const DraggedBlock = ({ item }: { item: DragItemNode | null }): React.JSX.Element | null => {
  const t = useLabels();
  const element = draggedElement(item);
  if (!element) return null;
  const Icon = blockIcon(String(element.type));
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon aria-hidden="true" className="size-icon-md shrink-0" />
      <span className="truncate">{nodeLabel(t, element, 0)}</span>
    </span>
  );
};

export const DragChip = (): React.JSX.Element | null => {
  const { item, offset, dragging } = useDragLayer((monitor) => ({
    item: monitor.getItem<DragItemNode | null>(),
    offset: monitor.getClientOffset(),
    dragging: monitor.isDragging(),
  }));
  if (!dragging || !offset || !draggedElement(item)) return null;
  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-overlay"
      style={{ transform: `translate(${offset.x + 12}px, ${offset.y + 12}px)` }}
    >
      <div className="flex h-8 max-w-60 items-center rounded-md border border-border bg-popover px-3 text-sm font-medium text-popover-foreground shadow-lg">
        <DraggedBlock item={item} />
      </div>
    </div>,
    document.body,
  );
};
