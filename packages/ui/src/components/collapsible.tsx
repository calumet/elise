/**
 * Raíz del plegable. Guarda si está abierto.
 *
 * @module
 */

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Raíz del plegable. Guarda si está abierto. */
export const Collapsible = CollapsiblePrimitive.Root;

/** El control que pliega y despliega. */
export const CollapsibleTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>> &
    React.RefAttributes<React.ComponentRef<typeof CollapsiblePrimitive.Trigger>>
> = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    data-slot="collapsible-trigger"
    ref={ref}
    className={cn("text-base", className)}
    {...props}
  />
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

/** El contenido que se pliega, animado en altura. */
export const CollapsibleContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>> &
    React.RefAttributes<React.ComponentRef<typeof CollapsiblePrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    data-slot="collapsible-content"
    ref={ref}
    className={cn(
      "overflow-hidden text-base data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
      className,
    )}
    {...props}
  />
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;
