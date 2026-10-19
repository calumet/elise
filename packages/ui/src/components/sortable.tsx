/**
 * Una lista que se reordena arrastrando desde un asa, con teclado y lector de
 * pantalla, sobre dnd-kit.
 *
 * ```tsx
 * <SortableList items={ids} onReorder={setIds}>
 *   {ids.map((id) => (
 *     <SortableItem key={id} id={id}>
 *       <SortableHandle label={nameOf(id)} />
 *       {nameOf(id)}
 *     </SortableItem>
 *   ))}
 * </SortableList>
 * ```
 *
 * `SortableTree` hace lo mismo con una jerarquía: además de reordenar, cambia
 * de nivel desplazando en horizontal mientras se arrastra.
 *
 * @module
 */

import { ChevronRight, GripVertical } from "@calumet/elise-icons";
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardCode,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  type Announcements,
  type DragEndEvent,
  type DroppableContainer,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  type AnimateLayoutChanges,
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

type ListContextValue = {
  labels: React.RefObject<Map<UniqueIdentifier, string>>;
};

const ListContext = React.createContext<ListContextValue | null>(null);

type ItemContextValue = Pick<
  ReturnType<typeof useSortable>,
  "attributes" | "listeners" | "setActivatorNodeRef" | "isDragging"
> & { id: UniqueIdentifier };

const ItemContext = React.createContext<ItemContextValue | null>(null);

const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );

const useAnnouncements = (
  items: UniqueIdentifier[],
  labels: React.RefObject<Map<UniqueIdentifier, string>>,
) => {
  const instructions = useElLabel(
    "ui",
    "sortableInstructions",
    "Para mover un elemento, pulsa espacio, usa las flechas arriba y abajo, y vuelve a pulsar espacio para soltarlo. Escape cancela.",
  );
  const pickedUp = useElLabel(
    "ui",
    "sortablePickedUp",
    "{label} levantado. Está en la posición {position} de {total}.",
  );
  const moved = useElLabel(
    "ui",
    "sortableMoved",
    "{label} pasa a la posición {position} de {total}.",
  );
  const dropped = useElLabel(
    "ui",
    "sortableDropped",
    "{label} soltado en la posición {position} de {total}.",
  );
  const canceled = useElLabel(
    "ui",
    "sortableCanceled",
    "Movimiento cancelado. {label} vuelve a la posición {position} de {total}.",
  );

  const describe = (template: string, id: UniqueIdentifier, at: UniqueIdentifier) =>
    fill(template, {
      label: labels.current.get(id) ?? String(id),
      position: items.indexOf(at) + 1,
      total: items.length,
    });

  const announcements: Announcements = {
    onDragStart: ({ active }) => describe(pickedUp, active.id, active.id),
    onDragOver: ({ active, over }) => (over ? describe(moved, active.id, over.id) : undefined),
    onDragEnd: ({ active, over }) => describe(dropped, active.id, over?.id ?? active.id),
    onDragCancel: ({ active }) => describe(canceled, active.id, active.id),
  };

  return { announcements, screenReaderInstructions: { draggable: instructions } };
};

/** Props de {@link SortableList}. */
export type SortableListProps = Omit<React.HTMLAttributes<HTMLUListElement>, "onChange"> & {
  /** Los ids de los elementos, en el orden actual. */
  items: UniqueIdentifier[];
  /** Recibe los ids en el orden nuevo al soltar. */
  onReorder: (items: UniqueIdentifier[]) => void;
  /** Pasa la lista al hijo en vez de pintar un `<ul>`, por ejemplo a `TableBody`. */
  asChild?: boolean;
};

/**
 * La lista. Solo reordena en vertical, y guardar el orden nuevo es cosa de
 * quien la usa.
 */
export function SortableList({
  items,
  onReorder,
  asChild,
  className,
  children,
  ...props
}: SortableListProps): React.JSX.Element {
  const labels = React.useRef(new Map<UniqueIdentifier, string>());
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [container, setContainer] = React.useState<Element>();
  const listRef = React.useCallback((node: HTMLElement | null) => {
    setContainer(node?.closest("table")?.parentElement ?? undefined);
  }, []);

  const accessibility = { ...useAnnouncements(items, labels), container };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
  };

  const list = React.useMemo(() => ({ labels }), []);
  const Comp = asChild ? Slot : "ul";

  return (
    <ListContext.Provider value={list}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        accessibility={accessibility}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Comp
            ref={listRef}
            data-slot="sortable-list"
            className={cn(!asChild && "flex list-none flex-col gap-2", className)}
            {...props}
          >
            {children}
          </Comp>
        </SortableContext>
      </DndContext>
    </ListContext.Provider>
  );
}

