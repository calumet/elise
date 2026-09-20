/**
 * Tabla.
 *
 * Trae su propio marco: contorno, radio y recorte. El contorno no es un borde
 * plano sino un bisel, con el filo de abajo más pesado que el de arriba, más una
 * sombra de 1px: con un borde uniforme el plano no tiene arriba ni abajo, y la
 * tabla se lee recortada en el lienzo en vez de puesta sobre él. La banda del encabezado llega
 * hasta el borde, así que sin recorte sus esquinas cuadradas se salen por
 * encima de cualquier contorno redondeado que la envuelva, y quien la usa no
 * tiene por qué saberlo. Dentro de una tarjeta que ya lo pone, `bare` lo
 * quita.
 *
 * El marco es un `<div>` aparte y no el propio `<table>` porque también hace de
 * carril de desplazamiento: una tabla que no cabe se desliza dentro del marco
 * en vez de estirar la página.
 *
 * Son dos `<div>` y no uno porque el que desplaza no puede ser el mismo que
 * lleva el contorno: la capa del bisel se iría con el contenido y al arrastrar
 * la tabla el filo se saldría del marco.
 *
 * Estrecha se lee como lista, no como tabla apretada. Cambia el marcado de
 * verdad, `<ul>` y `<li>` en vez de `<table>`, en lugar de tumbar la tabla con
 * `display`, que deja el contenido bien pero le quita a un lector de pantalla
 * las relaciones de fila y columna sin poner nada en su lugar.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";
import { SURFACE } from "@/lib/surface";

import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLabel,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

/** Las clases de la superficie que comparten `Card` y `Table`, para que las dos cajas del sistema no se separen. */
export { SURFACE };

/**
 * Papel que juega una columna cuando la tabla se lee como lista.
 *
 * - `primary`: lo más importante. Una sola columna.
 * - `secondary`: lo segundo. Una sola columna.
 * - `kicker`: va antes de las dos anteriores y con menos peso. Una sola.
 * - `inline`: se acopla al lado de la principal. Pueden ser varias.
 * - `labeled`: sale como par de rótulo y valor. Pueden ser varias.
 */
export type ListSlot = "primary" | "secondary" | "inline" | "kicker" | "labeled";

/**
 * `numeric` y `currency` alinean a la derecha y numeran a ancho fijo. `code`
 * pone los valores en monoespaciada, para una columna de datos de máquina; el
 * rótulo no, que ese es texto corriente.
 */
export type ColumnFormat = "base" | "numeric" | "currency" | "code";

type Column = {
  listSlot?: ListSlot;
  format: ColumnFormat;
  header: React.ReactNode;
};

type Mode = "table" | "list";

const TableCtx = React.createContext<{
  mode: Mode;
  columns: Column[];
  slots: ListSlot[];
  loading: boolean;
}>({
  mode: "table",
  columns: [],
  slots: [],
  loading: false,
});

/* Lo que se apaga mientras carga. Una tabla con la que no se puede interactuar
   es contenido inhabilitado, y 0.35 es la opacidad a la que el texto llega al
   gris con el que se pinta lo inhabilitado: sobre blanco, 48 acaba en 181. */
const DIMMED = "opacity-35 transition-opacity duration-(--duration-fast) ease-out";

/** Índice de la columna en la que cae una celda, puesto por su fila. */
const ColumnCtx = React.createContext(0);

const isNumeric = (format: ColumnFormat | undefined) =>
  format === "numeric" || format === "currency";

const isCode = (format: ColumnFormat | undefined) => format === "code";

/* El corte para pasar de tabla a lista. Por debajo de esto, tres columnas ya
   no caben sin apretar el texto hasta partirlo por letras. */
const MIN_TABLE_WIDTH = 490;

const first = <P,>(nodes: React.ReactNode, kind: unknown) =>
  React.Children.toArray(nodes).find(
    (n): n is React.ReactElement<P> => React.isValidElement(n) && n.type === kind,
  );

const without = (nodes: React.ReactNode, kind: unknown) =>
  React.Children.toArray(nodes).filter((n) => !(React.isValidElement(n) && n.type === kind));

