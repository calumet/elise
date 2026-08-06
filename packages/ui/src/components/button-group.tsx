import * as React from "react";

import { cn } from "@/lib/cn";

export type ButtonGroupProps = React.ComponentProps<"div"> & {
  /**
   * Junta los botones en una sola pieza, con las esquinas interiores
   * cuadradas. Para acciones que son caras de lo mismo, como cambiar de vista.
   * Para acciones distintas que van juntas, dejalos separados.
   */
  attached?: boolean;

  /**
   * Cómo se llama el conjunto para un lector de pantalla. Vale la pena cuando
   * los botones solo se entienden juntos, del tipo «acciones del pedido».
   */
  accessibilityLabel?: string;
};

/**
 * Una fila de botones relacionados.
 *
 * Existe por el hueco de siempre: sin ella cada pantalla escribe su `flex` con
 * el hueco que le parece, y dos filas de acciones seguidas acaban separadas por
 * distancias distintas.
 *
 * Se envuelve donde no cabe, así que en pantalla estrecha los botones bajan de
 * renglón en vez de salirse.
 */
function ButtonGroup({
  className,
  attached,
  accessibilityLabel,
  role,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      data-slot="button-group"
      role={accessibilityLabel ? (role ?? "group") : role}
      aria-label={accessibilityLabel}
      className={cn(
        "flex flex-wrap items-center",
        attached
          ? "gap-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none"
          : "gap-2",
        className,
      )}
      {...props}
    />
  );
}

export { ButtonGroup };
