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
import { renderBlocks } from "../render/content";
import type { EditorNode } from "../types";
import { useServices } from "./context";
import { insertLine } from "./items";
import { BlockSelectionPlugin, selectBlockById, useSelectedId } from "./selection";
import {
  blockEntry,
  canMoveBlock,
  isColumns,
  isMovable,
  moveBlock,
  type DropPosition,
} from "./structure";
import { FormatRow } from "./toolbar";

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
  "relative rounded-md outline-offset-8 hover:z-sticky data-dragging:opacity-40 data-dragging:outline-1 data-dragging:outline-border-strong data-dragging:outline-dashed data-selected:z-overlay data-selected:outline-2 data-selected:outline-primary data-selected:outline-solid [&:hover:not(:has([data-slot=block]:hover))>[data-slot=block-handle]]:opacity-100 [&[data-selected]>[data-slot=block-handle]]:opacity-100";
const HANDLE =
  "absolute top-0 flex -translate-x-full flex-col opacity-0 transition-opacity duration-(--duration-fast) ease-out max-sm:hidden";
const CHIP =
  "pointer-events-none absolute start-3 z-sticky rounded-sm [[data-formatting]_&]:invisible bg-primary px-1.5 text-2xs font-semibold text-primary-foreground select-none [[data-chip=above]>&]:top-0 [[data-chip=above]>&]:-translate-y-full [[data-chip=below]>&]:bottom-0 [[data-chip=below]>&]:translate-y-full [[data-chip=none]>&]:hidden";
const GHOST =
  "max-h-64 overflow-hidden rounded-md border border-dashed border-primary p-2 opacity-60";

const CHIP_ROOM = 16;

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

export const setDropTarget = (editor: object, value: DropTarget): void => {
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

const dropTarget = (
  editor: PlateEditor,
  dragItem: DragItemNode,
  element: TElement,
  monitor: DropTargetMonitor<DragItemNode>,
  nodeRef: React.RefObject<HTMLDivElement | null>,
): DropTarget => {
  const dragged = draggedId(dragItem);
  const direction = getHoverDirection({ dragItem, element, monitor, nodeRef });
  const entry = blockEntry(editor, String(element.id));
  if (!dragged || !direction || !entry) return null;
  const previous = direction === "top" ? PathApi.previous(entry[1]) : undefined;
  const before = previous ? editor.api.node<TElement>(previous)?.[0] : undefined;
  const target: DropTarget = before?.id
    ? { id: String(before.id), position: "after" }
    : { id: String(element.id), position: direction === "top" ? "before" : "after" };
  return target && canMoveBlock(editor, dragged, target.id, target.position) ? target : null;
};

export const dropOnTarget = (editor: PlateEditor, dragItem: DragItemNode): void => {
  const dragged = draggedId(dragItem);
  const target = storeOf(editor).value;
  if (dragged && target) moveBlock(editor, dragged, target.id, target.position);
  setDropTarget(editor, null);
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

const press = { down: false, tracked: false };

const trackPress = (): void => {
  if (press.tracked) return;
  press.tracked = true;
  const up = () => {
    press.down = false;
  };
  document.addEventListener(
    "pointerdown",
    () => {
      press.down = true;
    },
    true,
  );
  document.addEventListener("pointerup", up, true);
  document.addEventListener("pointercancel", up, true);
};

const useTextBar = (selected: boolean, enabled: boolean): boolean => {
  const [last, setLast] = React.useState(selected);
  const [lingering, setLingering] = React.useState(false);
  if (selected !== last) {
    setLast(selected);
    setLingering(!selected && press.down);
  }

  React.useEffect(() => {
    if (enabled) trackPress();
  }, [enabled]);

  React.useEffect(() => {
    if (!lingering) return;
    const release = () => setLingering(false);
    document.addEventListener("pointerup", release, { once: true });
    document.addEventListener("pointercancel", release, { once: true });
    return () => {
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
    };
  }, [lingering]);

  return enabled && (selected || lingering);
};

const TEXT_BAR =
  "group grid grid-rows-[0fr] transition-[grid-template-rows] duration-(--duration-base) ease-out select-none data-open:grid-rows-[1fr] starting:data-open:grid-rows-[0fr] motion-reduce:grid-rows-[1fr] motion-reduce:transition-none";
const TEXT_ROW =
  "mt-2 -translate-y-1 overflow-x-auto border-t border-border pt-1 opacity-0 transition-[opacity,translate] duration-(--duration-base) ease-out group-data-open:translate-y-0 group-data-open:opacity-100 starting:group-data-open:-translate-y-1 starting:group-data-open:opacity-0 motion-reduce:translate-y-0";

const TextBar = ({ open }: { open: boolean }): React.JSX.Element | null => {
  const [shown, setShown] = React.useState(open);
  if (open && !shown) setShown(true);
  if (!shown) return null;
  return (
    <div
      contentEditable={false}
      data-slot="text-toolbar"
      data-open={open || undefined}
      inert={!open}
      className={TEXT_BAR}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          data-motion="essential"
          className={TEXT_ROW}
          onTransitionEnd={(event) => {
            if (!open && event.target === event.currentTarget && event.propertyName === "opacity") {
              setShown(false);
            }
          }}
        >
          <FormatRow />
        </div>
      </div>
    </div>
  );
};

const addBelow = (editor: PlateEditor, id: string): void => {
  const entry = blockEntry(editor, id);
  if (entry) insertLine(editor, PathApi.next(entry[1]), "/");
};

const DropSlot = ({ position }: { position: "before" | "after" }): React.JSX.Element => {
  const { schema } = useServices();
  const item = useDragLayer((monitor) => monitor.getItem<DragItemNode | null>());
  const ref = React.useRef<HTMLDivElement>(null);
  const element = item && "element" in item ? (item.element as EditorNode | undefined) : undefined;

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const style = getComputedStyle(node);
    const options = {
      duration: Number.parseFloat(style.getPropertyValue("--duration-base")) || 200,
      easing: style.getPropertyValue("--ease-out").trim() || "ease-out",
    };
    node.animate(
      reduce
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { height: "0px", opacity: 0 },
            { height: `${node.offsetHeight}px`, opacity: 1 },
          ],
      options,
    );
  }, []);

  return (
    <div
      ref={ref}
      contentEditable={false}
      aria-hidden="true"
      data-slot="drop-line"
      data-position={position}
      className={`pointer-events-none overflow-hidden select-none ${position === "before" ? "pb-4" : "pt-4"}`}
    >
      <div className={GHOST}>{element ? renderBlocks([element], schema) : null}</div>
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

const isEmptyText = (element: TElement): boolean => {
  const first = element.children[0] as TElement | undefined;
  return (
    element.type === "text" &&
    element.children.length === 1 &&
    first?.type === KEYS.p &&
    !first.listStyleType &&
    NodeApi.string(element) === ""
  );
};

const useEmptyHint = (element: TElement): boolean => {
  const id = String(element.id);
  const caret = useEditorSelector(
    (ed) => {
      const line = ed.selection && ed.api.isCollapsed() ? ed.api.block() : undefined;
      return Boolean(line && ed.api.parent(line[1])?.[0].id === id);
    },
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
  return isEmptyText(element) && ((caret && focused) || alone);
};

const useBlockClick = (
  editor: PlateEditor,
  id: string,
  isColumnsBlock: boolean,
  nodeRef: React.RefObject<HTMLDivElement | null>,
): void => {
  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const pick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-slot=block]") !== node) return;
      const name = target.dataset.slot;
      if (isColumnsBlock && (name === "columns" || name === "column")) {
        event.preventDefault();
        selectBlockById(editor, id);
        editor.tf.focus();
        return;
      }
      const explicit = editor.getOption(BlockSelectionPlugin, "id");
      if (!explicit || explicit === id || target.closest("[data-slot=block-handle]")) return;
      const entry = blockEntry(editor, id);
      if (entry && editor.api.isVoid(entry[0])) {
        event.preventDefault();
        selectBlockById(editor, id);
        editor.tf.focus();
      } else {
        editor.setOption(BlockSelectionPlugin, "id", null);
      }
    };
    node.addEventListener("mousedown", pick);
    return () => node.removeEventListener("mousedown", pick);
  }, [editor, id, isColumnsBlock, nodeRef]);
};

