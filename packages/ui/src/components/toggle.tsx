import * as React from "react";

import { cn } from "@/lib/cn";
import { ToggleGroupContext } from "./toggle-group";

export type ToggleProps = Omit<React.ComponentPropsWithoutRef<"label">, "htmlFor"> & {
  value?: string;
  defaultPressed?: boolean;
};

export const Toggle = React.forwardRef<HTMLLabelElement, ToggleProps>(
  ({ className, value, defaultPressed, children, ...props }, ref) => {
    const ctx = React.useContext(ToggleGroupContext);
    const inGroup = ctx.name !== "";
    return (
      <label
        ref={ref}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-base font-semibold text-foreground transition hover:bg-muted has-checked:bg-primary has-checked:text-primary-contrast has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      >
        <input
          type={inGroup && ctx.type === "single" ? "radio" : "checkbox"}
          name={inGroup ? ctx.name : undefined}
          value={value}
          defaultChecked={defaultPressed}
          className="sr-only"
        />
        {children}
      </label>
    );
  },
);
Toggle.displayName = "Toggle";
