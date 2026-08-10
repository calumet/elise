/**
 * Control segmentado: unas pocas opciones que se excluyen, siempre con una
 * puesta.
 *
 * Se lee como una sola pieza partida y no como botones sueltos, que es lo que lo
 * separa de un grupo de alternar: aquí las opciones son las caras de una misma
 * pregunta. De ahí que las esquinas interiores se cuadren y solo redondeen las
 * de los extremos.
 *
 * Nunca se queda sin valor. El grupo de Radix admite apagar la opción activa
 * volviéndola a pulsar, y aquí eso deja la pregunta sin responder sin que nadie
 * lo haya pedido, así que se ignora.
 *
 * Para elegir varias cosas a la vez esto no vale: eso es `ToggleGroup` con
 * `type="multiple"`.
 *
 * @module
 */

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link SegmentedControl}. */
export type SegmentedControlProps = Omit<
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
  "type" | "onValueChange" | "value" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/** Props de {@link SegmentedControlItem}. */
export type SegmentedControlItemProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
>;

/**
 * Control segmentado: unas pocas opciones que se excluyen, siempre con una
 * puesta.
 *
 * Se lee como una sola pieza partida y no como botones sueltos, que es lo que lo
 * separa de un grupo de alternar: aquí las opciones son las caras de una misma
 * pregunta. De ahí que las esquinas interiores se cuadren y solo redondeen las
 * de los extremos.
 *
 * Nunca se queda sin valor. El grupo de Radix admite apagar la opción activa
 * volviéndola a pulsar, y aquí eso deja la pregunta sin responder sin que nadie
 * lo haya pedido, así que se ignora.
 *
 * Para elegir varias cosas a la vez esto no vale: eso es `ToggleGroup` con
 * `type="multiple"`.
 */
export const SegmentedControl: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SegmentedControlProps> &
    React.RefAttributes<React.ComponentRef<typeof ToggleGroupPrimitive.Root>>
> = React.forwardRef<React.ComponentRef<typeof ToggleGroupPrimitive.Root>, SegmentedControlProps>(
  ({ className, onValueChange, ...props }, ref) => (
    <ToggleGroupPrimitive.Root
      data-slot="segmented-control"
      ref={ref}
      type="single"
      onValueChange={(valor) => valor && onValueChange?.(valor)}
      className={cn(
        "inline-flex max-w-full items-center gap-px rounded-md bg-muted p-0.5",
        "[&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none",
        "[&>*]:min-w-0 [&>*]:truncate",
        className,
      )}
      {...props}
    />
  ),
);
SegmentedControl.displayName = "SegmentedControl";

/** Una opción del control segmentado. */
export const SegmentedControlItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SegmentedControlItemProps> &
    React.RefAttributes<React.ComponentRef<typeof ToggleGroupPrimitive.Item>>
> = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  SegmentedControlItemProps
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    data-slot="segmented-control-item"
    ref={ref}
    className={cn(
      /* La opción puesta sube a la superficie de tarjeta y las demás se quedan
         en la banda: es un relieve, no un color de marca. Teñirla obligaría a
         que el rótulo cambiara de color con ella y el control entero se leería
         como una fila de botones primarios. */
      "inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--radius)-2px)] px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-[background-color,box-shadow,color] duration-(--duration-fast) ease-out",
      "hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-surface",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:text-border-strong",
      className,
    )}
    {...props}
  />
));
SegmentedControlItem.displayName = "SegmentedControlItem";
