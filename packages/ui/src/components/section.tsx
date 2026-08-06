import * as React from "react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./card";

import { cn } from "@/lib/cn";

export type SectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** El rótulo del grupo. Sale como encabezado y nombra la región. */
  heading?: React.ReactNode;

  /**
   * Cómo se llama la región cuando no lleva rótulo a la vista. Sin una de las
   * dos cosas queda sin nombre, y un lector de pantalla la anuncia como
   * «región» a secas, que no dice nada.
   */
  accessibilityLabel?: string;

  /** `none` quita el relleno, para meter algo que ya trae el suyo. */
  padding?: "base" | "none";

  /** Acciones del grupo, a la derecha del rótulo. */
  actions?: React.ReactNode;
};

/**
 * Un grupo de contenido con su rótulo: la unidad con la que se arma una
 * pantalla larga.
 *
 * Es el envoltorio opinado sobre `Card`, que sigue siendo el primitivo
 * componible. La diferencia importa: una pantalla de ajustes con ocho grupos
 * escribe ocho veces la tarjeta, su cabecera y su título, y a la tercera hay
 * uno con el título en otro tamaño. Con el rótulo como prop no queda dónde
 * desviarse. Quien necesite pie, descripción o una cabecera partida compone
 * `Card` a mano, que para eso está.
 *
 * Sale como `<section>` y no como `<div>`: con nombre accesible se convierte en
 * una región, y eso es lo que permite saltar de grupo en grupo sin recorrer
 * todo el contenido.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    { className, heading, accessibilityLabel, padding = "base", actions, children, ...props },
    ref,
  ) => {
    const idDelRotulo = `${React.useId()}-heading`;
    const sinRelleno = padding === "none";

    return (
      <Card
        as="section"
        ref={ref}
        data-slot="section"
        aria-labelledby={heading ? idDelRotulo : undefined}
        aria-label={heading ? undefined : accessibilityLabel}
        className={cn(sinRelleno && "py-0", className)}
        {...props}
      >
        {heading || actions ? (
          <CardHeader className={cn(sinRelleno && "pt-6")}>
            {heading ? (
              <CardTitle as="h2" id={idDelRotulo}>
                {heading}
              </CardTitle>
            ) : null}
            {actions ? <CardAction>{actions}</CardAction> : null}
          </CardHeader>
        ) : null}

        {sinRelleno ? children : <CardContent>{children}</CardContent>}
      </Card>
    );
  },
);
Section.displayName = "Section";