/** Cantos del recorte que coinciden con los del marco, que son los que lleva redondeados. */
const zoneRadius = (hasFilters: boolean, hasPagination: boolean) =>
  cn(!hasFilters && "rounded-t-[inherit]", !hasPagination && "rounded-b-[inherit]");

/**
 * Saca de la fila de encabezado el papel, el formato y el rótulo de cada
 * columna. La lista los necesita: sin ellos no hay forma de saber cuál es el
 * dato principal de una fila ni con qué rótulo sale un valor suelto.
 *
 * Se lee del árbol y no de un prop aparte porque la información ya está escrita
 * una vez en el encabezado: repetirla en un prop es lo que se quiere evitar.
 */
const collectColumns = (childNodes: React.ReactNode): Column[] => {
  const header = first<{ children?: React.ReactNode }>(childNodes, TableHeader);
  const row = header && first<{ children?: React.ReactNode }>(header.props.children, TableRow);
  if (!row) return [];
  return React.Children.toArray(row.props.children)
    .filter((n): n is React.ReactElement<TableHeadProps> => React.isValidElement(n))
    .map((cell) => ({
      listSlot: cell.props.listSlot,
      format: cell.props.format ?? "base",
      header: cell.props.children,
    }));
};

/**
 * Reparte los papeles de la lista. Los tres únicos (principal, secundaria y
 * antetítulo) se quedan con la primera columna que los pida; las demás caen a
 * par de rótulo y valor.
 *
 * Si ninguna columna se declara principal, la primera sin designar hace de
 * principal: sin eso una tabla que no sepa nada de listas sale como un montón
 * de pares sin nada que los encabece.
 */
const assignSlots = (columns: Column[]): ListSlot[] => {
  const taken = new Set<ListSlot>();
  const slots: (ListSlot | undefined)[] = columns.map((column) => {
    const slot = column.listSlot;
    if (!slot) return undefined;
    if (slot === "inline" || slot === "labeled") return slot;
    if (taken.has(slot)) return "labeled";
    taken.add(slot);
    return slot;
  });

  if (!slots.includes("primary")) {
    const free = slots.indexOf(undefined);
    if (free >= 0) slots[free] = "primary";
  }

  return slots.map((slot) => slot ?? "labeled");
};

/** Props de {@link Table}. */
export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Quita el marco propio para meter la tabla dentro de una tarjeta que ya lo
   * pone. Con los dos salen dos bordes concéntricos. El radio lo hereda de esa
   * tarjeta.
   */
  bare?: boolean;

  /** Clases para el marco, no para la tabla. */
  frameClassName?: string;

  /**
   * Cómo se leen las filas.
   *
   * - `table`: siempre tabla.
   * - `list`: siempre lista.
   * - `auto`: tabla mientras quepa y lista cuando no. Es el de por omisión.
   */
  variant?: "auto" | "list" | "table";

  /** Pone la franja de paginar al pie. */
  paginate?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;

  /**
   * Saltar a la primera y a la última. Solo aparecen si les das manejador: una
   * tabla que sepa cuántas páginas hay puede ofrecerlos, y una que vaya con
   * cursor, que no lo sabe, se queda con anterior y siguiente.
   */
  onFirstPage?: () => void;
  onLastPage?: () => void;

  /** Lo que va entre los dos pasos, del estilo «1-20 de 340». */
  paginationLabel?: React.ReactNode;

  /**
   * Un control al final de la franja, del tipo «filas por página». Va ahí y no
   * debajo de la tarjeta porque es parte de cómo se pagina esta tabla: por
   * fuera se lee como un ajuste suelto que no se sabe a qué se refiere. Los
   * pasos siguen centrados en el ancho de la tabla, no en el hueco que deja.
   */
  paginationEnd?: React.ReactNode;

  /**
   * Barra de filtros, arriba del todo y dentro del marco. Va aquí y no como
   * hijo suelto porque lo que la define es dónde se apoya: encima de la tabla,
   * dentro de la misma tarjeta y separada por un filete.
   */
  filters?: React.ReactNode;

  /**
   * Cargando. Baja un aviso sobre la tabla y deja lo de debajo sin responder,
   * en vez de vaciarla: al pasar de página las filas que ya estaban siguen
   * ahí, así que la tarjeta no pega un salto de alto ni parpadea en blanco.
   *
   * Se apoya en `inert`, que quita del paso al ratón, al tabulador y al lector
   * de pantalla de una vez. Deshabilitar los controles uno por uno haría lo
   * primero pero dejaría el foco entrando en una tabla que está cambiando.
   */
  loading?: boolean;

  /** Lo que dice el aviso mientras carga. */
  loadingLabel?: React.ReactNode;

  /**
   * No hay filas que mostrar. Saca el {@link TableEmpty} en lugar de la tabla y
   * no pinta la franja de paginar, que sin filas no hay páginas. La barra de
   * filtros se queda en pie, que es de donde se sale de un filtro sin
   * resultados.
   */
  empty?: boolean;
};

