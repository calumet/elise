import { ChevronDownIcon } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";

const AccordionContext = React.createContext({ name: "", defaultValue: "" });

type AccordionProps = React.ComponentPropsWithoutRef<"div"> & {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string;
};

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = "single", collapsible: _, defaultValue = "", children, ...props }, ref) => {
    const name = React.useId();
    return (
      <AccordionContext value={{ name: type === "single" ? name : "", defaultValue }}>
        <div
          ref={ref}
          className={cn("rounded-sm border border-border bg-card", className)}
          {...props}
        >
          {children}
        </div>
      </AccordionContext>
    );
  },
);
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<
  HTMLDetailsElement,
  React.ComponentPropsWithoutRef<"details"> & { value?: string }
>(({ className, value, ...props }, ref) => {
  const { name, defaultValue } = React.useContext(AccordionContext);
  return (
    <details
      ref={ref}
      name={name || undefined}
      open={value && value === defaultValue ? true : undefined}
      className={cn("group border-t border-border rounded-sm bg-card first:border-t-0", className)}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"summary">
>(({ className, children, ...props }, ref) => (
  <summary
    ref={ref as React.Ref<HTMLElement>}
    className={cn(
      "flex cursor-pointer list-none items-center justify-between px-3 py-3 text-left text-base font-semibold transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDownIcon
      className="ml-2 h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
      aria-hidden
    />
  </summary>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden text-base text-muted-foreground", className)}
    {...props}
  >
    <div className="px-3 pb-4 pt-0">{children}</div>
  </div>
));
AccordionContent.displayName = "AccordionContent";
