import { Check, Minus } from "@calumet/elise-icons";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

import { cn } from "@/lib/cn";

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

/**
 * Casilla de verificación.
 *
 * `checked` admite `"indeterminate"` además de los dos booleanos, que es el
 * estado de una casilla maestra cuando solo parte de sus hijas está marcada.
 * Ese tercer estado no existe en un `input` nativo salvo por propiedad del DOM,
 * y era lo que faltaba en la versión anterior.
 *
 * Con `name` el primitivo emite un input oculto, de modo que un formulario
 * nativo la envía igual.
 */
function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-border-strong bg-card text-transparent transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-bevel",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:shadow-bevel",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {/* El indicador se monta en los dos estados marcados, así que el glifo
            lo elige el `data-state` de la raíz y no hace falta leer `checked`,
            que en modo no controlado no llega por props. */}
        <Check className="hidden size-3 group-data-[state=checked]:block" aria-hidden="true" />
        <Minus
          className="hidden size-3 group-data-[state=indeterminate]:block"
          aria-hidden="true"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
