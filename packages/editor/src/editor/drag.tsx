import { GripVertical, Plus } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import {
  DRAG_ITEM_BLOCK,
  getHoverDirection,
  onHoverNode,
  useDraggable,
  useDropLine,
  type DragItemNode,
} from "@platejs/dnd";
import { PathApi, type TElement } from "platejs";
import {
  useEditorRef,
  useEditorSelector,
  type PlateEditor,
  type PlateElementProps,
} from "platejs/react";
import * as React from "react";
import { useDrag, useDrop } from "react-dnd";

import { typeLabel, useLabels } from "../labels";
import { insertLine } from "./items";
import { selectBlockById, selectedId } from "./selection";
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

const BLOCK =
  "relative rounded-md outline-offset-8 data-dragging:opacity-50 data-selected:outline-2 data-selected:outline-primary [&:hover:not(:has([data-slot=block]:hover))>[data-slot=block-handle]]:opacity-100 [&[data-selected]>[data-slot=block-handle]]:opacity-100";
const HANDLE =
  "absolute -start-3 top-0 flex -translate-x-full flex-col opacity-0 transition-opacity duration-(--duration-fast) ease-out max-sm:hidden";
const CHIP =
  "pointer-events-none absolute -top-2 start-3 z-sticky -translate-y-1/2 rounded-sm bg-primary px-1.5 text-2xs font-semibold text-primary-foreground select-none";

const addBelow = (editor: PlateEditor, id: string): void => {
  const entry = blockEntry(editor, id);
  if (entry) insertLine(editor, PathApi.next(entry[1]), "/");
};

const Draggable = ({ editor, element, children }: PlateElementProps): React.JSX.Element => {
  const t = useLabels();
  const id = String(element.id);
  const selected = useEditorSelector((ed) => selectedId(ed) === id, [id]);
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
      data-block-id={id}
      data-dragging={isDragging || undefined}
      data-selected={selected || undefined}
      className={BLOCK}
    >
      <div contentEditable={false} data-slot="block-handle" className={HANDLE}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          tabIndex={-1}
          aria-label={t.addBlockBelow}
          className="text-muted-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => addBelow(editor as PlateEditor, id)}
        >
          <Plus aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          tabIndex={-1}
          ref={handleRef as React.Ref<HTMLButtonElement>}
          aria-label={t.dragHandle}
          data-slot="drag-handle"
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          onClick={() => selectBlockById(editor as PlateEditor, id)}
        >
          <GripVertical aria-hidden="true" />
        </Button>
      </div>
      {selected ? (
        <span contentEditable={false} aria-hidden="true" className={CHIP}>
          {typeLabel(t, String(element.type))}
        </span>
      ) : null}
      {children}
      {dropLine ? (
        <div
          contentEditable={false}
          data-slot="drop-line"
          data-position={dropLine}
          className={`pointer-events-none absolute -inset-x-2 h-0.5 rounded-full bg-primary ${dropLine === "top" ? "-top-2" : "-bottom-2"}`}
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
