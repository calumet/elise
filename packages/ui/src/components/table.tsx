import * as React from "react";

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
import { Spinner } from "./spinner";

import { cn } from "@/lib/cn";

/**
 * Contorno de superficie: la sombra de 1px por fuera y el bisel por dentro, con
 * el bisel en una capa aparte, un `::after`, en vez de como sombra interior del
 * propio marco.
 *
 * Una sombra interior se pinta por debajo del fondo de los descendientes, así
 * que el encabezado, que lleva fondo opaco, se comía su tramo de bisel: el
 * contorno salía marcado a los lados del cuerpo y liso a los del encabezado. La
 * capa va por encima del contenido y el contorno queda igual en todo el
 * perímetro, que es como Polaris resuelve el suyo.
 *
 * La tarjeta de la tabla de datos lo reutiliza para que los dos marcos se lean
 * iguales.
 */
export const SUPERFICIE =
  "relative rounded-xl bg-card shadow-surface after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-surface-bevel";

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

/** `numeric` y `currency` alinean a la derecha y numeran a ancho fijo. */
export type ColumnFormat = "base" | "numeric" | "currency";

type Columna = {
  listSlot?: ListSlot;
  format: ColumnFormat;
  encabezado: React.ReactNode;
};

type Modo = "table" | "list";

const TablaCtx = React.createContext<{ modo: Modo; columnas: Columna[]; ranuras: ListSlot[] }>({
  modo: "table",
  columnas: [],
  ranuras: [],
});

/** Índice de la columna en la que cae una celda, puesto por su fila. */
const ColumnaCtx = React.createContext(0);

const esNumerica = (format: ColumnFormat | undefined) =>
  format === "numeric" || format === "currency";

/* El corte de Polaris para pasar de tabla a lista: 30.625em. */
const ANCHO_MINIMO_DE_TABLA = 490;

const primero = <P,>(nodos: React.ReactNode, tipo: unknown) =>
  React.Children.toArray(nodos).find(
    (n): n is React.ReactElement<P> => React.isValidElement(n) && n.type === tipo,
  );

/**
 * Saca de la fila de encabezado el papel, el formato y el rótulo de cada
 * columna. La lista los necesita: sin ellos no hay forma de saber cuál es el
 * dato principal de una fila ni con qué rótulo sale un valor suelto.
 *
 * Se lee del árbol y no de un prop aparte para que el marcado sea el mismo que
 * el de `s-table`: la información ya está escrita una vez en el encabezado y
 * repetirla en cada celda es lo que se quiere evitar.
 */
