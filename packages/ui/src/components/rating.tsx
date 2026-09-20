/**
 * Puntuación con estrellas.
 *
 * Cuando se puede puntuar es un grupo de radios de verdad, uno por estrella: eso
 * le da el recorrido con flechas, el nombre para el formulario y el anuncio de
 * «3 de 5» sin inventar nada. Un montón de botones con `aria-label` daría lo
 * mismo a la vista y nada de eso.
 *
 * En `readOnly` deja de ser un control y pasa a ser una imagen con texto
 * alternativo. Es lo que corresponde: la puntuación media de un producto no es
 * algo con lo que se pueda interactuar, y dejarla enfocable manda al teclado por
 * cinco paradas que no llevan a ningún sitio.
 *
 * Solo estrellas enteras. La media estrella se ve mucho pero solo tiene sentido
 * al mostrar promedios, no al puntuar, y ahí ya sirve `readOnly` con el número
 * al lado.
 *
 * @module
 */

import { Star } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link Rating}. */
export type RatingProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;

  /** Cuántas estrellas hay. */
  max?: number;

  /** Solo se muestra. Deja de ser un control y pasa a ser texto con forma de estrellas. */
  readOnly?: boolean;

  disabled?: boolean;
  name?: string;

  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<RatingProps["size"]>, string> = {
  sm: "size-icon-md",
  md: "size-icon-lg",
  lg: "size-icon-xl",
};

/**
 * Puntuación con estrellas.
 *
 * Cuando se puede puntuar es un grupo de radios de verdad, uno por estrella: eso
 * le da el recorrido con flechas, el nombre para el formulario y el anuncio de
 * «3 de 5» sin inventar nada. Un montón de botones con `aria-label` daría lo
 * mismo a la vista y nada de eso.
 *
 * En `readOnly` deja de ser un control y pasa a ser una imagen con texto
 * alternativo. Es lo que corresponde: la puntuación media de un producto no es
 * algo con lo que se pueda interactuar, y dejarla enfocable manda al teclado por
 * cinco paradas que no llevan a ningún sitio.
 *
 * Solo estrellas enteras. La media estrella se ve mucho pero solo tiene sentido
 * al mostrar promedios, no al puntuar, y ahí ya sirve `readOnly` con el número
 * al lado.
 */
export const Rating: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<RatingProps> & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      value,
      defaultValue = 0,
      onValueChange,
      max = 5,
      readOnly = false,
      disabled = false,
      name,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const generated = React.useId();
    const template = useElLabel("ui", "ratingValue", "{value} de {max}");
    const renderLabel = (n: number) =>
      template.replace("{value}", String(n)).replace("{max}", String(max));

    const [internal, setInternal] = React.useState(defaultValue);
    const controlled = value !== undefined;
    const dots = controlled ? value : internal;

    const select = (n: number) => {
      if (!controlled) setInternal(n);
      onValueChange?.(n);
    };

    const stars = Array.from({ length: max }, (_, i) => i + 1);

    const star = (n: number) => (
      <Star
        aria-hidden="true"
        className={cn(
          sizes[size],
          "transition-[color,fill] duration-(--duration-fast) ease-out",
          n <= dots ? "fill-warning text-warning" : "fill-transparent text-border-strong",
        )}
      />
    );

    if (readOnly) {
      return (
        <div
          data-slot="rating"
          ref={ref}
          role="img"
          aria-label={renderLabel(dots)}
          className={cn("inline-flex items-center gap-0.5", className)}
          {...props}
        >
          {stars.map((n) => (
            <React.Fragment key={n}>{star(n)}</React.Fragment>
          ))}
        </div>
      );
    }

    return (
      <div
        data-slot="rating"
        ref={ref}
        role="radiogroup"
        className={cn("inline-flex items-center gap-0.5", className)}
        {...props}
      >
        {stars.map((n) => (
          <label
            key={n}
            className={cn(
              "inline-flex cursor-pointer rounded-xs p-0.5",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-1 has-[:focus-visible]:ring-offset-background has-[:focus-visible]:outline-none",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={name ?? generated}
              value={n}
              checked={n === dots}
              disabled={disabled}
              onChange={() => select(n)}
            />
            <span className="sr-only">{renderLabel(n)}</span>
            {star(n)}
          </label>
        ))}
      </div>
    );
  },
);
Rating.displayName = "Rating";
