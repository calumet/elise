/**
 * Varios avatares solapados.
 *
 * El solape dice que son un grupo y no una lista, y de paso mete unos cuantos en
 * el ancho de dos. El primero va delante y los demás se meten por debajo, que es
 * el orden natural de lectura: al revés, el último tapa al primero y el ojo
 * empieza por el final. Eso obliga a numerar el apilado a mano, porque por orden
 * de documento pasaría justo lo contrario.
 *
 * Cada avatar lleva un aro del color del fondo. Sin él, dos avatares del mismo
 * tono se funden en una mancha en cuanto se tocan.
 *
 * El resumen no es un avatar más: es texto con el número de los que no se ven.
 * Ponerle cara a «y otros cinco» inventaría una persona que no existe.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link AvatarGroup}. */
export type AvatarGroupProps = React.ComponentProps<"div"> & {
  /**
   * Cuántos se ven. El resto se resume en una ficha con el número.
   *
   * Sin tope, un grupo de treinta se come la fila y deja de decir nada: pasados
   * unos pocos, lo que se lee ya es «unos cuantos», no quiénes.
   */
  max?: number;

  size?: "sm" | "md" | "lg";
};

/* El solape va por tamaño y no fijo. Con una foto da igual cuánto se tape, pero
   la mayoría de los avatares acaban siendo dos iniciales centradas, y un solape
   fijo de 8px se come media letra en el de 24px y ninguna en el de 40. Un sexto
   del ancho deja el texto entero en los tres. */
const tamanos: Record<NonNullable<AvatarGroupProps["size"]>, string> = {
  sm: "size-6 text-2xs -ms-1",
  md: "size-8 text-sm -ms-1.5",
  lg: "size-10 text-base -ms-2",
};

type ConClase = React.ReactElement<{ className?: string; style?: React.CSSProperties }>;

/**
 * Varios avatares solapados.
 *
 * El solape dice que son un grupo y no una lista, y de paso mete unos cuantos en
 * el ancho de dos. El primero va delante y los demás se meten por debajo, que es
 * el orden natural de lectura: al revés, el último tapa al primero y el ojo
 * empieza por el final. Eso obliga a numerar el apilado a mano, porque por orden
 * de documento pasaría justo lo contrario.
 *
 * Cada avatar lleva un aro del color del fondo. Sin él, dos avatares del mismo
 * tono se funden en una mancha en cuanto se tocan.
 *
 * El resumen no es un avatar más: es texto con el número de los que no se ven.
 * Ponerle cara a «y otros cinco» inventaría una persona que no existe.
 */
export const AvatarGroup: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<AvatarGroupProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 4, size = "md", ...props }, ref) => {
    const plantilla = useElLabel("ui", "avatarGroupMore", "y {count} más");

    const todos = React.Children.toArray(children).filter(React.isValidElement) as ConClase[];
    const visibles = todos.slice(0, max);
    const sobran = todos.length - visibles.length;

    return (
      <div
        data-slot="avatar-group"
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      >
        {visibles.map((hijo, i) =>
          React.cloneElement(hijo, {
            key: hijo.key ?? i,
            style: { zIndex: visibles.length - i, ...hijo.props.style },
            className: cn(
              "relative ring-2 ring-background first:ms-0",
              tamanos[size],
              hijo.props.className,
            ),
          }),
        )}

        {sobran > 0 ? (
          <span
            data-slot="avatar-group-more"
            className={cn(
              "relative z-0 inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-medium text-muted-foreground ring-2 ring-background",
              tamanos[size],
            )}
          >
            <span aria-hidden="true">+{sobran}</span>
            <span className="sr-only">{plantilla.replace("{count}", String(sobran))}</span>
          </span>
        ) : null}
      </div>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";
