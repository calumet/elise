/**
 * Secciones plegables.
 *
 * `type="single"` deja una abierta a la vez, y con `collapsible` esa una puede
 * cerrarse. `type="multiple"` permite varias.
 *
 * Admite modo controlado con `value` y `onValueChange`.
 *
 * @module
 */

import { ChevronDown } from "@calumet/elise-icons";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link Accordion}. */
export type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> & {
  variant?: "card" | "flush";
};
/** Props de {@link AccordionItem}. */
export type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;
/** Props de {@link AccordionTrigger}. */
export type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger>;
/** Props de {@link AccordionContent}. */
export type AccordionContentProps = React.ComponentProps<typeof AccordionPrimitive.Content>;

const VariantContext = React.createContext<NonNullable<AccordionProps["variant"]>>("card");

/**
 * Secciones plegables.
 *
 * `type="single"` deja una abierta a la vez, y con `collapsible` esa una puede
 * cerrarse. `type="multiple"` permite varias.
 *
 * Admite modo controlado con `value` y `onValueChange`.
 */
function Accordion({ className, variant = "card", ...props }: AccordionProps): React.JSX.Element {
  return (
    <VariantContext.Provider value={variant}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn(variant === "card" && "rounded-xl border border-border bg-card", className)}
        {...(props as React.ComponentProps<typeof AccordionPrimitive.Root>)}
      />
    </VariantContext.Provider>
  );
}

/** Una sección plegable del acordeón. */
function AccordionItem({ className, ...props }: AccordionItemProps): React.JSX.Element {
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        variant === "card" ? "border-t border-border first:border-t-0" : "border-b border-border",
        className,
      )}
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
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 cursor-pointer items-center justify-between py-3 text-left text-base text-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          variant === "card"
            ? "px-3 font-semibold"
            : "gap-4 bg-muted px-4 font-medium focus-visible:ring-offset-0 focus-visible:ring-inset data-[state=open]:border-b data-[state=open]:border-border",
          className,
        )}
        {...props}
      >
        {variant === "card" ? (
          children
        ) : (
          <span className="flex min-w-0 flex-1 flex-col">{children}</span>
        )}
        <ChevronDown
          className="ml-2 size-icon-md shrink-0 transition-transform duration-(--duration-fast) ease-out group-data-[state=open]:rotate-180"
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
  const variant = React.useContext(VariantContext);
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-base",
        variant === "card" ? "text-muted-foreground" : "text-foreground",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className,
      )}
      {...props}
    >
      <div className={variant === "card" ? "px-3 pt-0 pb-4" : "px-4 pt-3 pb-4"}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
