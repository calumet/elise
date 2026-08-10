/**
 * Una tecla.
 *
 * Se lee como una tecla y no como código porque lleva relieve: fondo de tarjeta
 * sobre el gris de alrededor, contorno firme y una sombra de un píxel. Es la
 * misma diferencia que hay entre nombrar una tecla y citar un valor, y por eso
 * no es una variante de `Code`.
 *
 * Un atajo de varias teclas son varias: `<Kbd>Ctrl</Kbd> <Kbd>K</Kbd>`. Meter
 * las dos en una sola caja dibuja una tecla que no existe.
 *
 * `min-w-5` para que las de una sola letra no salgan más estrechas que las
 * demás y el atajo quede desparejo.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link Kbd}. */
export type KbdProps = React.ComponentProps<"kbd">;

/**
 * Una tecla.
 *
 * Se lee como una tecla y no como código porque lleva relieve: fondo de tarjeta
 * sobre el gris de alrededor, contorno firme y una sombra de un píxel. Es la
 * misma diferencia que hay entre nombrar una tecla y citar un valor, y por eso
 * no es una variante de `Code`.
 *
 * Un atajo de varias teclas son varias: `<Kbd>Ctrl</Kbd> <Kbd>K</Kbd>`. Meter
 * las dos en una sola caja dibuja una tecla que no existe.
 *
 * `min-w-5` para que las de una sola letra no salgan más estrechas que las
 * demás y el atajo quede desparejo.
 */
export const Kbd: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<KbdProps> & React.RefAttributes<HTMLElement>
> = React.forwardRef<HTMLElement, KbdProps>(({ className, ...props }, ref) => (
  <kbd
    data-slot="kbd"
    ref={ref}
    className={cn(
      "inline-flex min-w-5 items-center justify-center rounded-sm border border-border-strong bg-card px-1.5 py-px font-mono text-2xs text-muted-foreground shadow-xs",
      className,
    )}
    {...props}
  />
));
Kbd.displayName = "Kbd";
