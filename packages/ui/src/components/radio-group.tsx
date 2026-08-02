import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";

import { cn } from "@/lib/cn";

export type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;
export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item>;

/**
 * Grupo de opciones excluyentes.
 *
 * El grupo es dueño del valor, con `value` y `onValueChange` en modo controlado
 * y `defaultValue` en el no controlado. Antes cada opción era un radio nativo y
 * el valor solo se podía leer del formulario.
 *
 * El foco entra una vez al grupo y las flechas recorren las opciones, de modo
 * que tabular salta al control siguiente y no a la opción siguiente.
 */
function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="block h-2.5 w-2.5 rounded-full bg-primary-foreground"
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
