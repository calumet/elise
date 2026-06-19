import * as FormPrimitive from "@radix-ui/react-form";
import * as React from "react";

import { cn } from "@/lib/cn";

export const Form = FormPrimitive.Root;

type GridColCount = 1 | 2 | 3 | 4 | 5 | 6;

type FormRowProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: GridColCount;
  smCols?: GridColCount;
  mdCols?: GridColCount;
  lgCols?: GridColCount;
};

// Tailwind solo genera clases que aparecen completas en el código fuente,
// así que cada combinación se enumera de forma estática.
const colClasses: Record<GridColCount, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const smColClasses: Record<GridColCount, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

const mdColClasses: Record<GridColCount, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

const lgColClasses: Record<GridColCount, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(
  ({ className, cols = 1, smCols = 2, mdCols, lgCols, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid gap-3",
        colClasses[cols],
        smColClasses[smCols],
        mdCols && mdColClasses[mdCols],
        lgCols && lgColClasses[lgCols],
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
    className={cn("text-xs text-destructive data-[state=delayed-open]:animate-in", className)}
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