/** Props de {@link SortableItem}. */
export type SortableItemProps = React.HTMLAttributes<HTMLLIElement> & {
  /** El mismo id que el elemento tiene en `items`. */
  id: UniqueIdentifier;
  /** Pasa el elemento al hijo en vez de pintar un `<li>`, por ejemplo a `TableRow`. */
  asChild?: boolean;
};

/** Un elemento de la lista. Mientras se arrastra queda por encima, con sombra. */
export function SortableItem({
  id,
  asChild,
  className,
  style,
  children,
  ...props
}: SortableItemProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const item = React.useMemo(
    () => ({ id, attributes, listeners, setActivatorNodeRef, isDragging }),
    [id, attributes, listeners, setActivatorNodeRef, isDragging],
  );
  const Comp = asChild ? Slot : "li";

  return (
    <ItemContext.Provider value={item}>
      <Comp
        ref={setNodeRef}
        data-slot="sortable-item"
        data-dragging={isDragging ? "" : undefined}
        style={{ ...style, transform: CSS.Translate.toString(transform), transition }}
        className={cn(
          !asChild && "rounded-lg bg-card",
          "relative data-dragging:z-10 data-dragging:bg-card data-dragging:shadow-lg",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    </ItemContext.Provider>
  );
}

/** Props de {@link SortableHandle}. */
export type SortableHandleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** El nombre del elemento, para el `aria-label` del asa y los anuncios. */
  label: string;
};

/** El asa: lo único que inicia el arrastre, para que el resto de la fila siga respondiendo. */
export function SortableHandle({
  label,
  className,
  ...props
}: SortableHandleProps): React.JSX.Element {
  const list = React.useContext(ListContext);
  const item = React.useContext(ItemContext);
  if (!list || !item) throw new Error("<SortableHandle> debe usarse dentro de <SortableItem>");

  const { id, attributes, listeners, setActivatorNodeRef, isDragging } = item;
  const template = useElLabel("ui", "sortableHandle", "Mover {label}");

  React.useEffect(() => {
    list.labels.current.set(id, label);
  }, [list, id, label]);

  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      data-slot="sortable-handle"
      className={cn(
        "relative inline-flex size-icon-lg shrink-0 cursor-grab touch-none items-center justify-center rounded-xs text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out before:absolute before:-inset-1 before:content-[''] hover:bg-state-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-dragging:cursor-grabbing",
        className,
      )}
      data-dragging={isDragging ? "" : undefined}
      {...attributes}
      {...listeners}
      {...props}
      aria-label={fill(template, { label })}
    >
      <GripVertical className="size-icon-md" aria-hidden="true" />
    </button>
  );
}

const INDENT = 24;

/** Un nodo de {@link SortableTree}. */
export type SortableTreeNode = {
  id: UniqueIdentifier;
  /** El nombre del nodo, para el asa y los anuncios. */
  label: string;
  children?: SortableTreeNode[];
  /** Con `false` la fila no se arrastra, aunque las demás se muevan a su alrededor. */
  draggable?: boolean;
  /** Con `false` el nodo no admite hijos. */
  acceptsChildren?: boolean;
};

/** Lo que {@link SortableTree} entrega al soltar. */
export type SortableTreeMove = {
  id: UniqueIdentifier;
  /** El nuevo padre, o `null` si queda en la raíz. */
  parentId: UniqueIdentifier | null;
  /** La posición entre sus nuevas hermanas, desde 0. */
  index: number;
};

type FlatNode<T> = {
  node: T;
  id: UniqueIdentifier;
  parentId: UniqueIdentifier | null;
  depth: number;
};

