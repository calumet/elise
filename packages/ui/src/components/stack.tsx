import * as React from "react";

import type { SpaceScale } from "./box";

import { cn } from "@/lib/cn";

type StackBase = React.ComponentProps<"div"> & {
  as?: React.ElementType;
  gap?: SpaceScale;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
};

export type BlockStackProps = StackBase;

export type InlineStackProps = StackBase & {
  /** Permite que los hijos bajen de línea cuando no entran. */
  wrap?: boolean;
};

export const gapClasses: Record<SpaceScale, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

const alignClasses: Record<NonNullable<StackBase["align"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyClasses: Record<NonNullable<StackBase["justify"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * Apila en el eje de bloque (vertical en escritura horizontal).
 *
 * Se nombra por el eje lógico de CSS y no por "vertical", para que siga siendo
 * correcto en modos de escritura distintos.
 */
function BlockStack({
  className,
  as: Comp = "div",
  gap = 0,
  align,
  justify,
  ...props
}: BlockStackProps): React.JSX.Element {
  return (
    <Comp
      data-slot="block-stack"
      className={cn(
        "flex flex-col",
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className,
      )}
      {...props}
    />
  );
}

/** Apila en el eje en línea (horizontal en escritura horizontal). */
function InlineStack({
  className,
  as: Comp = "div",
  gap = 0,
  align = "center",
  justify,
  wrap = true,
  ...props
}: InlineStackProps): React.JSX.Element {
  return (
    <Comp
      data-slot="inline-stack"
      className={cn(
        "flex flex-row",
        wrap ? "flex-wrap" : "flex-nowrap",
        gapClasses[gap],
        alignClasses[align],
        justify && justifyClasses[justify],
        className,
      )}
      {...props}
    />
  );
}

export { BlockStack, InlineStack };