/**
 * Tabla.
 *
 * Trae su propio marco: contorno, radio y recorte. El contorno no es un borde
 * plano sino un bisel, con el filo de abajo más pesado que el de arriba, más una
 * sombra de 1px: con un borde uniforme el plano no tiene arriba ni abajo, y la
 * tabla se lee recortada en el lienzo en vez de puesta sobre él. La banda del encabezado llega
 * hasta el borde, así que sin recorte sus esquinas cuadradas se salen por
 * encima de cualquier contorno redondeado que la envuelva, y quien la usa no
 * tiene por qué saberlo. Dentro de una tarjeta que ya lo pone, `bare` lo
 * quita.
 *
 * El marco es un `<div>` aparte y no el propio `<table>` porque también hace de
 * carril de desplazamiento: una tabla que no cabe se desliza dentro del marco
 * en vez de estirar la página.
 *
 * Son dos `<div>` y no uno porque el que desplaza no puede ser el mismo que
 * lleva el contorno: la capa del bisel se iría con el contenido y al arrastrar
 * la tabla el filo se saldría del marco.
 *
 * Estrecha se lee como lista, no como tabla apretada. Cambia el marcado de
 * verdad, `<ul>` y `<li>` en vez de `<table>`, en lugar de tumbar la tabla con
 * `display`, que deja el contenido bien pero le quita a un lector de pantalla
 * las relaciones de fila y columna sin poner nada en su lugar.
 */
/* Se mide el hueco disponible, o sea el padre, y no lo que ocupa la tabla: una
   tabla que no cabe empuja a su propio contenedor, así que midiéndola a ella el
   ancho siempre daría de sobra y nunca pasaría a lista. */
function useTableFits(variant: TableProps["variant"]): {
  container: React.RefObject<HTMLDivElement | null>;
  fits: boolean;
} {
  const [fits, setFits] = React.useState(true);
  const container = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    if (variant !== "auto") return;
    const gap = container.current?.parentElement;
    if (!gap) return;
    const observer = new ResizeObserver(([entry]) => {
      setFits(entry.contentRect.width >= MIN_TABLE_WIDTH);
    });
    observer.observe(gap);
    return () => observer.disconnect();
  }, [variant]);

  return { container, fits };
}