const recogerColumnas = (hijos: React.ReactNode): Columna[] => {
  const encabezado = primero<{ children?: React.ReactNode }>(hijos, TableHeader);
  const fila =
    encabezado && primero<{ children?: React.ReactNode }>(encabezado.props.children, TableRow);
  if (!fila) return [];
  return React.Children.toArray(fila.props.children)
    .filter((n): n is React.ReactElement<TableHeadProps> => React.isValidElement(n))
    .map((celda) => ({
      listSlot: celda.props.listSlot,
      format: celda.props.format ?? "base",
      encabezado: celda.props.children,
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
const repartirRanuras = (columnas: Columna[]): ListSlot[] => {
  const tomadas = new Set<ListSlot>();
  const ranuras: (ListSlot | undefined)[] = columnas.map((columna) => {
    const ranura = columna.listSlot;
    if (!ranura) return undefined;
    if (ranura === "inline" || ranura === "labeled") return ranura;
    if (tomadas.has(ranura)) return "labeled";
    tomadas.add(ranura);
    return ranura;
  });

  if (!ranuras.includes("primary")) {
    const libre = ranuras.indexOf(undefined);
    if (libre >= 0) ranuras[libre] = "primary";
  }

  return ranuras.map((ranura) => ranura ?? "labeled");
};

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Quita el marco propio para meter la tabla dentro de una tarjeta que ya lo
   * pone. Con los dos salen dos bordes concéntricos.
   */
  bare?: boolean;

  /** Clases para el marco, no para la tabla. */
  frameClassName?: string;

  /**
   * Cómo se leen las filas.
   *
   * - `table`: siempre tabla.
   * - `list`: siempre lista.
   * - `auto`: tabla mientras quepa y lista cuando no. Es el de `s-table`.
   */
  variant?: "auto" | "list" | "table";

  /** Pone la franja de paginar al pie. */
  paginate?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;

  /**
   * Saltar a la primera y a la última. `s-table` solo tiene anterior y
   * siguiente, así que estos dos pasos solo aparecen si les das manejador: una
   * tabla que sepa cuántas páginas hay puede ofrecerlos, y una que vaya con
   * cursor, que no lo sabe, se queda con los dos de siempre.
   */
  onFirstPage?: () => void;
  onLastPage?: () => void;

  /** Lo que va entre los dos pasos, del estilo «1-20 de 340». */
  paginationLabel?: React.ReactNode;

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
};

/**
 * Tabla.
 *
 * Trae su propio marco: contorno, radio y recorte. El contorno no es un borde
 * plano sino un bisel, con el filo de abajo más pesado que el de arriba, más una
 * sombra de 1px, que es como Polaris apoya sus superficies: con un borde
 * uniforme el plano no tiene arriba ni abajo y la tabla se lee recortada en el
 * lienzo en vez de puesta sobre él. La banda del encabezado llega
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
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
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
      filters,
      loading = false,
      loadingLabel,
      children,
      ...props
    },
    ref,
  ) => {
    const [cabe, setCabe] = React.useState(true);
    const contenedor = React.useRef<HTMLDivElement | null>(null);

    React.useLayoutEffect(() => {
      if (variant !== "auto") return;
      /* Se mide el hueco disponible, o sea el padre, y no lo que ocupa la tabla: una
         tabla que no cabe empuja a su propio contenedor, así que midiéndola a
         ella el ancho siempre daría de sobra y nunca pasaría a lista. */
      const hueco = contenedor.current?.parentElement;
      if (!hueco) return;
      const observador = new ResizeObserver(([entrada]) => {
        setCabe(entrada.contentRect.width >= ANCHO_MINIMO_DE_TABLA);
      });
      observador.observe(hueco);
      return () => observador.disconnect();
    }, [variant]);

    const modo: Modo = variant === "auto" ? (cabe ? "table" : "list") : variant;

    const columnas = React.useMemo(() => recogerColumnas(children), [children]);
    const ranuras = React.useMemo(() => repartirRanuras(columnas), [columnas]);
    const contexto = React.useMemo(() => ({ modo, columnas, ranuras }), [modo, columnas, ranuras]);

    const cuerpo =
      modo === "list" ? (
        <div data-slot="table-list" className={cn("w-full text-sm text-foreground", className)}>
          {children}
        </div>
      ) : (
        <table
          data-slot="table"
          ref={ref}
          className={cn("w-full border-collapse text-sm text-foreground", className)}
          {...props}
        >
          {children}
        </table>
      );

    const franja = paginate ? (
      <Pagination variant="table" className="rounded-b-[inherit]" inert={loading || undefined}>
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
    ) : null;

    const barra = filters ? (
      <div data-slot="table-filters" className="border-b border-border px-3 py-3">
        {filters}
      </div>
    ) : null;

    /* El aviso se recorta contra este `div`: entra deslizándose desde arriba y
       sin recorte se vería flotando por encima de la tarjeta antes de entrar.
       El radio va aquí y no en el carril porque este es ahora el que toca las
       esquinas de la tarjeta. */
    const zona = (
      <div className="relative overflow-hidden rounded-[inherit]">
        <div className="w-full overflow-x-auto" inert={loading || undefined}>
          {cuerpo}
        </div>
        <div
          data-slot="table-loading"
          aria-hidden={!loading}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center bg-card px-3 py-2 shadow-md",
            "transition-[transform,opacity,visibility] duration-(--duration-fast) ease-out",
            loading ? "translate-y-0 opacity-100" : "invisible -translate-y-full opacity-0",
          )}
        >
          <span className="flex items-center gap-2 rounded-md bg-info-subtle px-2 py-1 text-sm text-info-subtle-foreground">
            <Spinner size="sm" label="" />
            {loadingLabel}
          </span>
        </div>
      </div>
    );

    return (
      <TablaCtx.Provider value={contexto}>
        {bare ? (
          <div
            ref={contenedor}
            data-slot="table-bare"
            aria-busy={loading || undefined}
            className={cn("w-full", frameClassName)}
          >
            {barra}
            {zona}
            {franja}
          </div>
        ) : (
          <div
            ref={contenedor}
            data-slot="table-frame"
            aria-busy={loading || undefined}
            className={cn(SUPERFICIE, "w-full", frameClassName)}
          >
            {barra}
            {zona}
            {franja}
          </div>
        )}
      </TablaCtx.Provider>
    );
  },
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { modo } = React.useContext(TablaCtx);
  /* En lista el encabezado no se dibuja: sus rótulos ya salen pegados a cada
     valor dentro de la fila. */
  if (modo === "list") return null;
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
});
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { modo } = React.useContext(TablaCtx);
  /* `divide-y` pone el filete debajo de cada fila menos de la última, así que
     la tabla no cierra con una raya suelta contra el borde del marco. La línea
     bajo el encabezado la pone este `border-t`, y va un tono más firme que los
     separadores: en Polaris el de la primera fila usa `--p-color-border` y el
     de entre filas `border-secondary`, que es más claro. */
  const filetes = "border-t border-border divide-y divide-border-subtle";

  if (modo === "list") {
    return (
      <ul
        data-slot="table-body"
        className={cn("list-none", filetes, className)}
        {...(props as React.HTMLAttributes<HTMLUListElement>)}
      />
    );
  }

  return <tbody data-slot="table-body" ref={ref} className={cn(filetes, className)} {...props} />;
});
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const { modo } = React.useContext(TablaCtx);
  const comunes = "border-t border-border font-semibold text-foreground";

  if (modo === "list") {
    return (
      <div
        data-slot="table-footer"
        className={cn(comunes, "px-3 py-2", className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      />
    );
  }

  return <tfoot data-slot="table-footer" ref={ref} className={cn(comunes, className)} {...props} />;
});
TableFooter.displayName = "TableFooter";

