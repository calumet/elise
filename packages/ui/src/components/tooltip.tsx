/**
 * Raíz del tooltip.
 *
 * @module
 */

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Reparte a los tooltips de abajo la demora compartida, para que abrir uno y moverse al siguiente no espere de nuevo. */
function TooltipProvider({
  delayDuration = 250,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>): React.JSX.Element {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

/** Raíz del tooltip. */
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>): React.JSX.Element {
  return <TooltipPrimitive.Root {...props} />;
}

/** El elemento que lo muestra al recibir foco o al pasarle el mouse. */
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>): React.JSX.Element {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/** El globo con el texto. Va corto: no recibe foco y no puede contener controles. */
function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>): React.JSX.Element {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-tooltip w-max max-w-[calc(100vw-1rem)] rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