/* La franja de paginado, con sus cuatro controles opcionales. */
function PaginationBar({
  loading,
  paginationEnd,
  paginationLabel,
  hasPreviousPage,
  hasNextPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
}: Pick<
  TableProps,
  | "loading"
  | "paginationEnd"
  | "paginationLabel"
  | "hasPreviousPage"
  | "hasNextPage"
  | "onFirstPage"
  | "onPreviousPage"
  | "onNextPage"
  | "onLastPage"
>): React.JSX.Element {
  return (
    <Pagination
      variant="table"
      className={cn("rounded-b-[inherit]", loading && DIMMED)}
      end={paginationEnd}
      inert={loading || undefined}
    >
      <PaginationContent>
        {onFirstPage ? (
          <PaginationItem>
            <PaginationFirst disabled={!hasPreviousPage} onClick={onFirstPage} />
          </PaginationItem>
        ) : null}
        <PaginationItem>
          <PaginationPrevious disabled={!hasPreviousPage} onClick={onPreviousPage} />
        </PaginationItem>
        {paginationLabel ? (
          <PaginationItem>
            <PaginationLabel>{paginationLabel}</PaginationLabel>
          </PaginationItem>
        ) : null}
        <PaginationItem>
          <PaginationNext disabled={!hasNextPage} onClick={onNextPage} />
        </PaginationItem>
        {onLastPage ? (
          <PaginationItem>
            <PaginationLast disabled={!hasNextPage} onClick={onLastPage} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}

export const Table: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TableProps> & React.RefAttributes<HTMLTableElement>
> = React.forwardRef<HTMLTableElement, TableProps>(
  // Lo que queda es componer partes opcionales, no lógica que se pueda mudar.
  // react-doctor-disable-next-line no-high-complexity-react-function
  (
    {
      className,
      bare = false,
      frameClassName,
      variant = "auto",
      paginate = false,
      hasPreviousPage = false,
      hasNextPage = false,
      onPreviousPage,
      onNextPage,
      onFirstPage,
      onLastPage,
      paginationLabel,
      paginationEnd,
      filters,
      loading = false,
      loadingLabel,
      empty = false,
      children,
      ...props
    },
    ref,
  ) => {
    const { container, fits } = useTableFits(variant);
    const mode: Mode = variant === "auto" ? (fits ? "table" : "list") : variant;

    const columns = React.useMemo(() => collectColumns(children), [children]);
    const slots = React.useMemo(() => assignSlots(columns), [columns]);
    const context = React.useMemo(
      () => ({ mode, columns, slots, loading: loading }),
      [mode, columns, slots, loading],
    );

    /* El vacío se declara al lado del cuerpo y sale cuando le toca. Fuera de su
       turno no entra en la tabla: un <div> dentro de un <table> no es válido. */
    const emptyZone = first(children, TableEmpty);
    const rows = React.useMemo(() => without(children, TableEmpty), [children]);

    const body =
      mode === "list" ? (
        <div data-slot="table-list" className={cn("w-full text-sm text-foreground", className)}>
          {rows}
        </div>
      ) : (
        <table
          data-slot="table"
          ref={ref}
          className={cn("w-full border-collapse text-sm text-foreground", className)}
          {...props}
        >
          {rows}
        </table>
      );

    const isEmpty = empty && emptyZone !== undefined;

    const paginationBar =
      paginate && !empty ? (
        <PaginationBar
          loading={loading}
          paginationEnd={paginationEnd}
          paginationLabel={paginationLabel}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onFirstPage={onFirstPage}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onLastPage={onLastPage}
        />
      ) : null;

    const filterBar = filters ? (
      <div
        data-slot="table-filters"
        className={cn("border-b border-border px-3 py-3", loading && DIMMED)}
        inert={loading || undefined}
      >
        {filters}
      </div>
    ) : null;

    /* Cargando, las filas se apagan y la tabla deja de responder. No baja ningún
       cartel: uno a lo ancho tapa la banda del encabezado, y entonces lo que se
       ve no es un aviso que llega sino una cabecera que se borró.

       El encabezado no se apaga. Es el rótulo de las columnas, no dato que esté
       cambiando, y dejarlo firme es lo que mantiene la tabla legible mientras
       llega la página siguiente. */
    const zone = isEmpty ? (
      emptyZone
    ) : (
      <div className={cn("relative overflow-hidden", zoneRadius(!!filterBar, !!paginationBar))}>
        <div className="w-full overflow-x-auto" inert={loading || undefined}>
          {body}
        </div>
      </div>
    );

    return (
      <TableCtx.Provider value={context}>
        {/* Con la tabla inerte, un lector de pantalla ya no llega a sus filas.
            Esto es lo único que queda anunciando que hay algo en curso. */}
        <span role="status" aria-live="polite" className="sr-only">
          {loading ? loadingLabel : null}
        </span>
        <div
          ref={container}
          data-slot={bare ? "table-bare" : "table-frame"}
          aria-busy={loading || undefined}
          className={cn(bare ? "rounded-[inherit]" : SURFACE, "w-full", frameClassName)}
        >
          {filterBar}
          {zone}
          {paginationBar}
        </div>
      </TableCtx.Provider>
    );
  },
);
Table.displayName = "Table";

/** Props de {@link TableEmpty}. */
export type TableEmptyProps = React.ComponentProps<"div">;

/**
 * Ocupa el sitio de la tabla cuando no hay filas. Se declara al lado del
 * cuerpo, y quien decide cuál de los dos sale es `empty`:
 *
 * ```tsx
 * <Table empty={filas.length === 0}>
 *   <TableHeader>…</TableHeader>
 *   <TableBody>…</TableBody>
 *   <TableEmpty>
 *     <EmptyState size="sm">…</EmptyState>
 *   </TableEmpty>
 * </Table>
 * ```
 *
 * Para la tabla de algo que todavía no se creó, el vacío va en lugar de la
 * tabla entera y no acá dentro.
 *
 * `Table` lo busca entre sus hijos por tipo, igual que al `TableHeader`, así
 * que tiene que ser hijo directo: envuelto en otro componente no se encuentra.
 */
export function TableEmpty({ className, ...props }: TableEmptyProps): React.JSX.Element {
  const { loading } = React.useContext(TableCtx);
  return (
    <div
      data-slot="table-empty"
      className={cn("w-full", loading && DIMMED, className)}
      {...props}
    />
  );
}

/** El `<thead>`. */
export const TableHeader: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.HTMLAttributes<HTMLTableSectionElement>> &
    React.RefAttributes<HTMLTableSectionElement>
> = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const { mode } = React.useContext(TableCtx);
    /* En lista el encabezado no se dibuja: sus rótulos ya salen pegados a cada
     valor dentro de la fila. */
    if (mode === "list") return null;
    return (
      <thead
        data-slot="table-header"
        ref={ref}
        /* Sin filete propio: la raya bajo el encabezado la pone el borde superior
         de la primera fila del cuerpo. Con las dos salían dos líneas de 1px
         pegadas. */
        className={cn(className)}
        {...props}
      />
    );
  },
);
TableHeader.displayName = "TableHeader";

/** El `<tbody>`. */
export const TableBody: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.HTMLAttributes<HTMLTableSectionElement>> &
    React.RefAttributes<HTMLTableSectionElement>
> = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const { mode, loading } = React.useContext(TableCtx);
    /* `divide-y` pone el filete debajo de cada fila menos de la última, así que
     la tabla no cierra con una raya suelta contra el borde del marco. La línea
     bajo el encabezado la pone este `border-t`, y va un tono más firme que los
     separadores: cierra la banda del encabezado, mientras que los de entre filas
     solo tienen que dejar contar. */
    const rules = cn("divide-y divide-border-subtle border-t border-border", loading && DIMMED);

    if (mode === "list") {
      return (
        <ul
          data-slot="table-body"
          className={cn("list-none", rules, className)}
          {...(props as React.HTMLAttributes<HTMLUListElement>)}
        />
      );
    }

    return <tbody data-slot="table-body" ref={ref} className={cn(rules, className)} {...props} />;
  },
);
TableBody.displayName = "TableBody";

