/**
 * Una cifra con su rótulo y, si hace falta, cuánto cambió.
 *
 * El orden es rótulo, cifra, cambio. La cifra es lo que se busca al mirar un
 * panel, así que va suelta y en grande, y el rótulo encima y pequeño para
 * saber de qué es sin tener que leerlo entero.
 *
 * El sentido del cambio no sale del signo sino de `trend`, que lo dice quien
 * usa el componente. Menos devoluciones es un menos que está bien, y pintarlo
 * de rojo por llevar signo negativo diría lo contrario de lo que pasa.
 *
 * La flecha acompaña al color por lo mismo de siempre: verde y rojo no se
 * distinguen para todo el mundo, y aquí la diferencia entre los dos es justo lo
 * que hay que leer.
 *
 * @module
 */

import { ArrowDown, ArrowUp, Minus } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link Stat}. */
export type StatProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Qué se está midiendo. */
  label: React.ReactNode;

  /** La cifra, ya formateada. */
  value: React.ReactNode;

  /**
   * Cuánto cambió respecto a algo, ya formateado: `+12,4%`, `-320`.
   *
   * Viene escrito y no calculado a propósito: el formato de un número depende
   * del idioma y de la moneda, y eso lo sabe quien tiene los datos.
   */
  change?: React.ReactNode;

  /**
   * Si el cambio es bueno o malo. No se deduce del signo: menos devoluciones o
   * menos tiempo de carga son subidas con signo negativo.
   */
  trend?: "up" | "down" | "flat";

  /** Contra qué se compara: «frente al mes pasado». */
  description?: React.ReactNode;
};

const tonos: Record<NonNullable<StatProps["trend"]>, string> = {
  up: "text-success-subtle-foreground",
  down: "text-destructive-subtle-foreground",
  flat: "text-muted-foreground",
};

const flechas = { up: ArrowUp, down: ArrowDown, flat: Minus };

/**
 * Una cifra con su rótulo y, si hace falta, cuánto cambió.
 *
 * El orden es rótulo, cifra, cambio. La cifra es lo que se busca al mirar un
 * panel, así que va suelta y en grande, y el rótulo encima y pequeño para
 * saber de qué es sin tener que leerlo entero.
 *
 * El sentido del cambio no sale del signo sino de `trend`, que lo dice quien
 * usa el componente. Menos devoluciones es un menos que está bien, y pintarlo
 * de rojo por llevar signo negativo diría lo contrario de lo que pasa.
 *
 * La flecha acompaña al color por lo mismo de siempre: verde y rojo no se
 * distinguen para todo el mundo, y aquí la diferencia entre los dos es justo lo
 * que hay que leer.
 */
export const Stat: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<StatProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, change, trend = "flat", description, ...props }, ref) => {
    const Flecha = flechas[trend];

    return (
      <div data-slot="stat" ref={ref} className={cn("flex flex-col gap-1", className)} {...props}>
        <span data-slot="stat-label" className="text-sm text-muted-foreground">
          {label}
        </span>

        <span
          data-slot="stat-value"
          className="text-2xl font-semibold tabular-nums text-foreground"
        >
          {value}
        </span>

        {change || description ? (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            {change ? (
              <span
                data-slot="stat-change"
                data-trend={trend}
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium tabular-nums",
                  tonos[trend],
                )}
              >
                <Flecha className="size-3.5 shrink-0" aria-hidden="true" />
                {change}
              </span>
            ) : null}
            {description ? <span className="text-muted-foreground">{description}</span> : null}
          </span>
        ) : null}
      </div>
    );
  },
);
Stat.displayName = "Stat";
