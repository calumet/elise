import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "@/lib/cn";

export type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>;

/**
 * Barra de progreso.
 *
 * `value={null}` la deja indeterminada, para cuando se sabe que algo está en
 * curso pero no cuánto falta. En ese estado el primitivo retira `aria-valuenow`
 * en lugar de anunciar un cero que sería mentira, y la barra recorre el carril.
 *
 * Para una espera sin barra está `Spinner`.
 */
function Progress({ className, value = 0, max = 100, ...props }: ProgressProps) {
  const indeterminado = value === null || value === undefined;
  const porcentaje = indeterminado ? 0 : (Math.min(Math.max(value, 0), max) / max) * 100;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        /* Una barra indeterminada detenida no comunica que algo esté pasando,
           que es el mismo caso del Spinner, así que la marca de motion esencial
           la exime de `prefers-reduced-motion`. */
        data-motion={indeterminado ? "essential" : undefined}
        className={cn(
          "h-full w-full flex-1 bg-primary",
          indeterminado
            ? "w-1/3 animate-progress-indeterminate"
            : "transition-transform duration-(--duration-base) ease-out",
        )}
        style={indeterminado ? undefined : { transform: `translateX(-${100 - porcentaje}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
