import * as React from "react";

import { cn } from "@/lib/cn";

export type ContainerProps = React.ComponentProps<"div"> & {
  as?: React.ElementType;

  size?: "sm" | "md" | "lg" | "xl" | "full";

  /** Padding horizontal responsive. Ponelo en `false` si el padre ya lo trae. */
  gutter?: boolean;
};

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

/**
 * Centra el contenido y le pone un ancho maximo. Es lo que evita que cada
 * pantalla invente su propio `max-w-*` y que las lineas de texto queden
 * demasiado largas para leerse.
 */
function Container({
  className,
  as: Comp = "div",
  size = "lg",
  gutter = true,
  ...props
}: ContainerProps) {
  return (
    <Comp
      data-slot="container"
      className={cn(
        "mx-auto w-full",
        sizeClasses[size],
        gutter && "px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}

export { Container };
