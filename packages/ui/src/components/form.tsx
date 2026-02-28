import * as FormPrimitive from "@radix-ui/react-form";
import * as React from "react";

import { cn } from "@/lib/cn";

export const Form = FormPrimitive.Root;

type FormRowProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: number;
  smCols?: number;
  mdCols?: number;
  lgCols?: number;
};

const gridCols = (prefix: string, value?: number) => {
  if (!value) return "";
  return `${prefix}grid-cols-${value}`;
};

export const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(
  ({ className, cols = 1, smCols = 2, mdCols, lgCols, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid gap-3",
        gridCols("", cols),
        gridCols("sm:", smCols),
        gridCols("md:", mdCols),
        gridCols("lg:", lgCols),
        className,
      )}
      {...props}
    />
  ),
);
FormRow.displayName = "FormRow";

export const FormField = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Field>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Field>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Field ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
));
FormField.displayName = FormPrimitive.Field.displayName;

export const FormLabel = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Label
    ref={ref}
    className={cn("text-base font-medium text-foreground", className)}
    {...props}
  />
));
FormLabel.displayName = FormPrimitive.Label.displayName;

export const FormControl = FormPrimitive.Control;

export const FormMessage = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Message>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Message
    ref={ref}
    className={cn("text-xs text-danger data-[state=delayed-open]:animate-in", className)}
    {...props}
  />
));
FormMessage.displayName = FormPrimitive.Message.displayName;

export const FormDescription = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Message>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Message
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

export const FormSubmit = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Submit>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Submit>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Submit ref={ref} className={cn("inline-flex", className)} {...props} />
));
FormSubmit.displayName = FormPrimitive.Submit.displayName;
