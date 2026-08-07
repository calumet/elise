/**
 * Raíz del popover. Guarda si está abierto.
 *
 * @module
 */

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Raíz del popover. Guarda si está abierto. */
export const Popover = PopoverPrimitive.Root;
/** El control que lo abre. */
export const PopoverTrigger = PopoverPrimitive.Trigger;
/* Ancla el panel a un elemento sin que ese elemento controle la apertura. Hace
   falta cuando lo que abre el panel es otra cosa, por ejemplo un campo de
   búsqueda cuyo panel sigue abierto mientras haya texto. Con PopoverTrigger,
   pulsar el campo para seguir escribiendo lo cerraría. */
/** Fija a qué elemento se ancla el panel, cuando no es el disparador. */
export const PopoverAnchor = PopoverPrimitive.Anchor;

/** El panel flotante, que se reubica solo si no entra donde debía. */
export const PopoverContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>> &
    React.RefAttributes<React.ComponentRef<typeof PopoverPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      data-slot="popover-content"
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-popover w-72 rounded-xl border border-border bg-popover p-4 text-foreground shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