const flatten = <T extends SortableTreeNode>(
  nodes: T[],
  parentId: UniqueIdentifier | null = null,
  depth = 0,
): FlatNode<T>[] =>
  nodes.flatMap((node) => [
    { node, id: node.id, parentId, depth },
    ...flatten((node.children ?? []) as T[], node.id, depth + 1),
  ]);

const build = <T extends SortableTreeNode>(
  flat: FlatNode<T>[],
  parentId: UniqueIdentifier | null = null,
): T[] =>
  flat
    .filter((item) => item.parentId === parentId)
    .map((item) => ({ ...item.node, children: build(flat, item.id) }));

const hideChildrenOf = <T,>(flat: FlatNode<T>[], ids: Iterable<UniqueIdentifier>) => {
  const hidden = new Set(ids);
  return flat.filter((item) => {
    if (item.parentId === null || !hidden.has(item.parentId)) return true;
    hidden.add(item.id);
    return false;
  });
};

const height = (node: SortableTreeNode): number =>
  Math.max(0, ...(node.children ?? []).map((child) => height(child) + 1));

const descendants = (node: SortableTreeNode): number =>
  (node.children ?? []).reduce((sum, child) => sum + 1 + descendants(child), 0);

const project = <T,>(
  items: FlatNode<T>[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  offset: number,
) => {
  const overIndex = items.findIndex(({ id }) => id === overId);
  const activeIndex = items.findIndex(({ id }) => id === activeId);
  const moved = arrayMove(items, activeIndex, overIndex);
  const previous = moved[overIndex - 1];
  const next = moved[overIndex + 1];
  const maxDepth = previous ? previous.depth + 1 : 0;
  const minDepth = next ? next.depth : 0;
  const wanted = items[activeIndex].depth + Math.round(offset / INDENT);
  const depth = Math.min(Math.max(wanted, minDepth), maxDepth);

  let parentId: UniqueIdentifier | null = null;
  if (depth > 0 && previous) {
    if (depth === previous.depth) parentId = previous.parentId;
    else if (depth > previous.depth) parentId = previous.id;
    else
      parentId =
        moved
          .slice(0, overIndex)
          .reverse()
          .find((item) => item.depth === depth)?.parentId ?? null;
  }

  return { depth, minDepth, maxDepth, parentId, previous, next, moved };
};

type DragState = { items: FlatNode<SortableTreeNode>[]; offset: number };

const treeKeyboardCoordinates =
  (drag: DragState): KeyboardCoordinateGetter =>
  (event, { currentCoordinates, context }) => {
    const { active, over, collisionRect, droppableRects, droppableContainers } = context;
    const vertical = event.code === KeyboardCode.Up || event.code === KeyboardCode.Down;
    const horizontal = event.code === KeyboardCode.Left || event.code === KeyboardCode.Right;
    if ((!vertical && !horizontal) || !active || !collisionRect) return undefined;
    event.preventDefault();

    const { items, offset } = drag;

    if (horizontal) {
      if (over == null) return undefined;
      const { depth, minDepth, maxDepth } = project(items, active.id, over.id, offset);
      if (event.code === KeyboardCode.Left && depth > minDepth)
        return { ...currentCoordinates, x: currentCoordinates.x - INDENT };
      if (event.code === KeyboardCode.Right && depth < maxDepth)
        return { ...currentCoordinates, x: currentCoordinates.x + INDENT };
      return undefined;
    }

    const containers: DroppableContainer[] = [];
    droppableContainers.forEach((container) => {
      if (container.disabled || container.id === over?.id) return;
      const rect = droppableRects.get(container.id);
      if (!rect) return;
      const ahead =
        event.code === KeyboardCode.Down
          ? collisionRect.top < rect.top
          : collisionRect.top > rect.top;
      if (ahead) containers.push(container);
    });

    const collisions = closestCorners({
      active,
      collisionRect,
      pointerCoordinates: null,
      droppableRects,
      droppableContainers: containers,
    });
    let closestId = getFirstCollision(collisions, "id");
    if (closestId === over?.id && collisions.length > 1) closestId = collisions[1].id;
    if (closestId == null || over == null) return undefined;

    const rect = droppableRects.get(closestId);
    const target = items.find(({ id }) => id === closestId);
    const current = items.find(({ id }) => id === active.id);
    if (!rect || !target || !current) return undefined;

    const { depth } = project(items, active.id, closestId, (target.depth - current.depth) * INDENT);
    return { x: rect.left + depth * INDENT, y: rect.top };
  };

const useTreeTexts = () => ({
  instructions: useElLabel(
    "ui",
    "sortableTreeInstructions",
    "Para mover un elemento, pulsa espacio. Las flechas arriba y abajo cambian su posición, y las flechas izquierda y derecha, su nivel. Vuelve a pulsar espacio para soltarlo. Escape cancela.",
  ),
  pickedUp: useElLabel("ui", "sortableTreePickedUp", "{label} levantado, en el nivel {level}."),
  moved: useElLabel("ui", "sortableTreeMoved", "{label} va {placement}."),
  dropped: useElLabel("ui", "sortableTreeDropped", "{label} soltado {placement}."),
  before: useElLabel("ui", "sortableTreeBefore", "antes de {target}"),
  inside: useElLabel("ui", "sortableTreeInside", "dentro de {target}"),
  after: useElLabel("ui", "sortableTreeAfter", "después de {target}"),
  blocked: useElLabel("ui", "sortableTreeBlocked", "No se puede soltar aquí"),
  rejected: useElLabel(
    "ui",
    "sortableTreeRejected",
    "{label} no se puede soltar ahí y vuelve a su sitio.",
  ),
  canceled: useElLabel(
    "ui",
    "sortableTreeCanceled",
    "Movimiento cancelado. {label} vuelve a su sitio.",
  ),
  toggle: useElLabel("ui", "sortableTreeToggle", "Lo que hay dentro de {label}"),
});

type TreeTexts = ReturnType<typeof useTreeTexts>;

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  !isSorting && !wasDragging;

const measuring = { droppable: { strategy: MeasuringStrategy.Always } };

const toggleClass =
  "inline-flex size-icon-lg shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Props de {@link SortableTree}. */
export type SortableTreeProps<T extends SortableTreeNode> = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  "children" | "onChange"
> & {
  /** Los nodos de la raíz, cada uno con sus `children`. */
  items: T[];
  /** Recibe el movimiento al soltar, y el árbol con él ya aplicado. */
  onMove: (move: SortableTreeMove, items: T[]) => void;
  /** El contenido de cada fila, después del asa. Sin él se pinta `label`. */
  renderItem?: (node: T) => React.ReactNode;
  /** Cuántos niveles caben. Un movimiento que los supere no se puede soltar. */
  maxDepth?: number;
  /** Las ramas que empiezan plegadas, por `id`. */
  defaultCollapsed?: UniqueIdentifier[];
};

/**
 * Un árbol que se reordena arrastrando desde el asa. Desplazar en horizontal
 * mientras se arrastra mete el nodo dentro de la hermana de arriba o lo saca al
 * padre, y una rama plegada se mueve entera. Guardar el árbol nuevo es cosa de
 * quien lo usa.
 */
export function SortableTree<T extends SortableTreeNode>({
  items,
  onMove,
  renderItem = (node) => node.label,
  maxDepth = Infinity,
  defaultCollapsed = [],
  className,
  ...props
}: SortableTreeProps<T>): React.JSX.Element {
  const labels = React.useRef(new Map<UniqueIdentifier, string>());
  const [collapsed, setCollapsed] = React.useState(() => new Set(defaultCollapsed));
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = React.useState<UniqueIdentifier | null>(null);
  const [offset, setOffset] = React.useState(0);
  const announced = React.useRef<string | undefined>(undefined);
  const texts = useTreeTexts();

  const all = React.useMemo(() => flatten(items), [items]);
  const byId = React.useMemo(() => new Map(all.map((item) => [item.id, item])), [all]);
  const visible = React.useMemo(
    () => hideChildrenOf(all, activeId == null ? collapsed : [...collapsed, activeId]),
    [all, collapsed, activeId],
  );

  const [drag] = React.useState<DragState>(() => ({ items: [], offset: 0 }));
  React.useEffect(() => {
    drag.items = visible;
  }, [drag, visible]);

  const [coordinateGetter] = React.useState(() => treeKeyboardCoordinates(drag));
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter }),
  );

  const projectFor = (active: UniqueIdentifier, over: UniqueIdentifier, dx: number) => {
    const projection = project(visible, active, over, dx);
    const node = byId.get(active)?.node;
    const parent = projection.parentId == null ? undefined : byId.get(projection.parentId)?.node;
    const allowed =
      !!node && projection.depth + height(node) < maxDepth && parent?.acceptsChildren !== false;
    return { ...projection, allowed };
  };

  const projected =
    activeId != null && overId != null ? projectFor(activeId, overId, offset) : null;

  const labelOf = (id: UniqueIdentifier) => byId.get(id)?.node.label ?? String(id);

  const placement = (active: UniqueIdentifier, over: UniqueIdentifier) => {
    const { depth, previous, next, moved, allowed } = projectFor(active, over, drag.offset);
    if (!previous)
      return { allowed, where: next && fill(texts.before, { target: labelOf(next.id) }) };
    if (depth > previous.depth)
      return { allowed, where: fill(texts.inside, { target: labelOf(previous.id) }) };
    let sibling: FlatNode<T> | undefined = previous;
    while (sibling && depth < sibling.depth) {
      const parentId: UniqueIdentifier | null = sibling.parentId;
      sibling = moved.find(({ id }) => id === parentId);
    }
    return { allowed, where: sibling && fill(texts.after, { target: labelOf(sibling.id) }) };
  };

  const announceMove: Announcements["onDragOver"] = ({ active, over }) => {
    if (!over) return undefined;
    const { where, allowed } = placement(active.id, over.id);
    if (!where) return undefined;
    const moved = fill(texts.moved, { label: labelOf(active.id), placement: where });
    const text = allowed ? moved : `${moved} ${texts.blocked}.`;
    if (text === announced.current) return undefined;
    announced.current = text;
    return text;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      fill(texts.pickedUp, {
        label: labelOf(active.id),
        level: (byId.get(active.id)?.depth ?? 0) + 1,
      }),
    onDragMove: announceMove,
    onDragOver: announceMove,
    onDragEnd: ({ active, over }) => {
      const label = labelOf(active.id);
      if (!over) return fill(texts.canceled, { label });
      const { where, allowed } = placement(active.id, over.id);
      if (!allowed) return fill(texts.rejected, { label });
      return where ? fill(texts.dropped, { label, placement: where }) : undefined;
    },
    onDragCancel: ({ active }) => fill(texts.canceled, { label: labelOf(active.id) }),
  };

  const reset = () => {
    setActiveId(null);
    setOverId(null);
    setOffset(0);
    announced.current = undefined;
  };

  const onDragEnd = ({ active, over, delta }: DragEndEvent) => {
    reset();
    if (!over) return;
    const { depth, parentId, allowed } = projectFor(active.id, over.id, delta.x);
    if (!allowed) return;

    const activeIndex = all.findIndex(({ id }) => id === active.id);
    const overIndex = all.findIndex(({ id }) => id === over.id);
    const before = all[activeIndex];
    const moved = arrayMove(
      all.map((item, i) => (i === activeIndex ? { ...item, depth, parentId } : item)),
      activeIndex,
      overIndex,
    );
    const indexIn = (list: FlatNode<T>[], parent: UniqueIdentifier | null) =>
      list.filter((item) => item.parentId === parent).findIndex(({ id }) => id === active.id);
    const index = indexIn(moved, parentId);
    if (parentId === before.parentId && index === indexIn(all, before.parentId)) return;

    onMove({ id: active.id, parentId, index }, build(moved));
  };

  const toggle = (id: UniqueIdentifier) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const active = activeId == null ? undefined : byId.get(activeId)?.node;
  const list = React.useMemo(() => ({ labels }), []);

  return (
    <ListContext.Provider value={list}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={measuring}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: texts.instructions },
        }}
        onDragStart={({ active }) => {
          drag.offset = 0;
          setActiveId(active.id);
          setOverId(active.id);
        }}
        onDragMove={({ delta }) => {
          drag.offset = delta.x;
          setOffset(delta.x);
        }}
        onDragOver={({ over }) => setOverId(over?.id ?? null)}
        onDragEnd={onDragEnd}
        onDragCancel={reset}
      >
        <SortableContext items={visible.map(({ id }) => id)} strategy={verticalListSortingStrategy}>
          <ul
            data-slot="sortable-tree"
            className={cn("m-0 flex list-none flex-col p-0", className)}
            {...props}
          >
            {visible.map((item) => {
              const isActive = item.id === activeId && projected;
              const branch = (item.node.children?.length ?? 0) > 0;
              return (
                <SortableTreeRow
                  key={item.id}
                  node={item.node}
                  depth={isActive ? projected.depth : item.depth}
                  blocked={isActive ? !projected.allowed : false}
                  collapsed={branch ? collapsed.has(item.id) : undefined}
                  onToggle={() => toggle(item.id)}
                  texts={texts}
                >
                  {renderItem(item.node)}
                </SortableTreeRow>
              );
            })}
          </ul>
        </SortableContext>
        <DragOverlay>
          {active ? (
            <div
              aria-hidden="true"
              data-blocked={projected?.allowed === false ? "" : undefined}
              className="flex cursor-grabbing items-center gap-1.5 rounded-md border border-border bg-card py-1 ps-1 pe-2 text-sm text-foreground shadow-lg data-blocked:border-destructive"
            >
              <span className="inline-flex size-icon-lg shrink-0 items-center justify-center text-muted-foreground">
                <GripVertical className="size-icon-md" />
              </span>
              <span className="size-icon-lg shrink-0" />
              <span className="min-w-0 flex-1 truncate">{renderItem(active as T)}</span>
              {projected?.allowed === false ? (
                <span className="shrink-0 text-xs text-destructive">{texts.blocked}</span>
              ) : null}
              {descendants(active) > 0 ? (
                <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">
                  +{descendants(active)}
                </span>
              ) : null}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ListContext.Provider>
  );
}

