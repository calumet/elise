/**
 * Centra el contenido y le pone un ancho máximo. Evita que cada pantalla
 * invente su propio `max-w-*` y que las líneas de texto queden demasiado largas
 * para leerse.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link Container}. */
export type ContainerProps = React.ComponentProps<"div"> & {
  as?: React.ElementType;

  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";

  /** Padding horizontal responsive. Ponelo en `false` si el padre ya lo trae. */
  gutter?: boolean;
};

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  xs: "max-w-lg",
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

const gutterClasses =
  "px-4 sm:px-6 lg:px-8 in-[[data-slot=app-shell-main]:not([data-fill])]:px-0 sm:in-[[data-slot=app-shell-main]:not([data-fill])]:px-0 lg:in-[[data-slot=app-shell-main]:not([data-fill])]:px-0";

/**
 * Centra el contenido y le pone un ancho máximo. Evita que cada pantalla
 * invente su propio `max-w-*` y que las líneas de texto queden demasiado largas
 * para leerse.
 */
function Container({
  className,
  as: Comp = "div",
  size = "lg",
  gutter = true,
  ...props
}: ContainerProps): React.JSX.Element {
  return (
    <Comp
      data-slot="container"
      className={cn("mx-auto w-full", sizeClasses[size], gutter && gutterClasses, className)}
      {...props}
    />
  );
}

export { Container };
