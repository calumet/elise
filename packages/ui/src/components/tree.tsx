/**
 * Árbol: una jerarquía que se abre y se cierra.
 *
 * Lleva el patrón de árbol de ARIA entero, y esa es la razón de que exista como
 * componente en vez de resolverse con listas anidadas y un `Collapsible` por
 * rama. Un lector de pantalla anuncia el nivel, cuántos hermanos hay y por cuál
 * va, y el teclado se mueve como se espera de un árbol y no como de una lista:
 * arriba y abajo recorren lo que se ve, derecha abre o entra, izquierda cierra o
 * sube al padre, Inicio y Fin van a los extremos.
 *
 * El foco entra una sola vez al árbol y desde ahí se mueve por dentro con las
 * flechas. Con un `tabIndex` por nodo, tabular por un árbol de cincuenta hojas
 * son cincuenta paradas antes de salir de él.
 *
 * @module
 */

import { ChevronRight } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";

type Context = {
  open: Set<string>;
  toggle: (id: string) => void;
  selected: string | undefined;
  select: (id: string) => void;
  firstId: string | undefined;
};

const TreeCtx = React.createContext<Context | null>(null);
const DepthCtx = React.createContext(1);

/** Props de {@link Tree}. */
export type TreeProps = Omit<React.ComponentProps<"ul">, "onSelect"> & {
  /** Ramas abiertas, por `id`. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;

  /** Nodo elegido, por `id`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/**
 * Árbol: una jerarquía que se abre y se cierra.
 *
 * Lleva el patrón de árbol de ARIA entero, y esa es la razón de que exista como
 * componente en vez de resolverse con listas anidadas y un `Collapsible` por
 * rama. Un lector de pantalla anuncia el nivel, cuántos hermanos hay y por cuál
 * va, y el teclado se mueve como se espera de un árbol y no como de una lista:
 * arriba y abajo recorren lo que se ve, derecha abre o entra, izquierda cierra o
 * sube al padre, Inicio y Fin van a los extremos.
 *
 * El foco entra una sola vez al árbol y desde ahí se mueve por dentro con las
 * flechas. Con un `tabIndex` por nodo, tabular por un árbol de cincuenta hojas
 * son cincuenta paradas antes de salir de él.
 */
export const Tree: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TreeProps> & React.RefAttributes<HTMLUListElement>
> = React.forwardRef<HTMLUListElement, TreeProps>(
  (
    {
      className,
      children,
      expanded,
      defaultExpanded = [],
      onExpandedChange,
      value,
      defaultValue,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState<string[]>(defaultExpanded);
    const [internalSelected, setInternalSelected] = React.useState<string | undefined>(
      defaultValue,
    );

    const open = React.useMemo(() => new Set(expanded ?? internalOpen), [expanded, internalOpen]);
    const selected = value ?? internalSelected;

    const toggle = React.useCallback(
      (id: string) => {
        const next = new Set(open);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        const list = [...next];
        if (expanded === undefined) setInternalOpen(list);
        onExpandedChange?.(list);
      },
      [open, expanded, onExpandedChange],
    );

    const select = React.useCallback(
      (id: string) => {
        if (value === undefined) setInternalSelected(id);
        onValueChange?.(id);
      },
      [value, onValueChange],
    );

    /* La única parada de tabulador es la del nodo elegido, y sin elegido la del
       primero de todos. Se saca de los hijos y no del DOM: leer el DOM durante
       el pintado daría null en el primer paso y ya no volvería a mirarse. */
    const firstId = React.useMemo(() => {
      const childNodes = React.Children.toArray(children).filter(
        React.isValidElement,
      ) as React.ReactElement<{ id?: string }>[];
      return childNodes[0]?.props.id;
    }, [children]);

    const context = React.useMemo(
      () => ({ open, toggle, selected, select, firstId }),
      [open, toggle, selected, select, firstId],
    );

    return (
      <TreeCtx.Provider value={context}>
        <ul
          data-slot="tree"
          role="tree"
          ref={ref}
          className={cn("m-0 flex list-none flex-col p-0", className)}
          {...props}
        >
          {children}
        </ul>
      </TreeCtx.Provider>
    );
  },
);
Tree.displayName = "Tree";

/** Props de {@link TreeItem}. */
export type TreeItemProps = Omit<React.ComponentProps<"li">, "onSelect" | "id"> & {
  /** Único dentro del árbol. Es con lo que se abre y se elige. */
  id: string;

  label: React.ReactNode;

  /** Va antes del rótulo: una carpeta, un archivo, un estado. */
  icon?: React.ReactNode;

  /** Las ramas hijas. Sin ellas es una hoja y no lleva flecha. */
  children?: React.ReactNode;
};

/** Todo lo que se ve ahora mismo, en el orden en que se recorre con las flechas. */
const visible = (root: HTMLElement | null) =>
  root
    ? [...root.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(
        (n) => n.offsetParent !== null,
      )
    : [];

/** Un nodo del árbol. Se pliega solo si tiene hijos. */
export const TreeItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TreeItemProps> & React.RefAttributes<HTMLLIElement>
> = React.forwardRef<HTMLLIElement, TreeItemProps>(
  ({ className, id, label, icon, children, ...props }, ref) => {
    const ctx = React.useContext(TreeCtx);
    const depth = React.useContext(DepthCtx);
    const own = React.useRef<HTMLLIElement | null>(null);

    if (!ctx) throw new Error("TreeItem tiene que ir dentro de un Tree");

    const leaves = React.Children.toArray(children).filter(React.isValidElement);
    const isBranch = leaves.length > 0;
    const open = ctx.open.has(id);
    const selected = ctx.selected === id;

    const tree = () => own.current?.closest<HTMLElement>('[role="tree"]') ?? null;

    const goTo = (index: number) => {
      const list = visible(tree());
      const target = list[Math.max(0, Math.min(list.length - 1, index))];
      target?.focus();
    };

    const keys = (event: React.KeyboardEvent<HTMLLIElement>) => {
      /* Solo responde el nodo enfocado. Sin esto, la tecla la atendería también
         cada antepasado por el que sube el evento. */
      if (event.target !== event.currentTarget) return;

      const list = visible(tree());
      const here = list.indexOf(own.current as HTMLElement);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          goTo(here + 1);
          return;
        case "ArrowUp":
          event.preventDefault();
          goTo(here - 1);
          return;
        case "Home":
          event.preventDefault();
          goTo(0);
          return;
        case "End":
          event.preventDefault();
          goTo(list.length - 1);
          return;
        case "ArrowRight":
          event.preventDefault();
          /* Cerrada abre; ya abierta entra a la primera hija. Es lo que hace
             que la flecha derecha sirva para bajar sin cambiar de tecla. */
          if (isBranch && !open) ctx.toggle(id);
          else if (isBranch) goTo(here + 1);
          return;
        case "ArrowLeft": {
          event.preventDefault();
          if (isBranch && open) {
            ctx.toggle(id);
            return;
          }
          /* Cerrada o siendo hoja, sube al padre. */
          const padre = own.current?.parentElement?.closest<HTMLElement>('[role="treeitem"]');
          padre?.focus();
          return;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          ctx.select(id);
          if (isBranch) ctx.toggle(id);
          return;
        default:
      }
    };

    const first = !ctx.selected && ctx.firstId === id;

    return (
      <li
        data-slot="tree-item"
        ref={(node) => {
          own.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="treeitem"
        aria-expanded={isBranch ? open : undefined}
        aria-selected={selected}
        aria-level={depth}
        tabIndex={selected || first ? 0 : -1}
        onKeyDown={keys}
        onClick={(event) => {
          /* El clic de una hija burbujea hasta acá: solo responde la fila propia. */
          if ((event.target as HTMLElement).closest('[role="treeitem"]') !== event.currentTarget)
            return;
          ctx.select(id);
          if (isBranch) ctx.toggle(id);
        }}
        className={cn(
          /* El anillo se pinta en la fila y no en el `<li>`, que envuelve
             también a las ramas hijas. Va por hijo directo: con un selector de
             descendiente, enfocar un padre encendería además las filas de todo
             lo que tenga abierto debajo.
             La fila enfocada sube de capa porque el anillo sobresale 2px y las
             filas van pegadas: el fondo de la de abajo se pinta después, por
             orden de documento, y le comía ese borde al apuntarla. */
          "flex flex-col outline-none [&:focus-visible>span:first-child]:z-10 [&:focus-visible>span:first-child]:ring-2 [&:focus-visible>span:first-child]:ring-ring",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "relative flex cursor-pointer items-center gap-1.5 rounded-md py-1 pe-2 text-sm text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover",
            selected && "bg-accent text-accent-foreground",
          )}
          style={{ paddingInlineStart: `${(depth - 1) * 16 + 4}px` }}
        >
          {isBranch ? (
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-fast) ease-out",
                open && "rotate-90",
              )}
            />
          ) : (
            <span aria-hidden="true" className="size-4 shrink-0" />
          )}
          {icon ? (
            <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
              {icon}
            </span>
          ) : null}
          <span className="truncate">{label}</span>
        </span>

        {isBranch && open ? (
          <DepthCtx.Provider value={depth + 1}>
            <ul role="group" className="m-0 flex list-none flex-col p-0">
              {children}
            </ul>
          </DepthCtx.Provider>
        ) : null}
      </li>
    );
  },
);
TreeItem.displayName = "TreeItem";
