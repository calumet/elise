/**
 * Una caja que desplaza.
 *
 * No dibuja su propia barra: usa la del navegador, que es la misma que ya
 * estiliza `elise.css` para la página entera y para todo lo que desplaza por
 * dentro. Antes traía una pintada aparte, y aunque llevaba las mismas medidas y
 * los mismos tokens, no se comportaba igual: se escondía en reposo y solo salía
 * al apuntarla. En la misma pantalla acababa habiendo dos maneras de desplazar,
 * y la de dentro parecía de otro sitio.
 *
 * Al ser un `<div>` normal también desplaza con las teclas sin tener que ganarse
 * el foco por su cuenta, y el navegador puede llevar el foco a lo que quede
 * fuera de la vista, que es lo que hace falta cuando dentro hay cosas que se
 * tabulan.
 *
 * Hace falta darle un alto, porque una caja sin límite crece con su contenido y
 * entonces no hay nada que desplazar.
 *
 * ```tsx
 * <ScrollArea className="h-40 rounded-sm border border-border">…</ScrollArea>
 * ```
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link ScrollArea}. */
export type ScrollAreaProps = React.ComponentProps<"div">;

/**
 * Una caja que desplaza.
 *
 * No dibuja su propia barra: usa la del navegador, que es la misma que ya
 * estiliza `elise.css` para la página entera y para todo lo que desplaza por
 * dentro. Antes traía una pintada aparte, y aunque llevaba las mismas medidas y
 * los mismos tokens, no se comportaba igual: se escondía en reposo y solo salía
 * al apuntarla. En la misma pantalla acababa habiendo dos maneras de desplazar,
 * y la de dentro parecía de otro sitio.
 *
 * Al ser un `<div>` normal también desplaza con las teclas sin tener que ganarse
 * el foco por su cuenta, y el navegador puede llevar el foco a lo que quede
 * fuera de la vista, que es lo que hace falta cuando dentro hay cosas que se
 * tabulan.
 *
 * Hace falta darle un alto, porque una caja sin límite crece con su contenido y
 * entonces no hay nada que desplazar.
 *
 * ```tsx
 * <ScrollArea className="h-40 rounded-sm border border-border">…</ScrollArea>
 * ```
 */
export const ScrollArea: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ScrollAreaProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, ScrollAreaProps>(({ className, children, ...props }, ref) => (
  <div data-slot="scroll-area" ref={ref} className={cn("overflow-auto", className)} {...props}>
    {children}
  </div>
));

ScrollArea.displayName = "ScrollArea";
