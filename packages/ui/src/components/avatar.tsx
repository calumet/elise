import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "@/lib/cn";

export type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
  size?: "xs" | "sm" | "md" | "lg";

  /**
   * Redondo para personas y cuadrado para lo que no lo es: una tienda, una
   * organización, un espacio de trabajo. Es la misma distinción que hace que un
   * logo cuadrado no se recorte en círculo.
   */
  shape?: "circle" | "square";
};

/* El radio del cuadrado va emparejado con el tamaño y no es uno fijo: un radio
   de 10 sobre 24px es casi un círculo, y sobre 48 apenas se nota. */
const tamanos: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "size-6 text-2xs",
  sm: "size-8 text-xs",
  md: "size-10 text-base",
  lg: "size-12 text-lg",
};

const cuadrados: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "rounded-sm",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
};

export const Avatar: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AvatarProps> &
    React.RefAttributes<React.ComponentRef<typeof AvatarPrimitive.Root>>
> = React.forwardRef<React.ComponentRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size = "md", shape = "circle", ...props }, ref) => (
    <AvatarPrimitive.Root
      data-slot="avatar"
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden border border-border bg-muted",
        tamanos[size],
        shape === "circle" ? "rounded-full" : cuadrados[size],
        className,
      )}
      {...props}
    />
  ),
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarImage: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>> &
    React.RefAttributes<React.ComponentRef<typeof AvatarPrimitive.Image>>
> = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    data-slot="avatar-image"
    ref={ref}
    className={cn("h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export const AvatarFallback: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>> &
    React.RefAttributes<React.ComponentRef<typeof AvatarPrimitive.Fallback>>
> = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    data-slot="avatar-fallback"
    ref={ref}
    /* Sin tamaño de texto propio: lo hereda del `Avatar`, que es quien sabe
       cuánto mide. Con uno fijo, las iniciales salían igual de grandes en el de
       24px que en el de 48. */
    className={cn(
      "flex h-full w-full items-center justify-center bg-muted font-semibold text-foreground",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
