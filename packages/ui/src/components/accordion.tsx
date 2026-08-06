import { ChevronDown } from "@calumet/elise-icons";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

import { cn } from "@/lib/cn";

export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root>;
export type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;
export type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger>;
export type AccordionContentProps = React.ComponentProps<typeof AccordionPrimitive.Content>;

/**
 * Secciones plegables.
 *
 * `type="single"` deja una abierta a la vez, y con `collapsible` esa una puede
 * cerrarse. `type="multiple"` permite varias.
 *
 * Admite modo controlado con `value` y `onValueChange`.
 */
function Accordion({ className, ...props }: AccordionProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("rounded-xl border border-border bg-card", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionItemProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-t border-border first:border-t-0", className)}
      {...props}
    />
  );
}

/**
 * El disparador va envuelto en el encabezado que pide el primitivo, para que la
 * jerarquía de la página no se rompa al recorrerla por encabezados.
 */
function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 cursor-pointer items-center justify-between px-3 py-3 text-left text-base font-semibold text-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className="ml-2 size-4 shrink-0 transition-transform duration-(--duration-fast) ease-out group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * El alto lo anima el primitivo, que publica el del contenido medido en
 * `--radix-accordion-content-height`. El padding vive en el div de adentro
 * porque animar el alto de un elemento que además tiene padding vertical deja
 * el texto apretándose durante la transición.
 */
function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps): React.JSX.Element {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-base text-muted-foreground",
        "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
        className,
      )}
      {...props}
    >
      <div className="px-3 pt-0 pb-4">{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
