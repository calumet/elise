import * as TogglePrimitive from "@radix-ui/react-toggle";
import * as React from "react";

import { DentroDeToggleGroup, ToggleGroupItem, clasesToggle } from "./toggle-group";

import { cn } from "@/lib/cn";

export type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root> & {
  /** Solo dentro de un `ToggleGroup`, donde identifica la opción. */
  value?: string;
};

/**
 * Botón de dos estados.
 *
 * Ahora es un `button` con `aria-pressed`, que es como se anuncia un botón que
 * queda hundido. Antes era un `label` con un input oculto, de modo que el
 * lector de pantalla decía "casilla" y no "botón".
 *
 * Dentro de un `ToggleGroup` se comporta como una opción del grupo. Con
 * `pressed` u `onPressedChange` funciona suelto, y en ese caso lleva su propio
 * estado.
 */
function Toggle({ className, value, ...props }: ToggleProps) {
  const enGrupo = React.useContext(DentroDeToggleGroup);

  if (enGrupo) {
    /* En un grupo el valor lo lleva el grupo, así que las props de estado
       propio no aplican y se descartan en vez de quedar sin efecto. */
    const { pressed: _p, defaultPressed: _d, onPressedChange: _o, ...resto } = props;
    return <ToggleGroupItem value={value ?? ""} className={className} {...resto} />;
  }

  return (
    <TogglePrimitive.Root data-slot="toggle" className={cn(clasesToggle, className)} {...props} />
  );
}

export { Toggle };
