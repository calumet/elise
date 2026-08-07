/**
 * Raíz del formulario. Reparte el estado de validación a los campos.
 *
 * @module
 */

import * as FormPrimitive from "@radix-ui/react-form";
import * as React from "react";

import { InlineError } from "./inline-error";

import { cn } from "@/lib/cn";

/** Raíz del formulario. Reparte el estado de validación a los campos. */
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

/** Una fila de campos, con las columnas que pidas por breakpoint. */
export const FormRow: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<FormRowProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, FormRowProps>(
  ({ className, cols = 1, smCols = 2, mdCols, lgCols, ...props }, ref) => (
    <div
      data-slot="form-row"
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

/** Un campo. Enlaza solo el rótulo, el control y el mensaje de error. */
export const FormField: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof FormPrimitive.Field>> &
    React.RefAttributes<React.ComponentRef<typeof FormPrimitive.Field>>
> = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Field>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Field>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Field
    data-slot="form-field"
    ref={ref}
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
));
FormField.displayName = FormPrimitive.Field.displayName;

/** El rótulo del campo. */
export const FormLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>> &
    React.RefAttributes<React.ComponentRef<typeof FormPrimitive.Label>>
> = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Label
    data-slot="form-label"
    ref={ref}
    className={cn("text-base font-medium text-foreground", className)}
    {...props}
  />
));
FormLabel.displayName = FormPrimitive.Label.displayName;

/** Envuelve al control para que reciba los `id` y los `aria` del campo. */
export const FormControl = FormPrimitive.Control;

/** El error del campo. Sale por `InlineError`, así que es un `<p>` y no el `<span>` de Radix. */
export const FormMessage: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>> &
    React.RefAttributes<HTMLParagraphElement>
> = React.forwardRef<
  /* Sale por `InlineError`, que es un `<p>`, no el `<span>` que pondría Radix
     por su cuenta. */
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, children, ...props }, ref) => (
  /* `asChild` para que el mensaje salga por `InlineError` y no por otra copia
     del mismo marcado: el icono, el rojo y el `role` son los mismos que debajo
     de un `Field`, y quien rellena un formulario no tiene por qué notar cuál de
     los dos caminos lo pintó. */
  <FormPrimitive.Message asChild {...props}>
    <InlineError
      data-slot="form-message"
      ref={ref}
      className={cn("data-[state=delayed-open]:animate-in", className)}
    >
      {children}
    </InlineError>
  </FormPrimitive.Message>
));
FormMessage.displayName = FormPrimitive.Message.displayName;

/** La ayuda del campo, debajo del control. */
export const FormDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>> &
    React.RefAttributes<React.ComponentRef<typeof FormPrimitive.Message>>
> = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Message>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Message
    data-slot="form-description"
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

/** El botón que envía. Queda deshabilitado mientras la validación no pase. */
export const FormSubmit: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof FormPrimitive.Submit>> &
    React.RefAttributes<React.ComponentRef<typeof FormPrimitive.Submit>>
> = React.forwardRef<
  React.ComponentRef<typeof FormPrimitive.Submit>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Submit>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Submit
    data-slot="form-submit"
    ref={ref}
    className={cn("inline-flex", className)}
    {...props}
  />
));
FormSubmit.displayName = FormPrimitive.Submit.displayName;
