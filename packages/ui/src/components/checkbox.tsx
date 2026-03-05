import * as React from "react";

import { cn } from "@/lib/cn";

export type CheckboxProps = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  onCheckedChange?: (checked: boolean) => void;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-card text-transparent transition has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background has-disabled:cursor-not-allowed has-disabled:opacity-50",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="sr-only"
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
        {...props}
      />
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
        <polyline
          points="3.5 8.5 6.5 11.5 12.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  ),
);
Checkbox.displayName = "Checkbox";