type SortableTreeRowProps = {
  node: SortableTreeNode;
  depth: number;
  blocked: boolean;
  collapsed: boolean | undefined;
  onToggle: () => void;
  texts: TreeTexts;
  children: React.ReactNode;
};

function SortableTreeRow({
  node,
  depth,
  blocked,
  collapsed,
  onToggle,
  texts,
  children,
}: SortableTreeRowProps) {
  const locked = node.draggable === false;
  const {
    attributes,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    animateLayoutChanges,
    disabled: { draggable: locked, droppable: false },
  });

  const item = React.useMemo(
    () => ({ id: node.id, attributes, listeners, setActivatorNodeRef, isDragging }),
    [node.id, attributes, listeners, setActivatorNodeRef, isDragging],
  );

  return (
    <li
      ref={setDroppableNodeRef}
      data-slot="sortable-tree-item"
      className="relative"
      style={{ paddingInlineStart: depth * INDENT }}
    >
      {Array.from({ length: depth }, (_, level) => (
        <span
          key={level}
          aria-hidden="true"
          className="absolute inset-y-0 border-s border-border"
          style={{ insetInlineStart: level * INDENT + INDENT / 2 }}
        />
      ))}
      <div
        ref={setDraggableNodeRef}
        data-dragging={isDragging ? "" : undefined}
        data-blocked={blocked ? "" : undefined}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn(
          "rounded-md border border-transparent py-1 ps-1 pe-2 text-sm text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover",
          isDragging && "border-dashed border-primary bg-accent",
          blocked && "border-destructive bg-destructive-subtle",
        )}
      >
        <div className={cn("flex min-w-0 items-center gap-1.5", isDragging && "opacity-0")}>
          <ItemContext.Provider value={item}>
            <SortableHandle
              label={node.label}
              className={cn(locked && "cursor-not-allowed opacity-50 hover:bg-transparent")}
            />
          </ItemContext.Provider>
          {collapsed === undefined ? (
            <span aria-hidden="true" className="size-icon-lg shrink-0" />
          ) : (
            <button
              type="button"
              aria-expanded={!collapsed}
              aria-label={fill(texts.toggle, { label: node.label })}
              onClick={onToggle}
              className={toggleClass}
            >
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  "size-icon-md transition-transform duration-(--duration-fast) ease-out",
                  !collapsed && "rotate-90",
                )}
              />
            </button>
          )}
          <div className="min-w-0 flex-1 truncate">{children}</div>
        </div>
      </div>
    </li>
  );
}
