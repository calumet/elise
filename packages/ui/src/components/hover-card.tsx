/**
 * Raíz de la tarjeta al pasar el mouse. Solo funciona con puntero, así que su contenido tiene que ser accesible por otra vía.
 *
 * @module
 */

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Raíz de la tarjeta al pasar el mouse. Solo funciona con puntero, así que su contenido tiene que ser accesible por otra vía. */
export const HoverCard = HoverCardPrimitive.Root;
/** El elemento que la abre al pasarle el mouse por encima. */
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

/** La tarjeta flotante. */
export const HoverCardContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>> &
    React.RefAttributes<React.ComponentRef<typeof HoverCardPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => (
  <HoverCardPrimitive.Content
    data-slot="hover-card-content"
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-popover w-80 rounded-xl border border-border bg-popover p-4 text-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
