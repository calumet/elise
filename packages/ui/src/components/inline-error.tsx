import { AlertCircle } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";

export type InlineErrorProps = React.ComponentProps<"p">;

/**
 * El mensaje de error de un campo.
 *
 * Lleva icono además de color. El color por sí solo no distingue nada para
 * quien no separa el rojo del gris, y debajo de un campo hay dos textos
 * pequeños seguidos, la ayuda y el error, que si no solo se diferencian por
 * eso.
 *
 * El icono no se anuncia: repetiría lo que ya dicen `aria-invalid` en el control
 * y el propio mensaje. Está para que el error se vea de un vistazo.
 *
 * El rojo es el oscuro y no el de relleno, casi medio tono por debajo: un texto
 * de 12px en el rojo saturado se lee peor sobre blanco de lo que parece.
 *
 * Sin mensaje no dibuja nada, para poder escribirlo sin condicional alrededor.
 */
export const InlineError = React.forwardRef<HTMLParagraphElement, InlineErrorProps>(
  ({ className, children, ...props }, ref) => {
    if (children === null || children === undefined || children === false) return null;

    return (
      <p
        data-slot="inline-error"
        ref={ref}
        /* `role="alert"` para que se anuncie al aparecer, sin esperar a que el
           foco vuelva al campo. */
        role="alert"
        className={cn(
          "flex items-start gap-1 text-xs font-medium text-destructive-subtle-foreground",
          className,
        )}
        {...props}
      >
        <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
        <span className="min-w-0">{children}</span>
      </p>
    );
  },
);
InlineError.displayName = "InlineError";
