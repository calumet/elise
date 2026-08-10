/**
 * Rejilla de columnas, mobile-first (el ancho más chico manda por defecto).
 * `columns` aplica desde ahí y `smColumns` / `mdColumns` / `lgColumns` lo van
 * sobrescribiendo hacia arriba.
 *
 * @module
 */

import * as React from "react";

import type { SpaceScale } from "./box";
import { gapClasses } from "./stack";

import { cn } from "@/lib/cn";

/** Las columnas que admite `Grid`. */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;

/** Props de {@link Grid}. */
export type GridProps = React.ComponentProps<"div"> & {
  as?: React.ElementType;

  /** Columnas en el ancho más chico. Los demás breakpoints heredan de este. */
  columns?: GridColumns;
  smColumns?: GridColumns;
  mdColumns?: GridColumns;
  lgColumns?: GridColumns;

  gap?: SpaceScale;
  align?: "start" | "center" | "end" | "stretch";
};

/* Un mapa por breakpoint. Tailwind necesita la clase literal en el fuente, así
   que `sm:grid-cols-${n}` no se generaría. */
const columnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const smColumnClasses: Record<GridColumns, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};

const mdColumnClasses: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};

const lgColumnClasses: Record<GridColumns, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

const alignClasses: Record<NonNullable<GridProps["align"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

/**
 * Rejilla de columnas, mobile-first (el ancho más chico manda por defecto).
 * `columns` aplica desde ahí y `smColumns` / `mdColumns` / `lgColumns` lo van
 * sobrescribiendo hacia arriba.
 */
function Grid({
  className,
  as: Comp = "div",
  columns = 1,
  smColumns,
  mdColumns,
  lgColumns,
  gap = 4,
  align,
  ...props
}: GridProps): React.JSX.Element {
  return (
    <Comp
      data-slot="grid"
      className={cn(
        "grid",
        columnClasses[columns],
        smColumns && smColumnClasses[smColumns],
        mdColumns && mdColumnClasses[mdColumns],
        lgColumns && lgColumnClasses[lgColumns],
        gapClasses[gap],
        align && alignClasses[align],
        className,
      )}
      {...props}
    />
  );
}

export { Grid };
