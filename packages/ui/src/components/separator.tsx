import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "@/lib/cn";

export type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>;

/**
 * Divisor entre bloques de contenido.
 *
 * Por defecto es decorativo y no se anuncia. Con `decorative={false}` pasa a ser
 * un `separator` con su orientación, para cuando la línea de verdad divide dos
 * regiones y el lector de pantalla tiene que decirlo.
 *
 * El grosor sale de `data-orientation`, que lo pone el primitivo, así que
 * cambiar la orientación no obliga a tocar las clases.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={orientation}
      decorative={decorative}
      className={cn(
        "shrink-0 bg-border",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
