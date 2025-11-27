import * as React from 'react';
import * as FormPrimitive from '@radix-ui/react-form';

import { cn } from '@/lib/cn';

export const Form = FormPrimitive.Root;

export const FormField = FormPrimitive.Field;

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Label>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Label ref={ref} className={cn('text-sm font-medium text-foreground', className)} {...props} />
));
FormLabel.displayName = FormPrimitive.Label.displayName;

export const FormControl = FormPrimitive.Control;

export const FormMessage = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Message>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Message>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Message
    ref={ref}
    className={cn('text-xs text-danger data-[state=delayed-open]:animate-in', className)}
    {...props}
  />
));
FormMessage.displayName = FormPrimitive.Message.displayName;

export const FormSubmit = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Submit>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Submit>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Submit ref={ref} className={cn('inline-flex', className)} {...props} />
));
FormSubmit.displayName = FormPrimitive.Submit.displayName;
