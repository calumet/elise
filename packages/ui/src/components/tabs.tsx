import * as React from "react";

import { cn } from "@/lib/cn";

const TabsContext = React.createContext({ name: "", defaultValue: "" });

export const Tabs = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { defaultValue?: string }
>(({ className, defaultValue = "", children, ...props }, ref) => {
  const name = React.useId();
  return (
    <TabsContext value={{ name, defaultValue }}>
      <div ref={ref} className={cn(className)} data-tabs={name} {...props}>
        {children}
      </div>
    </TabsContext>
  );
});
Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 border-b border-border text-base font-semibold",
        className,
      )}
      {...props}
    />
  ),
);
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  HTMLLabelElement,
  Omit<React.ComponentPropsWithoutRef<"label">, "htmlFor"> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const { name, defaultValue } = React.useContext(TabsContext);
  return (
    <label
      ref={ref}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-t-sm px-4 text-base font-semibold text-muted-foreground transition-colors border-b-2 border-transparent hover:text-foreground has-checked:text-foreground has-checked:border-primary has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={value === defaultValue}
        className="sr-only"
      />
      {children}
    </label>
  );
});
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { value: string }
>(({ className, value, ...props }, ref) => {
  const name = React.useContext(TabsContext).name;
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `[data-tabs="${name}"]:not(:has(input[value="${value}"]:checked)) [data-tab-content="${value}"]{display:none}`,
        }}
      />
      <div
        ref={ref}
        role="tabpanel"
        data-tab-content={value}
        className={cn(
          "mt-2 rounded-sm p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      />
    </>
  );
});
TabsContent.displayName = "TabsContent";