const Draggable = ({ editor, element, children }: PlateElementProps): React.JSX.Element => {
  const t = useLabels();
  const id = String(element.id);
  const selected = useSelectedId() === id;
  const hint = useEmptyHint(element as TElement);
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const bar = useTextBar(selected, element.type === "text");

  React.useLayoutEffect(() => {
    const node = nodeRef.current;
    if (selected && node) node.dataset.chip = chipSide(node);
  }, [selected, element, bar]);

  const target = useDropTarget(editor);
  const { dragRef, isDragging } = useDndNode({
    element,
    nodeRef,
    preview: { disable: true },
    canDropNode: canDropNode as never,
    onDropHandler: (_editor, { dragItem, monitor }) => {
      if (!monitor.didDrop()) dropOnTarget(editor as PlateEditor, dragItem);
      return true;
    },
    drop: {
      hover: (dragItem, monitor) => {
        if (!monitor.isOver({ shallow: true })) return;
        const entry = blockEntry(editor as PlateEditor, id);
        setDropTarget(
          editor,
          dropTarget(
            editor as PlateEditor,
            dragItem,
            (entry?.[0] ?? element) as TElement,
            monitor,
            nodeRef,
          ),
        );
      },
    },
  });
  const slot = target?.id === id ? target.position : null;
  useBlockClick(editor as PlateEditor, id, element.type === "columns", nodeRef);

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
          data-slot="block-add"
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
      {slot === "before" ? <DropSlot position="before" /> : null}
      {hint ? <EmptyHint /> : null}
      {children}
      <TextBar open={bar} />
      {slot === "after" ? <DropSlot position="after" /> : null}
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

export const DropArea = ({
  container,
}: {
  container: React.RefObject<HTMLDivElement | null>;
}): null => {
  const editor = useEditorRef();
  const [{ over }, drop] = useDrop<DragItemNode, unknown, { over: boolean }>(
    () => ({
      accept: DRAG_ITEM_BLOCK,
      collect: (monitor) => ({ over: monitor.isOver() }),
      drop: (item, monitor) => {
        if (!monitor.didDrop()) dropOnTarget(editor, item);
      },
    }),
    [editor],
  );

  React.useEffect(() => {
    drop(container.current);
  }, [container, drop]);

  React.useEffect(() => {
    if (!over) setDropTarget(editor, null);
  }, [editor, over]);

  return null;
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