/** El `<tfoot>`, para totales. */
export const TableFooter: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.HTMLAttributes<HTMLTableSectionElement>> &
    React.RefAttributes<HTMLTableSectionElement>
> = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const { mode } = React.useContext(TableCtx);
    const shared = "border-t border-border font-semibold text-foreground";

    if (mode === "list") {
      return (
        <div
          data-slot="table-footer"
          className={cn(shared, "px-3 py-2", className)}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        />
      );
    }

    return (
      <tfoot data-slot="table-footer" ref={ref} className={cn(shared, className)} {...props} />
    );
  },
);
TableFooter.displayName = "TableFooter";

/** Reparte las celdas de una fila por el papel que tenga su columna. */
const ListRow = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & { clickDelegate?: string }
>(({ children, className, clickDelegate, ...props }, ref) => {
  const { columns, slots } = React.useContext(TableCtx);

  const cells = React.Children.toArray(children).filter(
    (n): n is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(n),
  );

  const de = (slot: ListSlot) => {
    const i = slots.indexOf(slot);
    return i >= 0 ? { value: cells[i]?.props.children, column: columns[i] } : undefined;
  };
  const all = (slot: ListSlot) =>
    cells
      .map((cell, i) => ({
        index: i,
        value: cell.props.children,
        column: columns[i],
        slot: slots[i],
      }))
      .filter((c) => c.slot === slot);

  const kicker = de("kicker");
  const primary = de("primary");
  const secondary = de("secondary");

  return (
    /* Envuelve a dos niveles: los pares de rótulo y valor se reparten entre
       ellos y, si aun así no caben al lado del bloque principal, bajan enteros
       a la línea de abajo. Sin esto una tabla con varias columnas designadas
       `labeled` se salía de la tarjeta, que además recorta. */
    <li
      data-slot="table-row"
      ref={ref}
      className={cn(
        "flex flex-wrap items-start gap-x-4 gap-y-2 px-3 py-2",
        clickDelegate && "cursor-pointer hover:bg-state-hover",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-40 flex-1 flex-col gap-0.5">
        {kicker ? (
          <span
            className={cn(
              "truncate text-xs text-muted-foreground",
              isCode(kicker.column?.format) && "font-mono",
            )}
          >
            {kicker.value}
          </span>
        ) : null}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {primary ? (
            <span
              className={cn(
                "min-w-0 truncate font-medium text-foreground",
                isCode(primary.column?.format) && "font-mono",
              )}
            >
              {primary.value}
            </span>
          ) : null}
          {all("inline").map((c) => (
            <span key={c.index} className={cn("shrink-0", isCode(c.column?.format) && "font-mono")}>
              {c.value}
            </span>
          ))}
        </div>
        {secondary ? (
          <span
            className={cn(
              "truncate text-muted-foreground",
              isCode(secondary.column?.format) && "font-mono",
            )}
          >
            {secondary.value}
          </span>
        ) : null}
      </div>

      {all("labeled").length > 0 ? (
        <div className="flex flex-wrap items-start justify-end gap-x-4 gap-y-1">
          {all("labeled").map((c) => (
            <div key={c.index} className="flex flex-col items-end gap-0.5">
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {c.column?.header}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-foreground",
                  isNumeric(c.column?.format) && "tabular-nums",
                  isCode(c.column?.format) && "font-mono",
                )}
              >
                {c.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </li>
  );
});
ListRow.displayName = "ListRow";

/** Props de {@link TableRow}. */
export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  /**
   * `id` de un elemento interactivo de dentro de la fila. Pulsar la fila lo
   * pulsa a él, que es la acción principal de la fila y nunca una secundaria.
   *
   * Es solo para el ratón. No añade `role`, ni `tabIndex`, ni tecla: el destino
   * ya está en la fila y el teclado y el lector de pantalla llegan a él por su
   * cuenta. Poner encima un `role="button"` con su tecla duplicaría la acción y
   * dejaría a la fila anunciándose como botón cuando no lo es.
   */
  clickDelegate?: string;
};

/* Elementos que ya hacen algo por su cuenta: un clic ahí se queda ahí, y no
   pasa a la fila. */
const INTERACTIVE =
  "a,button,input,select,textarea,label,summary,[role=button],[role=link],[role=checkbox],[contenteditable=true]";

const useRowDelegate = (clickDelegate: string | undefined) => {
  const row = React.useRef<HTMLElement | null>(null);

  const onPress = (event: React.MouseEvent<HTMLElement>) => {
    if (!clickDelegate || event.defaultPrevented || event.button !== 0) return;
    if ((event.target as HTMLElement | null)?.closest(INTERACTIVE)) return;
    /* Arrastrar para seleccionar texto termina en un clic sobre la fila, y no
       es lo mismo que pulsarla. */
    if (!(window.getSelection()?.isCollapsed ?? true)) return;

    const inside = row.current?.querySelector<HTMLElement>(`#${CSS.escape(clickDelegate)}`);
    (inside ?? document.getElementById(clickDelegate))?.click();
  };

  return { row, onPress };
};

/** Una fila. */
export const TableRow: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TableRowProps> & React.RefAttributes<HTMLTableRowElement>
> = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, clickDelegate, onClick, ...props }, ref) => {
    const { mode } = React.useContext(TableCtx);
    const { row, onPress } = useRowDelegate(clickDelegate);

    const press = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLTableRowElement>);
      onPress(event);
    };

    if (mode === "list") {
      return (
        <ListRow
          ref={row as React.Ref<HTMLLIElement>}
          className={className}
          clickDelegate={clickDelegate}
          onClick={press}
          {...(props as React.HTMLAttributes<HTMLLIElement>)}
        >
          {children}
        </ListRow>
      );
    }

    /* Cada celda recibe el número de columna en la que cae. Es lo que le permite
       alinearse sola cuando su columna es numérica, sin que quien escribe la
       tabla tenga que repetir el formato celda por celda. */
    const numbered = React.Children.toArray(children).map((child, i) =>
      React.isValidElement(child) ? (
        <ColumnCtx.Provider key={child.key} value={i}>
          {child}
        </ColumnCtx.Provider>
      ) : (
        child
      ),
    );

    return (
      <tr
        data-slot="table-row"
        ref={(node) => {
          row.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onClick={press}
        /* Apuntar una fila la deja del mismo tono que el encabezado: un solo valor
           para «superficie que no es la del contenido». Elegida baja un paso más,
           para que se distinga de la que solo se apunta.

           El color del filete se repite aquí aunque ya lo ponga `divide-y` en el
           cuerpo, porque `divide-*` no alcanza a la última fila: su regla es
           `:not(:last-child)`, y sin ella el color cae a `currentColor`, o sea
           al del texto. No se ve mientras el filete mide 0, pero al reordenar la
           última fila deja de serlo, gana su píxel y arranca desde casi negro.

           Y la transición se limita al fondo, que es lo único que cambia al
           apuntarla o elegirla. Con `transition-colors` entraba también el color
           del borde, así que ese píxel no aparecía ya claro sino oscureciéndose
           y aclarándose durante 150ms. */
        className={cn(
          "border-border-subtle transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover data-[state=selected]:bg-secondary",
          clickDelegate && "cursor-pointer",
          className,
        )}
        {...props}
      >
        {numbered}
      </tr>
    );
  },
);
TableRow.displayName = "TableRow";

/** Props de {@link TableHead}. */
export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  /** Papel de la columna cuando la tabla se lee como lista. */
  listSlot?: ListSlot;

  /** Alineación y numeración de la columna. */
  format?: ColumnFormat;
};

/** Una celda de encabezado. */
export const TableHead: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TableHeadProps> & React.RefAttributes<HTMLTableCellElement>
> = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, listSlot: _listSlot, format, ...props }, ref) => (
    <th
      data-slot="table-head"
      ref={ref}
      /* Mismo tamaño que una celda del cuerpo: el encabezado se distingue por el
         peso y el color, no por ser más pequeño. Encogerlo además desalineaba la
         banda, que salía cuatro píxeles más baja que una fila. */
      className={cn(
        "bg-muted px-1.5 py-2 text-left align-middle text-sm font-medium whitespace-nowrap text-muted-foreground first:ps-3 last:pe-3",
        isNumeric(format) && "text-end",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

/** Una celda de datos. */
export const TableCell: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.TdHTMLAttributes<HTMLTableCellElement>> &
    React.RefAttributes<HTMLTableCellElement>
> = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    const { columns } = React.useContext(TableCtx);
    const column = React.useContext(ColumnCtx);

    return (
      <td
        data-slot="table-cell"
        ref={ref}
        className={cn(
          "px-1.5 py-2 align-middle text-sm text-foreground first:ps-3 last:pe-3",
          isNumeric(columns[column]?.format) && "text-end tabular-nums",
          isCode(columns[column]?.format) && "font-mono",
          className,
        )}
        {...props}
      />
    );
  },
);
TableCell.displayName = "TableCell";

/** El `<caption>`, que describe la tabla para quien la lee con lector de pantalla. */
export const TableCaption: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.HTMLAttributes<HTMLTableCaptionElement>> &
    React.RefAttributes<HTMLTableCaptionElement>
> = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => {
    const { mode } = React.useContext(TableCtx);
    const shared = "mt-3 mb-2 px-3 text-sm text-muted-foreground";

    if (mode === "list") {
      return (
        <div
          data-slot="table-caption"
          className={cn(shared, className)}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        />
      );
    }

    return (
      <caption data-slot="table-caption" ref={ref} className={cn(shared, className)} {...props} />
    );
  },
);
TableCaption.displayName = "TableCaption";
