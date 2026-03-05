import * as React from "react";

import { cn } from "@/lib/cn";

export const ToggleGroupContext = React.createContext({
  name: "",
  type: "multiple" as "single" | "multiple",
});

export type ToggleGroupProps = React.ComponentPropsWithoutRef<"div"> & {
  type?: "single" | "multiple";
};

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, type = "multiple", children, ...props }, ref) => {
    const name = React.useId();
    return (
      <ToggleGroupContext value={{ name, type }}>
        <div ref={ref} role="group" className={cn("flex gap-1", className)} {...props}>
          {children}
        </div>
      </ToggleGroupContext>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

export type ToggleGroupItemProps = Omit<React.ComponentPropsWithoutRef<"label">, "htmlFor"> & {
  value: string;
  defaultChecked?: boolean;
};

export const ToggleGroupItem = React.forwardRef<HTMLLabelElement, ToggleGroupItemProps>(
  ({ className, value, children, defaultChecked, ...props }, ref) => {
    const { name, type } = React.useContext(ToggleGroupContext);
    return (
      <label
        ref={ref}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-base font-semibold text-foreground transition hover:bg-muted has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      >
        <input
          type={type === "single" ? "radio" : "checkbox"}
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          className="sr-only"
        />
        {children}
      </label>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
