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
   * - `muted`: el tono apagado de su superficie, que pasa al principal al
   *   apuntarlo. Para una lista o un pie donde todo es enlace.
   * - `critical`: lleva a algo que destruye o que ya falló.
   */
  tone?: "auto" | "neutral" | "muted" | "critical";

  /**
   * Cuándo va subrayado. `always` dentro de un texto, que es donde el subrayado
   * dice dónde acaba lo pulsable. `hover` cuando la fila o la lista ya lo dice:
   * el nombre de una fila de tabla, un renglón de un pie, un llamado suelto.
   */
  underline?: "always" | "hover";

  /**
   * Cede el marcado al hijo. Es lo que permite envolver el enlace del router de
   * turno sin anidar dos `<a>`.
   */
  asChild?: boolean;
};

const tones: Record<NonNullable<LinkProps["tone"]>, string> = {
  auto: "text-link hover:text-link-hover active:text-link-active",
  neutral: "text-inherit",
  muted: "text-muted-foreground hover:text-foreground",
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
  (
    { className, tone = "auto", underline = "always", asChild = false, target, rel, ...props },
    ref,
  ) => {
    const Component = asChild ? Slot : "a";

    return (
      <Component
        data-slot="link"
        ref={ref}
        target={target}
        rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
        className={cn(
          "inline cursor-pointer rounded-xs underline-offset-2 transition-[color] duration-(--duration-fast) ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
          underline === "always" ? "underline" : "hover:underline",
          tones[tone],
          className,
        )}
        {...props}
      />
    );
  },
);
Link.displayName = "Link";
