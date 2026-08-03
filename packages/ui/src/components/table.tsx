import * as React from "react";

import { cn } from "@/lib/cn";

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      data-slot="table"
      ref={ref}
      className={cn("w-full border-collapse text-sm text-foreground", className)}
      {...props}
    />
  ),
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
    /* El filete va arriba de cada fila y no debajo, que es como lo reparte
       Polaris: así la última fila no cierra con una raya suelta contra el borde
       de la tarjeta, y la primera queda separada del encabezado sin regla
       aparte. `divide-y` hace exactamente eso —borde superior salvo en la
       primera—, pero aquí sí la queremos, que es la que hace de línea del
       encabezado. */
    className={cn("border-t border-border divide-y divide-border", className)}
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
    className={cn("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
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
      "px-3 py-2 text-left align-middle text-xs font-medium text-muted-foreground",
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
    className={cn("px-3 py-1.5 align-middle text-sm text-foreground", className)}
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
    className={cn("mt-3 mb-2 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";
