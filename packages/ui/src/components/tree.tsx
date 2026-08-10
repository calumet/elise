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

type Contexto = {
  abiertos: Set<string>;
  alternar: (id: string) => void;
  elegido: string | undefined;
  elegir: (id: string) => void;
  primerId: string | undefined;
};

const TreeCtx = React.createContext<Contexto | null>(null);
const ProfundidadCtx = React.createContext(1);

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
    const [abiertosInternos, setAbiertosInternos] = React.useState<string[]>(defaultExpanded);
    const [elegidoInterno, setElegidoInterno] = React.useState<string | undefined>(defaultValue);

    const abiertos = React.useMemo(
      () => new Set(expanded ?? abiertosInternos),
      [expanded, abiertosInternos],
    );
    const elegido = value ?? elegidoInterno;

    const alternar = React.useCallback(
      (id: string) => {
        const siguiente = new Set(abiertos);
        if (siguiente.has(id)) siguiente.delete(id);
        else siguiente.add(id);
        const lista = [...siguiente];
        if (expanded === undefined) setAbiertosInternos(lista);
        onExpandedChange?.(lista);
      },
      [abiertos, expanded, onExpandedChange],
    );

    const elegir = React.useCallback(
      (id: string) => {
        if (value === undefined) setElegidoInterno(id);
        onValueChange?.(id);
      },
      [value, onValueChange],
    );

    /* La única parada de tabulador es la del nodo elegido, y sin elegido la del
       primero de todos. Se saca de los hijos y no del DOM: leer el DOM durante
       el pintado daría null en el primer paso y ya no volvería a mirarse. */
    const primerId = React.useMemo(() => {
      const hijos = React.Children.toArray(children).filter(
        React.isValidElement,
      ) as React.ReactElement<{ id?: string }>[];
      return hijos[0]?.props.id;
    }, [children]);

    const contexto = React.useMemo(
      () => ({ abiertos, alternar, elegido, elegir, primerId }),
      [abiertos, alternar, elegido, elegir, primerId],
    );

    return (
      <TreeCtx.Provider value={contexto}>
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
const visibles = (raiz: HTMLElement | null) =>
  raiz
    ? [...raiz.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter(
        (n) => n.offsetParent !== null,
      )
    : [];

/** Un nodo del árbol. Se pliega solo si tiene hijos. */
export const TreeItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TreeItemProps> & React.RefAttributes<HTMLLIElement>
> = React.forwardRef<HTMLLIElement, TreeItemProps>(
  ({ className, id, label, icon, children, ...props }, ref) => {
    const ctx = React.useContext(TreeCtx);
    const profundidad = React.useContext(ProfundidadCtx);
    const propio = React.useRef<HTMLLIElement | null>(null);

    if (!ctx) throw new Error("TreeItem tiene que ir dentro de un Tree");

    const hojas = React.Children.toArray(children).filter(React.isValidElement);
    const esRama = hojas.length > 0;
    const abierto = ctx.abiertos.has(id);
    const elegido = ctx.elegido === id;

    const arbol = () => propio.current?.closest<HTMLElement>('[role="tree"]') ?? null;

    const irA = (indice: number) => {
      const lista = visibles(arbol());
      const destino = lista[Math.max(0, Math.min(lista.length - 1, indice))];
      destino?.focus();
    };

    const teclas = (evento: React.KeyboardEvent<HTMLLIElement>) => {
      /* Solo responde el nodo enfocado. Sin esto, la tecla la atendería también
         cada antepasado por el que sube el evento. */
      if (evento.target !== evento.currentTarget) return;

      const lista = visibles(arbol());
      const aqui = lista.indexOf(propio.current as HTMLElement);

      switch (evento.key) {
        case "ArrowDown":
          evento.preventDefault();
          irA(aqui + 1);
          return;
        case "ArrowUp":
          evento.preventDefault();
          irA(aqui - 1);
          return;
        case "Home":
          evento.preventDefault();
          irA(0);
          return;
        case "End":
          evento.preventDefault();
          irA(lista.length - 1);
          return;
        case "ArrowRight":
          evento.preventDefault();
          /* Cerrada abre; ya abierta entra a la primera hija. Es lo que hace
             que la flecha derecha sirva para bajar sin cambiar de tecla. */
          if (esRama && !abierto) ctx.alternar(id);
          else if (esRama) irA(aqui + 1);
          return;
        case "ArrowLeft": {
          evento.preventDefault();
          if (esRama && abierto) {
            ctx.alternar(id);
            return;
          }
          /* Cerrada o siendo hoja, sube al padre. */
          const padre = propio.current?.parentElement?.closest<HTMLElement>('[role="treeitem"]');
          padre?.focus();
          return;
        }
        case "Enter":
        case " ":
          evento.preventDefault();
          ctx.elegir(id);
          if (esRama) ctx.alternar(id);
          return;
        default:
      }
    };

    const primero = !ctx.elegido && ctx.primerId === id;

    return (
      <li
        data-slot="tree-item"
        ref={(nodo) => {
          propio.current = nodo;
          if (typeof ref === "function") ref(nodo);
          else if (ref) ref.current = nodo;
        }}
        role="treeitem"
        aria-expanded={esRama ? abierto : undefined}
        aria-selected={elegido}
        aria-level={profundidad}
        tabIndex={elegido || primero ? 0 : -1}
        onKeyDown={teclas}
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
          onClick={() => {
            ctx.elegir(id);
            if (esRama) ctx.alternar(id);
          }}
          className={cn(
            "relative flex cursor-pointer items-center gap-1.5 rounded-md py-1 pe-2 text-sm text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-muted",
            elegido && "bg-accent text-accent-foreground",
          )}
          style={{ paddingInlineStart: `${(profundidad - 1) * 16 + 4}px` }}
        >
          {esRama ? (
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-fast) ease-out",
                abierto && "rotate-90",
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

        {esRama && abierto ? (
          <ProfundidadCtx.Provider value={profundidad + 1}>
            <ul role="group" className="m-0 flex list-none flex-col p-0">
              {children}
            </ul>
          </ProfundidadCtx.Provider>
        ) : null}
      </li>
    );
  },
);
TreeItem.displayName = "TreeItem";
