import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

export type BadgeProps = React.ComponentProps<"span"> & {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
  variant?: "subtle" | "solid" | "outline";
  size?: "sm" | "md";

  asChild?: boolean;
};

const baseClasses =
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-transparent font-semibold [&>svg]:size-3 [&>svg]:shrink-0";

const sizeClasses: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "h-5 px-2 text-2xs",
  md: "h-6 px-2.5 text-xs",
};

/* Las superficies suaves salen de los tokens `-subtle` y no de opacidad sobre el
   color sólido, porque el alfa sobre fondo oscuro se enloda. Ver docs/temas.md.

   La variante `outline` usa el color sólido para el borde pero el `-subtle-foreground`
   para el texto, ya que los sólidos están calibrados como relleno. Usados como
   texto sobre la página no llegan a 4.5:1 (`warning` mide 2.18:1). */
const toneClasses: Record<
  NonNullable<BadgeProps["tone"]>,
  Record<NonNullable<BadgeProps["variant"]>, string>
> = {
  neutral: {
    subtle: "bg-muted text-muted-foreground",
    solid: "bg-foreground text-background",
    outline: "border-border-strong text-foreground",
  },
  brand: {
    subtle: "bg-accent text-accent-foreground",
    solid: "bg-primary text-primary-foreground",
    outline: "border-primary text-accent-foreground",
  },
  success: {
    subtle: "bg-success-subtle text-success-subtle-foreground",
    solid: "bg-success text-success-foreground",
    outline: "border-success text-success-subtle-foreground",
  },
  warning: {
    subtle: "bg-warning-subtle text-warning-subtle-foreground",
    solid: "bg-warning text-warning-foreground",
    outline: "border-warning text-warning-subtle-foreground",
  },
  danger: {
    subtle: "bg-destructive-subtle text-destructive-subtle-foreground",
    solid: "bg-destructive text-destructive-foreground",
    outline: "border-destructive text-destructive-subtle-foreground",
  },
  info: {
    subtle: "bg-info-subtle text-info-subtle-foreground",
    solid: "bg-info text-info-foreground",
    outline: "border-info text-info-subtle-foreground",
  },
};

export const badgeVariants = ({
  tone = "neutral",
  variant = "subtle",
  size = "md",
}: Pick<BadgeProps, "tone" | "variant" | "size"> = {}): string =>
  cn(baseClasses, toneClasses[tone][variant], sizeClasses[size]);

function Badge({
  className,
  tone = "neutral",
  variant = "subtle",
  size = "md",
  asChild = false,
  ...props
}: BadgeProps): React.JSX.Element {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      data-tone={tone}
      className={cn(baseClasses, toneClasses[tone][variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export { Badge };
