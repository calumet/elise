/**
 * Indicador de carga indeterminado. Hereda el color del texto (`currentColor`),
 * así que se tiñe con cualquier utilidad `text-*`.
 *
 * Lleva `data-motion="essential"` para seguir girando bajo
 * `prefers-reduced-motion`, porque un spinner detenido no comunica que algo
 * sigue en curso.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link Spinner}. */
export type SpinnerProps = React.ComponentProps<"span"> & {
  size?: "sm" | "md" | "lg";

  /** Etiqueta para lectores de pantalla. Por defecto usa el puente i18n. */
  label?: string;
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-8 border-[3px]",
};

/**
 * Indicador de carga indeterminado. Hereda el color del texto (`currentColor`),
 * así que se tiñe con cualquier utilidad `text-*`.
 *
 * Lleva `data-motion="essential"` para seguir girando bajo
 * `prefers-reduced-motion`, porque un spinner detenido no comunica que algo
 * sigue en curso.
 */
function Spinner({ className, size = "md", label, ...props }: SpinnerProps): React.JSX.Element {
  const fallback = useElLabel("ui", "loading", "Cargando");
  const text = label ?? fallback;
  return (
    <span data-slot="spinner" role="status" className={cn("inline-flex", className)} {...props}>
      <span
        data-motion="essential"
        aria-hidden="true"
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent",
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{text}</span>
    </span>
  );
}

export { Spinner };
