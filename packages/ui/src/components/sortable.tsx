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
 * @module
 */

import { GripVertical } from "@calumet/elise-icons";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
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
