import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  tone?: "success" | "warning" | "danger";

  asChild?: boolean;
};

const baseClasses =
  "relative inline-flex items-center justify-center gap-2 text-center font-semibold tracking-tight rounded-sm border border-transparent overflow-hidden transition-colors duration-200 outline-offset-4 hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-focus focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-border";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid: "bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-active",
  outline:
    "border border-border text-foreground hover:bg-muted active:border-border-strong active:bg-muted",
  ghost: "text-foreground hover:bg-muted active:bg-muted",
};

const toneOverrides: Record<
  NonNullable<ButtonProps["tone"]>,
  { solid: string; outline?: string; ghost?: string; contrast?: string }
> = {
  success: {
    solid: "bg-success text-primary-contrast hover:bg-success/90 active:bg-success/90",
  },
  warning: {
    solid: "bg-warning text-primary-contrast hover:bg-warning/90 active:bg-warning/90",
  },
  danger: {
    solid: "bg-danger text-primary-contrast hover:bg-danger/90 active:bg-danger/90",
  },
};

export const buttonVariants = ({
  variant,
  size,
}: {
  variant: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) => {
  if (!variant) return baseClasses;
  if (!size) return cn(baseClasses, variantClasses[variant]);
  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
};

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
