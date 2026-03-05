import * as React from "react";

import { cn } from "@/lib/cn";

export type SwitchProps = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  onCheckedChange?: (checked: boolean) => void;
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => (
    <label
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-muted transition has-checked:bg-primary has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
        {...props}
      />
      <span className="pointer-events-none block h-5 w-5 translate-x-1 rounded-full bg-background shadow-soft ring-1 ring-border transition peer-checked:translate-x-5" />
    </label>
  ),
);
Switch.displayName = "Switch";
