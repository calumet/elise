import * as React from "react";

import { cn } from "@/lib/cn";

const RadioGroupContext = React.createContext({ name: "", defaultValue: "" });

export type RadioGroupProps = React.ComponentPropsWithoutRef<"div"> & {
  name?: string;
  defaultValue?: string;
};

export type RadioGroupItemProps = Omit<React.ComponentPropsWithoutRef<"input">, "type">;

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, name, defaultValue = "", children, ...props }, ref) => {
    const generatedName = React.useId();
    return (
      <RadioGroupContext value={{ name: name || generatedName, defaultValue }}>
        <div ref={ref} role="radiogroup" className={cn("grid gap-3", className)} {...props}>
          {children}
        </div>
      </RadioGroupContext>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const { name, defaultValue } = React.useContext(RadioGroupContext);
    return (
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background transition has-checked:border-primary has-checked:bg-primary has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
          className,
        )}
      >
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          defaultChecked={value === defaultValue}
          className="peer sr-only"
          {...props}
        />
        <span className="block h-2.5 w-2.5 scale-0 rounded-full bg-primary-contrast transition peer-checked:scale-100" />
      </span>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";
