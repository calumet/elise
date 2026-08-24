/**
 * Raíz de las pestañas. Guarda cuál está activa, y admite `value` con `onValueChange` para controlarlo.
 *
 * @module
 */

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Raíz de las pestañas. Guarda cuál está activa, y admite `value` con `onValueChange` para controlarlo. */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>): React.JSX.Element {
  return <TabsPrimitive.Root data-slot="tabs" className={cn(className)} {...props} />;
}

/** La fila de pestañas. Recorre con las flechas del teclado, y se desplaza a lo ancho donde no cabe. */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>): React.JSX.Element {
  return (
    <div
      data-slot="tabs-list-scroll"
      /* El recorte va acá y no en la lista: `overflow-x` arrastra a `overflow-y`
         y le cortaría el anillo de foco a las pestañas. El relleno le hace sitio
         dentro y el margen negativo lo devuelve. */
      className="-m-1 max-w-[calc(100%+0.5rem)] overflow-x-auto p-1"
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "inline-flex items-center gap-1 border-b border-border text-base font-semibold",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/** Una pestaña. */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>): React.JSX.Element {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-t-sm border-b-2 border-transparent px-4 text-base font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** El panel de una pestaña, enlazado a su disparador. */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>): React.JSX.Element {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-2 rounded-sm p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
