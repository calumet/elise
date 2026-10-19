import { GripVertical, Plus } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { KEYS, NodeApi, PathApi, type TElement } from "platejs";
import {
  useEditorRef,
  useEditorSelector,
  useFocused,
  type PlateEditor,
  type PlateElementProps,
} from "platejs/react";
import * as React from "react";

import { typeLabel, useLabels } from "../labels";
import { insertLine } from "./items";
import { startPageDrag, type DropTarget, type PageDrag } from "./page-drag";
import { BlockSelectionPlugin, selectBlockById, useSelectedId } from "./selection";
import { blockEntry, isColumns, isMovable, type DropPosition } from "./structure";
import { FormatRow } from "./toolbar";

const BLOCK =
  "relative rounded-md outline-offset-8 hover:z-sticky data-dragging:pointer-events-none data-dragging:z-popover data-dragging:bg-card data-dragging:shadow-lg data-dragging:outline-1 data-dragging:outline-border data-dragging:outline-solid data-settling:z-popover data-selected:z-overlay data-selected:outline-2 data-selected:outline-primary data-selected:outline-solid [&:hover:not(:has([data-slot=block]:hover))>[data-slot=block-handle]]:opacity-100 [&[data-selected]>[data-slot=block-handle]]:opacity-100";
const HANDLE =
  "absolute top-0 flex -translate-x-full flex-col opacity-0 transition-opacity duration-(--duration-fast) ease-out max-sm:hidden";
const CHIP =
  "pointer-events-none absolute start-3 z-sticky rounded-sm [[data-formatting]_&]:invisible bg-primary px-1.5 text-2xs font-semibold text-primary-foreground select-none [[data-chip=above]>&]:top-0 [[data-chip=above]>&]:-translate-y-full [[data-chip=below]>&]:bottom-0 [[data-chip=below]>&]:translate-y-full [[data-chip=none]>&]:hidden";
const CHIP_ROOM = 16;

type DragState = { active: string | null; target: DropTarget | null };
type DragStore = { value: DragState; listeners: Set<() => void> };
type DragData = { blockId: string; follow: boolean };

const IDLE: DragState = { active: null, target: null };
const stores = new WeakMap<object, DragStore>();

const storeOf = (editor: object): DragStore => {
  const existing = stores.get(editor);
  if (existing) return existing;
  const created: DragStore = { value: IDLE, listeners: new Set() };
  stores.set(editor, created);
  return created;
};

const setDragState = (editor: object, value: DragState): void => {
  const store = storeOf(editor);
  store.value = value;
  for (const listener of store.listeners) listener();
};

const useDragState = (editor: object): DragState =>
  React.useSyncExternalStore(
    (listener) => {
      const { listeners } = storeOf(editor);
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => storeOf(editor).value,
  );

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

  const data: DragData = { blockId: id, follow: true };
  const { setNodeRef, setActivatorNodeRef, listeners } = useDraggable({ id, data });
  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );
  useBlockClick(editor as PlateEditor, id, element.type === "columns", nodeRef);

  return (
    <div
      ref={ref}
      data-slot="block"
      data-block-id={id}
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
          ref={setActivatorNodeRef}
          aria-label={t.dragHandle}
          data-slot="drag-handle"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          {...listeners}
          onMouseDown={(event) => event.preventDefault()}
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
      {hint ? <EmptyHint /> : null}
      {children}
      <TextBar open={bar} />
    </div>
  );
};

export const draggable = ({
  editor,
  element,
}: PlateElementProps): ((props: PlateElementProps) => React.ReactNode) | undefined => {
  if (editor.dom.readOnly || !isMovable(element as TElement)) return undefined;
  const path = editor.api.findPath(element) ?? [];
  const root = path.length === 1;
  const inColumn = path.length === 3 && isColumns(editor.children[path[0] ?? 0]);
  return root || inColumn ? (props) => <Draggable {...props} /> : undefined;
};

const SILENT = {
  announcements: {
    onDragStart: () => undefined,
    onDragMove: () => undefined,
    onDragOver: () => undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => undefined,
  },
  screenReaderInstructions: { draggable: "" },
};
const AUTO_SCROLL = { threshold: { x: 0, y: 0.1 } };

export const BlockDrag = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const editor = useEditorRef();
  const drag = React.useRef<PageDrag | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const finish = (commit: boolean) => {
    drag.current?.finish(commit);
    drag.current = null;
    setDragState(editor, IDLE);
  };

  return (
    <DndContext
      sensors={sensors}
      autoScroll={AUTO_SCROLL}
      accessibility={SILENT}
      onDragStart={({ active, activatorEvent }) => {
        const { blockId, follow } = active.data.current as DragData;
        setDragState(editor, { active: blockId, target: null });
        drag.current = startPageDrag({
          editor,
          id: blockId,
          follow,
          activator: activatorEvent,
          onTarget: (target) => setDragState(editor, { active: blockId, target }),
        });
      }}
      onDragEnd={() => finish(true)}
      onDragCancel={() => finish(false)}
    >
      {children}
    </DndContext>
  );
};

export type OutlineDnd = {
  ref: (node: HTMLElement | null) => void;
  listeners: DraggableSyntheticListeners;
  isDragging: boolean;
  isOver: boolean;
  position: DropPosition | null;
};

export const useOutlineDnd = (id: string): OutlineDnd => {
  const editor = useEditorRef();
  const { active, target } = useDragState(editor);
  const data: DragData = { blockId: id, follow: false };
  const { setNodeRef, listeners } = useDraggable({
    id: `outline:${id}`,
    data,
    disabled: !isMovable(blockEntry(editor, id)?.[0]),
  });
  const ref = React.useCallback(
    (node: HTMLElement | null) => {
      if (node) node.dataset.outlineId = id;
      setNodeRef(node);
    },
    [id, setNodeRef],
  );
  const position = target?.id === id ? target.position : null;
  return { ref, listeners, isDragging: active === id, isOver: position !== null, position };
};
