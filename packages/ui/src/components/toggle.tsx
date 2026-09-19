/**
 * Botón de dos estados.
 *
 * Es un `button` con `aria-pressed`, que es como se anuncia un botón que queda
 * hundido.
 *
 * Dentro de un `ToggleGroup` se comporta como una opción del grupo. Con
 * `pressed` u `onPressedChange` funciona suelto, y en ese caso lleva su propio
 * estado.
 *
 * @module
 */

import * as TogglePrimitive from "@radix-ui/react-toggle";
import * as React from "react";

import { cn } from "@/lib/cn";

import { InsideToggleGroup, ToggleGroupItem, toggleClasses } from "./toggle-group";

/** Props de {@link Toggle}. */
export type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root> & {
  /** Solo dentro de un `ToggleGroup`, donde identifica la opción. */
  value?: string;
};

/**
 * Botón de dos estados.
 *
 * Es un `button` con `aria-pressed`, que es como se anuncia un botón que queda
 * hundido.
 *
 * Dentro de un `ToggleGroup` se comporta como una opción del grupo. Con
 * `pressed` u `onPressedChange` funciona suelto, y en ese caso lleva su propio
 * estado.
 */
function Toggle({ className, value, ...props }: ToggleProps): React.JSX.Element {
  const inGroup = React.useContext(InsideToggleGroup);

  if (inGroup) {
    /* En un grupo el valor lo lleva el grupo, así que las props de estado
       propio no aplican y se descartan en vez de quedar sin efecto. */
    const { pressed: _p, defaultPressed: _d, onPressedChange: _o, ...rest } = props;
    return <ToggleGroupItem value={value ?? ""} className={className} {...rest} />;
  }

  return (
    <TogglePrimitive.Root data-slot="toggle" className={cn(toggleClasses, className)} {...props} />
  );
}

export { Toggle };
