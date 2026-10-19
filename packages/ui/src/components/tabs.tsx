/**
 * Raíz de las pestañas. Guarda cuál está activa, y admite `value` con `onValueChange` para controlarlo.
 *
 * @module
 */

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link TabsList}. */
export type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: "underline" | "capsule";
};

const VariantContext = React.createContext<NonNullable<TabsListProps["variant"]>>("underline");

/** Raíz de las pestañas. Guarda cuál está activa, y admite `value` con `onValueChange` para controlarlo. */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>): React.JSX.Element {
  return <TabsPrimitive.Root data-slot="tabs" className={cn(className)} {...props} />;
}

/**
 * La fila de pestañas. Recorre con las flechas del teclado.
 *
 * `underline` se desplaza a lo ancho donde no cabe; `capsule`, para filtrar una
 * lista por categoría, parte en renglones y deja todas las opciones a la vista.
 */
function TabsList({
  className,
  variant = "underline",
  ...props
}: TabsListProps): React.JSX.Element {
  return (
    <VariantContext.Provider value={variant}>
      <div
        data-slot="tabs-list-scroll"
        /* El recorte va acá y no en la lista: `overflow-x` arrastra a `overflow-y`
           y le cortaría el anillo de foco a las pestañas. El relleno le hace sitio
           dentro y el margen negativo lo devuelve. */
        className="-m-1 max-w-[calc(100%+0.5rem)] overflow-x-auto p-1"
      >
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant={variant}
          className={cn(
            "inline-flex items-center gap-1 text-base font-semibold",
            variant === "underline" ? "border-b border-border" : "flex-wrap",
            className,
          )}
          {...props}
        />
      </div>
    </VariantContext.Provider>
  );
}

/** Una pestaña. */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>): React.JSX.Element {
  const variant = React.useContext(VariantContext);
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        variant === "underline"
          ? "h-10 rounded-t-sm border-b-2 border-transparent px-4 text-base font-semibold data-[state=active]:border-primary"
          : "h-8 rounded-md px-3 text-sm font-medium data-[state=active]:bg-fill-tertiary data-[state=inactive]:hover:bg-state-hover",
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
        "mt-2 rounded-sm p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
