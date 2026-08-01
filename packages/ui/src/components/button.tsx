import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  tone?: "success" | "warning" | "danger";

  asChild?: boolean;
};

/* El foco sigue la convencion unica del design system (ver CONTRIBUTING.md).
   Antes este componente usaba ring-1/ring-offset-1, distinto del resto. */
const baseClasses =
  "relative inline-flex cursor-pointer items-center justify-center gap-2 text-center font-semibold tracking-tight rounded-md border border-transparent overflow-hidden transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:shadow-none";

/* Los rellenos solidos llevan bisel; al presionar el bisel se invierte hacia
   adentro en lugar de solo oscurecer el fondo. Las variantes outline/ghost usan
   las superficies sutiles en vez de derivar el fondo con opacidad. */
const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid:
    "bg-primary text-primary-foreground shadow-bevel hover:bg-primary/90 active:bg-primary/80 active:shadow-bevel-inset",
  outline:
    "border border-border-strong text-foreground hover:bg-muted active:bg-muted active:shadow-bevel-inset",
  ghost: "text-foreground hover:bg-muted active:bg-muted active:shadow-bevel-inset",
};

const toneOverrides: Record<
  NonNullable<ButtonProps["tone"]>,
  Record<NonNullable<ButtonProps["variant"]>, string>
> = {
  success: {
    solid: "bg-success text-success-foreground hover:bg-success/90 active:bg-success/80",
    outline:
      "border-success text-success hover:bg-success-subtle hover:text-success-subtle-foreground active:bg-success-subtle",
    ghost:
      "text-success hover:bg-success-subtle hover:text-success-subtle-foreground active:bg-success-subtle",
  },
  warning: {
    solid: "bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/80",
    outline:
      "border-warning text-warning hover:bg-warning-subtle hover:text-warning-subtle-foreground active:bg-warning-subtle",
    ghost:
      "text-warning hover:bg-warning-subtle hover:text-warning-subtle-foreground active:bg-warning-subtle",
  },
  danger: {
    solid:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
    outline:
      "border-destructive text-destructive hover:bg-destructive-subtle hover:text-destructive-subtle-foreground active:bg-destructive-subtle",
    ghost:
      "text-destructive hover:bg-destructive-subtle hover:text-destructive-subtle-foreground active:bg-destructive-subtle",
  },
};

export const buttonVariants = ({
  variant = "solid",
  size = "md",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
} = {}) => cn(baseClasses, variantClasses[variant], sizeClasses[size]);

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-11 px-5 text-base",
  icon: "size-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "solid", size = "md", tone, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const toneClass = tone ? toneOverrides[tone][variant] : undefined;
    return (
      <Comp
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          toneClass,
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
