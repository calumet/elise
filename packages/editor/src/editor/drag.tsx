import { GripVertical, Plus } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import { DRAG_ITEM_BLOCK, getHoverDirection, useDndNode, type DragItemNode } from "@platejs/dnd";
import { KEYS, NodeApi, PathApi, type TElement } from "platejs";
import {
  useEditorRef,
  useEditorSelector,
  useFocused,
  type PlateEditor,
  type PlateElementProps,
} from "platejs/react";
import * as React from "react";
import { useDrag, useDragLayer, useDrop, type DropTargetMonitor } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { typeLabel, useLabels } from "../labels";
import { DraggedBlock } from "./drag-chip";
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
  "relative rounded-md outline-offset-8 data-dragging:opacity-40 data-selected:outline-2 data-selected:outline-primary [&:hover:not(:has([data-slot=block]:hover))>[data-slot=block-handle]]:opacity-100 [&[data-selected]>[data-slot=block-handle]]:opacity-100";
const HANDLE =
  "absolute top-0 flex -translate-x-full flex-col opacity-0 transition-opacity duration-(--duration-fast) ease-out max-sm:hidden";
const CHIP =
  "pointer-events-none absolute start-3 z-sticky rounded-sm bg-primary px-1.5 text-2xs font-semibold text-primary-foreground select-none [[data-chip=above]>&]:-top-0.5 [[data-chip=above]>&]:-translate-y-full [[data-chip=below]>&]:-bottom-0.5 [[data-chip=below]>&]:translate-y-full [[data-chip=none]>&]:hidden";
const SLOT =
  "pointer-events-none flex h-10 items-center justify-center rounded-md border border-dashed border-primary bg-accent px-3 text-sm font-medium text-accent-foreground transition-opacity duration-(--duration-fast) ease-out select-none starting:opacity-0";

const CHIP_ROOM = 14;

type DropTarget = { id: string; position: "before" | "after" } | null;
type TargetStore = { value: DropTarget; listeners: Set<() => void> };

const stores = new WeakMap<object, TargetStore>();

const storeOf = (editor: object): TargetStore => {
  const existing = stores.get(editor);
  if (existing) return existing;
  const created: TargetStore = { value: null, listeners: new Set() };
  stores.set(editor, created);
  return created;
};

const setDropTarget = (editor: object, value: DropTarget): void => {
  const store = storeOf(editor);
  if (store.value?.id === value?.id && store.value?.position === value?.position) return;
  store.value = value;
  for (const listener of store.listeners) listener();
};

const useDropTarget = (editor: object): DropTarget =>
  React.useSyncExternalStore(
    (listener) => {
      const { listeners } = storeOf(editor);
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => storeOf(editor).value,
  );

const dropPosition = (
  editor: PlateEditor,
  dragItem: DragItemNode,
  element: TElement,
  monitor: DropTargetMonitor<DragItemNode>,
  nodeRef: React.RefObject<HTMLDivElement | null>,
): "before" | "after" | null => {
  const dragged = draggedId(dragItem);
  const direction = getHoverDirection({ dragItem, element, monitor, nodeRef });
  const position = direction === "top" ? "before" : direction === "bottom" ? "after" : null;
  return dragged && position && canMoveBlock(editor, dragged, String(element.id), position)
    ? position
    : null;
};

const room = (block: HTMLElement, side: "above" | "below"): number => {
  const box = block.getBoundingClientRect();
  let node: Element | null = block;
  while (node) {
    const sibling = side === "above" ? node.previousElementSibling : node.nextElementSibling;
    if (sibling) {
      const near = sibling.getBoundingClientRect();
      return side === "above" ? box.top - near.bottom : near.top - box.bottom;
    }
    node = node.parentElement?.closest("[data-slot=block]") ?? null;
  }
  return Number.POSITIVE_INFINITY;
};

const chipSide = (block: HTMLElement): "above" | "below" | "none" => {
  if (room(block, "above") >= CHIP_ROOM) return "above";
  return room(block, "below") >= CHIP_ROOM ? "below" : "none";
};

const addBelow = (editor: PlateEditor, id: string): void => {
  const entry = blockEntry(editor, id);
  if (entry) insertLine(editor, PathApi.next(entry[1]), "/");
};

const DropSlot = ({ position }: { position: "top" | "bottom" }): React.JSX.Element => {
  const item = useDragLayer((monitor) => monitor.getItem<DragItemNode | null>());
  return (
    <div
      contentEditable={false}
      data-slot="drop-line"
      data-position={position}
      className={`${SLOT} ${position === "top" ? "mb-4" : "mt-4"}`}
    >
      <DraggedBlock item={item} />
    </div>
  );
};

const EmptyHint = (): React.JSX.Element => {
  const t = useLabels();
  return (
    <span
      contentEditable={false}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 truncate text-muted-foreground select-none"
    >
      {t.placeholderDocument}
    </span>
  );
};

const Draggable = ({ editor, element, children }: PlateElementProps): React.JSX.Element => {
  const t = useLabels();
  const id = String(element.id);
  const selected = useEditorSelector((ed) => selectedId(ed) === id, [id]);
  const empty = element.type === KEYS.p && !element.listStyleType && NodeApi.string(element) === "";
  const caret = useEditorSelector(
    (ed) => ed.children.length > 1 && ed.api.isCollapsed() && ed.api.block()?.[0].id === id,
    [id],
  );
  const alone = useEditorSelector(
    (ed) => {
      const entry = blockEntry(ed, id);
      const parent = entry && entry[1].length > 1 ? ed.api.parent(entry[1]) : undefined;
      return parent?.[0].type === "column" && parent[0].children.length === 1;
    },
    [id],
  );
  const focused = useFocused();
  const hint = empty && ((caret && focused) || alone);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (selected && node) node.dataset.chip = chipSide(node);
  }, [selected, element]);

  const target = useDropTarget(editor);
  const { dragRef, isDragging, isOver } = useDndNode({
    element,
    nodeRef,
    preview: { disable: true },
    canDropNode: canDropNode as never,
    onDropHandler: (_editor, { id, dragItem, monitor }) => {
      if (monitor.didDrop()) return true;
      const dragged = draggedId(dragItem);
      const position = dropPosition(
        editor as PlateEditor,
        dragItem,
        (blockEntry(editor as PlateEditor, id)?.[0] ?? element) as TElement,
        monitor,
        nodeRef,
      );
      if (dragged && position) moveBlock(editor as PlateEditor, dragged, id, position);
      setDropTarget(editor, null);
      return true;
    },
    drop: {
      hover: (dragItem, monitor) => {
        if (!monitor.isOver({ shallow: true })) return;
        const position = dropPosition(editor as PlateEditor, dragItem, element, monitor, nodeRef);
        setDropTarget(editor, position ? { id, position } : null);
      },
    },
  });
  const slot = isOver && target?.id === id ? target.position : null;
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
          ref={dragRef as unknown as React.Ref<HTMLButtonElement>}
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
      {slot === "before" ? <DropSlot position="top" /> : null}
      {hint ? <EmptyHint /> : null}
      {children}
      {slot === "after" ? <DropSlot position="bottom" /> : null}
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

  const [{ isDragging }, drag, preview] = useDrag(
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

  React.useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const ref = React.useCallback(
    (element: HTMLElement | null) => {
      node.current = element;
      drag(drop(element));
    },
    [drag, drop],
  );

  return { ref, isDragging, isOver, position: isOver ? position : null };
};
