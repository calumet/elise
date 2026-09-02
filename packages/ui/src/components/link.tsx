/**
 * Enlace.
 *
 * Va subrayado y no solo en color: el color por sí solo no distingue nada para
 * quien no lo separa del texto de alrededor, y dentro de un párrafo no hay
 * forma de saber dónde acaba lo pulsable si el subrayado no lo marca.
 *
 * Es `inline` a propósito, no `inline-block`: partido entre dos renglones tiene
 * que seguir el flujo del texto en vez de saltar entero a la línea siguiente.
 *
 * Abrir en otra pestaña añade `rel` por su cuenta. Sin él, la página nueva
 * recibe `window.opener` y puede reescribir la de origen; es un descuido que no
 * tiene por qué recordar quien escribe el enlace.
 *
 * @module
 */

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link Link}. */
export type LinkProps = React.ComponentProps<"a"> & {
  /**
   * Para qué es el enlace, no de qué color va.
   *
   * - `auto`: el enlace normal, en el color de marca.
   * - `neutral`: hereda el color de lo que lo rodea. Para cuando el enlace es
   *   toda una fila o un bloque y teñirlo lo rompería; el subrayado sigue
   *   diciendo que se puede pulsar.
   * - `critical`: lleva a algo que destruye o que ya falló.
   */
  tone?: "auto" | "neutral" | "critical";

  /**
   * Cede el marcado al hijo. Es lo que permite envolver el enlace del router de
   * turno sin anidar dos `<a>`.
   */
  asChild?: boolean;
};

const tonos: Record<NonNullable<LinkProps["tone"]>, string> = {
  auto: "text-link hover:text-link-hover active:text-link-active",
  neutral: "text-inherit",
  critical:
    "text-destructive-subtle-foreground hover:text-destructive-hover active:text-destructive-active",
};

/**
 * Enlace.
 *
 * Va subrayado y no solo en color: el color por sí solo no distingue nada para
 * quien no lo separa del texto de alrededor, y dentro de un párrafo no hay
 * forma de saber dónde acaba lo pulsable si el subrayado no lo marca.
 *
 * Es `inline` a propósito, no `inline-block`: partido entre dos renglones tiene
 * que seguir el flujo del texto en vez de saltar entero a la línea siguiente.
 *
 * Abrir en otra pestaña añade `rel` por su cuenta. Sin él, la página nueva
 * recibe `window.opener` y puede reescribir la de origen; es un descuido que no
 * tiene por qué recordar quien escribe el enlace.
 */
export const Link: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<LinkProps> & React.RefAttributes<HTMLAnchorElement>
> = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, tone = "auto", asChild = false, target, rel, ...props }, ref) => {
    const Componente = asChild ? Slot : "a";

    return (
      <Componente
        data-slot="link"
        ref={ref}
        target={target}
        rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
        className={cn(
          "inline cursor-pointer rounded-xs underline underline-offset-2 transition-[color] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          tonos[tone],
          className,
        )}
        {...props}
      />
    );
  },
);
Link.displayName = "Link";
