/**
 * Campo de texto de varias líneas.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

import { INVALID_FIELD } from "./input";

/** Props de {@link Textarea}. */
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Campo de texto de varias líneas. */
export const Textarea: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TextareaProps> & React.RefAttributes<HTMLTextAreaElement>
> = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    data-slot="textarea"
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out placeholder:text-muted-foreground hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      INVALID_FIELD,
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
