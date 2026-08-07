import * as React from "react";

import { cn } from "@/lib/cn";

/** Escala de espaciado compartida por Box, los Stack y Grid. */
export type SpaceScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

export type BoxProps = React.ComponentProps<"div"> & {
  as?: React.ElementType;

  padding?: SpaceScale;
  paddingX?: SpaceScale;
  paddingY?: SpaceScale;

  background?: "none" | "card" | "popover" | "muted" | "secondary" | "accent" | "sidebar";
  border?: boolean | "strong";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl";

  /** Recorta el contenido al radio del contenedor. */
  overflowHidden?: boolean;
};

/* Cada valor de la escala aparece literal en su propio mapa, porque Tailwind no
   detecta las clases construidas por interpolación. */
export const paddingClasses: Record<SpaceScale, string> = {
  0: "p-0",
  1: "p-1",
  2: "p-2",
  3: "p-3",
  4: "p-4",
  5: "p-5",
  6: "p-6",
  8: "p-8",
  10: "p-10",
  12: "p-12",
  16: "p-16",
};

export const paddingXClasses: Record<SpaceScale, string> = {
  0: "px-0",
  1: "px-1",
  2: "px-2",
  3: "px-3",
  4: "px-4",
  5: "px-5",
  6: "px-6",
  8: "px-8",
  10: "px-10",
  12: "px-12",
  16: "px-16",
};

export const paddingYClasses: Record<SpaceScale, string> = {
  0: "py-0",
  1: "py-1",
  2: "py-2",
  3: "py-3",
  4: "py-4",
  5: "py-5",
  6: "py-6",
  8: "py-8",
  10: "py-10",
  12: "py-12",
  16: "py-16",
};

const backgroundClasses: Record<NonNullable<BoxProps["background"]>, string> = {
  none: "",
  card: "bg-card text-card-foreground",
  popover: "bg-popover text-popover-foreground",
  muted: "bg-muted",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  sidebar: "bg-sidebar text-sidebar-foreground",
};

const radiusClasses: Record<NonNullable<BoxProps["radius"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const shadowClasses: Record<NonNullable<BoxProps["shadow"]>, string> = {
  none: "shadow-none",
  xs: "shadow-xs",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
};

/** Las propiedades visuales de una caja, sin lo que la hace un `<div>`. */
export type CajaProps = Pick<
  BoxProps,
  | "padding"
  | "paddingX"
  | "paddingY"
  | "background"
  | "border"
  | "radius"
  | "shadow"
  | "overflowHidden"
>;

/**
 * Traduce esas propiedades a clases. Existe suelto para que otra cosa que sea
 * una caja pero no un `<div>`, como `Clickable`, no vuelva a escribir los mapas
 * y se le vaya la escala por su lado.
 */
export const clasesDeCaja = ({
  padding,
  paddingX,
  paddingY,
  background = "none",
  border,
  radius,
  shadow,
  overflowHidden,
}: CajaProps): string =>
  cn(
    padding !== undefined && paddingClasses[padding],
    paddingX !== undefined && paddingXClasses[paddingX],
    paddingY !== undefined && paddingYClasses[paddingY],
    backgroundClasses[background],
    border && (border === "strong" ? "border border-border-strong" : "border border-border"),
    radius && radiusClasses[radius],
    shadow && shadowClasses[shadow],
    overflowHidden && "overflow-hidden",
  );

/**
 * Contenedor genérico. Solo expone las propiedades que el sistema controla
 * (espaciado, superficie, borde, radio y elevación) y siempre a través de
 * tokens, sin aceptar valores arbitrarios. Para cualquier otra cosa, `className`.
 */
function Box({
  className,
  as: Comp = "div",
  padding,
  paddingX,
  paddingY,
  background,
  border,
  radius,
  shadow,
  overflowHidden,
  ...props
}: BoxProps): React.JSX.Element {
  return (
    <Comp
      data-slot="box"
      className={cn(
        clasesDeCaja({
          padding,
          paddingX,
          paddingY,
          background,
          border,
          radius,
          shadow,
          overflowHidden,
        }),
        className,
      )}
      {...props}
    />
  );
}

export { Box };
