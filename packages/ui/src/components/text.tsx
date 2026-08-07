import * as React from "react";

import { cn } from "@/lib/cn";

export type TextProps = React.ComponentProps<"p"> & {
  /** Etiqueta HTML a renderizar. El tamaño es independiente de la semántica. */
  as?: React.ElementType;

  size?: "2xs" | "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  tone?: "default" | "muted" | "primary" | "success" | "warning" | "danger" | "info";
  align?: "start" | "center" | "end";

  /** Corta en una línea con elipsis. */
  truncate?: boolean;

  /** Corta a N líneas con elipsis. Tiene prioridad sobre `truncate`. */
  lines?: 2 | 3 | 4;

  /** Evita que la última línea quede huérfana. Útil en títulos. */
  balance?: boolean;
};

/* Los mapas son estáticos a propósito. Tailwind escanea el código fuente en
   build y nunca genera una clase construida por interpolación. */
const sizeClasses: Record<NonNullable<TextProps["size"]>, string> = {
  "2xs": "text-2xs",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

const weightClasses: Record<NonNullable<TextProps["weight"]>, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const toneClasses: Record<NonNullable<TextProps["tone"]>, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-info",
};

const alignClasses: Record<NonNullable<TextProps["align"]>, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const lineClasses: Record<NonNullable<TextProps["lines"]>, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
};

/**
 * Primitiva tipográfica. Cada `size` trae su interlineado y su tracking
 * emparejados desde los tokens, así que no hay que combinar `text-*` con
 * `leading-*` y `tracking-*` a mano.
 *
 * `as` y `size` son independientes: un `h2` puede verse pequeño sin dejar de
 * ser un `h2` para el lector de pantalla.
 */
function Text({
  className,
  as: Comp = "p",
  size = "base",
  weight = "normal",
  tone = "default",
  align,
  truncate,
  lines,
  balance,
  ...props
}: TextProps): React.JSX.Element {
  return (
    <Comp
      data-slot="text"
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        toneClasses[tone],
        align && alignClasses[align],
        lines ? lineClasses[lines] : truncate && "truncate",
        balance && "text-balance",
        className,
      )}
      {...props}
    />
  );
}

export { Text };