/** Reparte las celdas de una fila por el papel que tenga su columna. */
const FilaDeLista = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & { clickDelegate?: string }
>(({ children, className, clickDelegate, ...props }, ref) => {
  const { columnas, ranuras } = React.useContext(TablaCtx);

  const celdas = React.Children.toArray(children).filter(
    (n): n is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(n),
  );

  const de = (ranura: ListSlot) => {
    const i = ranuras.indexOf(ranura);
    return i >= 0 ? celdas[i]?.props.children : undefined;
  };
  const todas = (ranura: ListSlot) =>
    celdas
      .map((celda, i) => ({
        valor: celda.props.children,
        columna: columnas[i],
        ranura: ranuras[i],
      }))
      .filter((c) => c.ranura === ranura);

  const antetitulo = de("kicker");
  const principal = de("primary");
  const secundaria = de("secondary");

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
        clickDelegate && "cursor-pointer hover:bg-muted",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-40 flex-1 flex-col gap-0.5">
        {antetitulo ? (
          <span className="truncate text-xs text-muted-foreground">{antetitulo}</span>
        ) : null}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {principal ? (
            <span className="min-w-0 truncate font-medium text-foreground">{principal}</span>
          ) : null}
          {todas("inline").map((c, i) => (
            <span key={i} className="shrink-0">
              {c.valor}
            </span>
          ))}
        </div>
        {secundaria ? <span className="truncate text-muted-foreground">{secundaria}</span> : null}
      </div>

      {todas("labeled").length > 0 ? (
        <div className="flex flex-wrap items-start justify-end gap-x-4 gap-y-1">
          {todas("labeled").map((c, i) => (
            <div key={i} className="flex flex-col items-end gap-0.5">
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {c.columna?.encabezado}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-foreground",
                  esNumerica(c.columna?.format) && "tabular-nums",
                )}
              >
                {c.valor}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </li>
  );
});
FilaDeLista.displayName = "FilaDeLista";

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
const INTERACTIVOS =
  "a,button,input,select,textarea,label,summary,[role=button],[role=link],[role=checkbox],[contenteditable=true]";

const usarDelegado = (clickDelegate: string | undefined) => {
  const fila = React.useRef<HTMLElement | null>(null);

  const alPulsar = (evento: React.MouseEvent<HTMLElement>) => {
    if (!clickDelegate || evento.defaultPrevented || evento.button !== 0) return;
    if ((evento.target as HTMLElement | null)?.closest(INTERACTIVOS)) return;
    /* Arrastrar para seleccionar texto termina en un clic sobre la fila, y no
       es lo mismo que pulsarla. */
    if (!(window.getSelection()?.isCollapsed ?? true)) return;

    const dentro = fila.current?.querySelector<HTMLElement>(`#${CSS.escape(clickDelegate)}`);
    (dentro ?? document.getElementById(clickDelegate))?.click();
  };

  return { fila, alPulsar };
};

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, clickDelegate, onClick, ...props }, ref) => {
    const { modo } = React.useContext(TablaCtx);
    const { fila, alPulsar } = usarDelegado(clickDelegate);

    const pulsar = (evento: React.MouseEvent<HTMLElement>) => {
      onClick?.(evento as React.MouseEvent<HTMLTableRowElement>);
      alPulsar(evento);
    };

    if (modo === "list") {
      return (
        <FilaDeLista
          ref={fila as React.Ref<HTMLLIElement>}
          className={className}
          clickDelegate={clickDelegate}
          onClick={pulsar}
          {...(props as React.HTMLAttributes<HTMLLIElement>)}
        >
          {children}
        </FilaDeLista>
      );
    }

    /* Cada celda recibe el número de columna en la que cae. Es lo que le permite
       alinearse sola cuando su columna es numérica, sin que quien escribe la
       tabla tenga que repetir el formato celda por celda. */
    const numeradas = React.Children.toArray(children).map((hijo, i) =>
      React.isValidElement(hijo) ? (
        <ColumnaCtx.Provider key={hijo.key ?? i} value={i}>
          {hijo}
        </ColumnaCtx.Provider>
      ) : (
        hijo
      ),
    );

    return (
      <tr
        data-slot="table-row"
        ref={(nodo) => {
          fila.current = nodo;
          if (typeof ref === "function") ref(nodo);
          else if (ref) ref.current = nodo;
        }}
        onClick={pulsar}
        /* Apuntar una fila la deja del mismo tono que el encabezado, que es lo que
           hace Polaris: un solo valor para «superficie que no es la del contenido».
           Elegida baja un paso más, para que se distinga de la que solo se apunta. */
        className={cn(
          "transition-colors hover:bg-muted data-[state=selected]:bg-secondary",
          clickDelegate && "cursor-pointer",
          className,
        )}
        {...props}
      >
        {numeradas}
      </tr>
    );
  },
);
TableRow.displayName = "TableRow";

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  /** Papel de la columna cuando la tabla se lee como lista. */
  listSlot?: ListSlot;

  /** Alineación y numeración de la columna. */
  format?: ColumnFormat;
};

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, listSlot: _listSlot, format, ...props }, ref) => (
    <th
      data-slot="table-head"
      ref={ref}
      /* Mismo tamaño que una celda del cuerpo: el encabezado se distingue por el
         peso y el color, no por ser más pequeño. Encogerlo además desalineaba la
         banda, que salía cuatro píxeles más baja que una fila. */
      className={cn(
        "bg-muted px-1.5 py-2 text-left align-middle text-sm font-medium whitespace-nowrap text-muted-foreground first:ps-3 last:pe-3",
        esNumerica(format) && "text-end",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { columnas } = React.useContext(TablaCtx);
  const columna = React.useContext(ColumnaCtx);

  return (
    <td
      data-slot="table-cell"
      ref={ref}
      className={cn(
        "px-1.5 py-2 align-middle text-sm text-foreground first:ps-3 last:pe-3",
        esNumerica(columnas[columna]?.format) && "text-end tabular-nums",
        className,
      )}
      {...props}
    />
  );
});
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  const { modo } = React.useContext(TablaCtx);
  const comunes = "mt-3 mb-2 px-3 text-sm text-muted-foreground";

  if (modo === "list") {
    return (
      <div
        data-slot="table-caption"
        className={cn(comunes, className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      />
    );
  }

  return (
    <caption data-slot="table-caption" ref={ref} className={cn(comunes, className)} {...props} />
  );
});
TableCaption.displayName = "TableCaption";
