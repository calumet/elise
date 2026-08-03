import * as React from "react";

import { cn } from "@/lib/cn";

export type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /**
   * Quita el marco propio para meter la tabla dentro de una tarjeta que ya lo
   * pone. Con los dos salen dos bordes concéntricos.
   */
  bare?: boolean;

  /** Clases para el marco, no para la tabla. */
  frameClassName?: string;
};

/**
 * Tabla.
 *
 * Trae su propio marco: borde, radio y recorte. La banda del encabezado llega
 * hasta el borde, así que sin recorte sus esquinas cuadradas se salen por
 * encima de cualquier contorno redondeado que la envuelva —y quien la usa no
 * tiene por qué saberlo—. Dentro de una tarjeta que ya lo pone, `bare` lo
 * quita.
 *
 * El marco es un `<div>` aparte y no el propio `<table>` porque también hace de
 * carril de desplazamiento: una tabla que no cabe se desliza dentro del marco
 * en vez de estirar la página.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, bare = false, frameClassName, ...props }, ref) => {
    const tabla = (
      <table
        data-slot="table"
        ref={ref}
        className={cn("w-full border-collapse text-sm text-foreground", className)}
        {...props}
      />
    );

    if (bare) return tabla;

    return (
      <div
        data-slot="table-frame"
        className={cn(
          "w-full overflow-x-auto rounded-xl border border-border bg-card",
          frameClassName,
        )}
      >
        {tabla}
      </div>
    );
  },
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    data-slot="table-header"
    ref={ref}
    /* Sin filete propio: la raya bajo el encabezado la pone el borde superior
       de la primera fila del cuerpo. Con las dos salían dos líneas de 1px
       pegadas. */
    className={cn(className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    data-slot="table-body"
    ref={ref}
    /* `divide-y` pone el filete debajo de cada fila menos de la última, así que
       la tabla no cierra con una raya suelta contra el borde del marco. La línea
       bajo el encabezado la pone este `border-t`, y va un tono más firme que los
       separadores: en Polaris el de la primera fila usa `--p-color-border` y el
       de entre filas `border-secondary`, que es más claro. */
    className={cn("border-t border-border divide-y divide-border-subtle", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    data-slot="table-footer"
    ref={ref}
    className={cn("border-t border-border font-semibold text-foreground", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    data-slot="table-row"
    ref={ref}
    /* Apuntar una fila la deja del mismo tono que el encabezado, que es lo que
       hace Polaris: un solo valor para «superficie que no es la del contenido».
       Elegida baja un paso más, para que se distinga de la que solo se apunta. */
    className={cn("transition-colors hover:bg-muted data-[state=selected]:bg-secondary", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    data-slot="table-head"
    ref={ref}
    className={cn(
      "bg-muted px-1.5 py-2 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground first:ps-3 last:pe-3",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    data-slot="table-cell"
    ref={ref}
    className={cn(
      "px-1.5 py-1.5 align-middle text-sm text-foreground first:ps-3 last:pe-3",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    data-slot="table-caption"
    ref={ref}
    className={cn("mt-3 mb-2 px-3 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";
