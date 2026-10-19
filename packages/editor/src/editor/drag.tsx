import { GripVertical } from "@calumet/elise-icons";
import {
  DRAG_ITEM_BLOCK,
  getHoverDirection,
  onHoverNode,
  useDraggable,
  useDropLine,
  type DragItemNode,
} from "@platejs/dnd";
import type { TElement } from "platejs";
import { useEditorRef, type PlateEditor, type PlateElementProps } from "platejs/react";
import * as React from "react";
import { useDrag, useDrop } from "react-dnd";

import { useLabels } from "../labels";
import { selectBlockById } from "./selection";
import {
  blockEntry,
  canMoveBlock,
  isColumns,
  isMovable,
  moveBlock,
  type DropPosition,
} from "./structure";

const draggedId = (item: DragItemNode): string | undefined => {
  if (!("id" in item)) return undefined;
  return Array.isArray(item.id) ? item.id[0] : item.id;
};

const canDropNode = ({
  dragItem,
  dropEntry,
  editor,
}: {
  dragItem: DragItemNode;
  dropEntry: [TElement, number[]];
  editor: PlateEditor;
}): boolean => {
  const id = draggedId(dragItem);
  const target = String(dropEntry[0].id);
  return Boolean(
    id && (canMoveBlock(editor, id, target, "before") || canMoveBlock(editor, id, target, "after")),
  );
};

const Draggable = ({ editor, element, children }: PlateElementProps): React.JSX.Element => {
  const t = useLabels();
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const { dropLine } = useDropLine();
  const { handleRef, isDragging } = useDraggable({
    element,
    nodeRef,
    canDropNode: canDropNode as never,
    onDropHandler: (_editor, { id, dragItem, monitor }) => {
      if (monitor.didDrop()) return true;
      const dragged = draggedId(dragItem);
      const direction = getHoverDirection({
        dragItem,
        element: (blockEntry(editor as PlateEditor, id)?.[0] ?? element) as TElement,
        monitor,
        nodeRef,
      });
      if (dragged && direction) {
        moveBlock(editor as PlateEditor, dragged, id, direction === "top" ? "before" : "after");
      }
      return true;
    },
    drop: {
      hover: (dragItem, monitor) => {
        if (!monitor.isOver({ shallow: true })) return;
        onHoverNode(editor as PlateEditor, {
          canDropNode: canDropNode as never,
          dragItem,
          element,
          monitor,
          nodeRef,
        });
      },
    },
  });

  return (
    <div
      ref={nodeRef}
      data-slot="block"
      data-block-id={String(element.id)}
      data-dragging={isDragging || undefined}
      className="relative"
    >
      <div
        contentEditable={false}
        data-slot="block-handle"
        className="absolute start-0 top-0 -translate-x-full"
      >
        <button
          type="button"
          ref={handleRef as React.Ref<HTMLButtonElement>}
          aria-label={t.dragHandle}
          data-slot="drag-handle"
          className="cursor-grab"
          onClick={() => selectBlockById(editor as PlateEditor, String(element.id))}
        >
          <GripVertical aria-hidden="true" className="size-icon-md" />
        </button>
      </div>
      {children}
      {dropLine ? (
        <div
          contentEditable={false}
          data-slot="drop-line"
          data-position={dropLine}
          className={`pointer-events-none absolute inset-x-0 h-0.5 bg-primary ${dropLine === "top" ? "top-0" : "bottom-0"}`}
        />
      ) : null}
    </div>
  );
};

export const draggable = ({
  editor,
  element,
  path,
}: PlateElementProps): ((props: PlateElementProps) => React.ReactNode) | undefined => {
  if (editor.dom.readOnly || !isMovable(element as TElement)) return undefined;
  const root = path.length === 1;
  const inColumn = path.length === 3 && isColumns(editor.children[path[0] ?? 0]);
  return root || inColumn ? (props) => <Draggable {...props} /> : undefined;
};

export type OutlineDnd = {
  ref: (node: HTMLElement | null) => void;
  isDragging: boolean;
  isOver: boolean;
  position: DropPosition | null;
};

export const useOutlineDnd = (id: string): OutlineDnd => {
  const editor = useEditorRef();
  const node = React.useRef<HTMLElement | null>(null);
  const [position, setPosition] = React.useState<DropPosition | null>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DRAG_ITEM_BLOCK,
      canDrag: () => isMovable(blockEntry(editor, id)?.[0]),
      item: () => ({ id, editor, editorId: editor.id, element: blockEntry(editor, id)?.[0] }),
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [editor, id],
  );

  const pick = (item: DragItemNode, y: number | undefined): DropPosition | null => {
    const dragged = draggedId(item);
    const target = blockEntry(editor, id)?.[0];
    const rect = node.current?.getBoundingClientRect();
    if (!dragged || !target || !rect || y === undefined) return null;
    const choice: DropPosition =
      target.type === "column" ? "inside" : y < rect.top + rect.height / 2 ? "before" : "after";
    return canMoveBlock(editor, dragged, id, choice) ? choice : null;
  };

  const [{ isOver }, drop] = useDrop<DragItemNode, unknown, { isOver: boolean }>(
    () => ({
      accept: DRAG_ITEM_BLOCK,
      collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
      hover: (item: DragItemNode, monitor) => {
        const next = pick(item, monitor.getClientOffset()?.y);
        setPosition((current) => (current === next ? current : next));
      },
      drop: (item: DragItemNode, monitor) => {
        if (monitor.didDrop()) return;
        const dragged = draggedId(item);
        const choice = pick(item, monitor.getClientOffset()?.y);
        if (dragged && choice) moveBlock(editor, dragged, id, choice);
        setPosition(null);
        return { moved: Boolean(choice) };
      },
    }),
    [editor, id],
  );

  const ref = React.useCallback(
    (element: HTMLElement | null) => {
      node.current = element;
      drag(drop(element));
    },
    [drag, drop],
  );

  return { ref, isDragging, isOver, position: isOver ? position : null };
};
