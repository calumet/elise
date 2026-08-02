import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/cn";

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root>;

/**
 * Interruptor de encendido y apagado.
 *
 * Se distingue de `Checkbox` en que aplica el cambio al momento, sin esperar a
 * que se envíe un formulario. Si el cambio necesita confirmación, la casilla es
 * el control correcto.
 *
 * Acepta modo controlado con `checked` y no controlado con `defaultChecked`.
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-muted shadow-bevel-inset transition-[background-color,box-shadow] duration-(--duration-fast) ease-out",
        "data-[state=checked]:bg-primary data-[state=checked]:shadow-bevel",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        /* El carril mide 44px con 1px de borde a cada lado y el pulgar 20px, de
           modo que 2px de desplazamiento dejan 3px de hueco, el mismo que deja
           el extremo contrario al encenderse. Antes eran 5px contra 3px. */
        className="pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform duration-(--duration-fast) ease-out data-[state=checked]:translate-x-5"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
