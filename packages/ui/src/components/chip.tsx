/**
 * Ficha: un dato que alguien puso y normalmente puede quitar.
 *
 * No es un `Badge`, aunque se parezcan de lejos. El badge es un estado que el
 * sistema afirma («despachado», «vencido»), va con tono semántico y no se
 * quita. La ficha es contenido: una etiqueta escrita, un filtro aplicado, un
 * valor elegido de una lista.
 *
 * De ahí sale su tipografía, que es la del texto y no la de una etiqueta:
 * 13px en peso normal y color de contenido, contra los 11px en semibold y
 * color tenue del badge. Lo que va dentro se lee, no se ojea.
 *
 * ```tsx
 * <Chip onRemove={() => quitar(valor)}>{valor}</Chip>
 * ```
 *
 * @module
 */

import { X } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link Chip}. */
export type ChipProps = Omit<React.ComponentProps<"span">, "color"> & {
  /**
   * Cuánto pesa la ficha. No hay tono semántico a propósito: un chip no es un
   * estado que el sistema afirme sino un dato que alguien puso, y teñir de rojo
   * un filtro que el usuario escribió no significaría nada.
   */
  color?: "subdued" | "base" | "strong";

  /** Muestra el botón de quitar y avisa al pulsarlo. */
  onRemove?: () => void;

  /**
   * Nombre para el botón de quitar cuando el contenido no es texto llano. Con
   * texto llano se saca de ahí, así que solo hace falta si dentro va marcado.
   */
  accessibilityLabel?: string;

  disabled?: boolean;

  /**
   * Con qué se dibuja el quitar.
   *
   * - `button`, el normal: un botón de verdad, que entra solo en el orden de
   *   tabulación.
   * - `span`: `<span role="button">`. Para dentro del disparador de un
   *   combobox, que ya es un `<button>` y no admite otro anidado sin romper el
   *   árbol. El click se atiende igual y el disparador sigue siendo lo
   *   enfocable.
   * - `presentation`: solo el dibujo, sin rol ni click. Para una copia que
   *   existe para medir su ancho y nunca se toca; con rol de botón serían
   *   controles fantasma, encima superpuestos a los de verdad.
   */
  removeAs?: "button" | "span" | "presentation";
};

/* Las tres comparten fondo salvo `strong`, que sube un escalón. `subdued` y
   `base` se separan por el color del texto, no por el relleno: dos grises de
   fondo tan cercanos no se distinguirían, y lo que cambia entre una ficha
   secundaria y una normal es cuánto pide que la leas. */
const colors: Record<NonNullable<ChipProps["color"]>, string> = {
  subdued: "bg-muted text-muted-foreground",
  base: "bg-muted text-foreground",
  strong: "bg-fill-tertiary text-foreground",
};

/**
 * Ficha: un dato que alguien puso y normalmente puede quitar.
 *
 * No es un `Badge`, aunque se parezcan de lejos. El badge es un estado que el
 * sistema afirma («despachado», «vencido»), va con tono semántico y no se
 * quita. La ficha es contenido: una etiqueta escrita, un filtro aplicado, un
 * valor elegido de una lista.
 *
 * De ahí sale su tipografía, que es la del texto y no la de una etiqueta:
 * 13px en peso normal y color de contenido, contra los 11px en semibold y
 * color tenue del badge. Lo que va dentro se lee, no se ojea.
 *
 * ```tsx
 * <Chip onRemove={() => quitar(valor)}>{valor}</Chip>
 * ```
 */
/* Los tres modos de `removeAs` viven acá y no repartidos por el chip. */
function RemoveButton({
  mode,
  disabled,
  name,
  onRemove,
}: {
  mode: NonNullable<ChipProps["removeAs"]>;
  disabled?: boolean;
  name?: string;
  onRemove: () => void;
}): React.JSX.Element {
  const remove = useElLabel("ui", "remove", "Quitar");
  const label = name ? `${remove}: ${name}` : remove;
  const inert = mode === "presentation";
  const Tag = mode === "button" ? "button" : "span";

  const attrs =
    mode === "button"
      ? { type: "button" as const, disabled, "aria-label": label }
      : mode === "span"
        ? { role: "button", tabIndex: -1, "aria-label": label }
        : { "aria-hidden": true };

  return (
    <Tag
      {...attrs}
      onClick={
        inert
          ? undefined
          : (event: React.MouseEvent) => {
              if (disabled) return;
              /* Una ficha vive dentro de cosas que también responden al click,
                 como el disparador de un combobox: sin esto, quitarla abriría
                 la lista al mismo tiempo. */
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }
      }
      className={cn(
        "relative inline-flex size-4 shrink-0 items-center justify-center rounded-xs text-muted-foreground before:absolute before:-inset-1 before:content-['']",
        !inert &&
          "cursor-pointer transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        (disabled || inert) && "pointer-events-none",
      )}
    >
      <X className="size-icon-xs" aria-hidden="true" />
    </Tag>
  );
}

export const Chip: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ChipProps> & React.RefAttributes<HTMLSpanElement>
> = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className,
      children,
      color = "base",
      onRemove,
      accessibilityLabel,
      disabled,
      removeAs = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <span
        data-slot="chip"
        ref={ref}
        className={cn(
          "inline-flex h-6 max-w-full shrink-0 items-center gap-1 rounded-sm text-sm",
          onRemove ? "ps-2 pe-1" : "px-2",
          colors[color],
          disabled && "opacity-50",
          className,
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        {onRemove ? (
          <RemoveButton
            mode={removeAs}
            disabled={disabled}
            name={accessibilityLabel ?? (typeof children === "string" ? children : undefined)}
            onRemove={onRemove}
          />
        ) : null}
      </span>
    );
  },
);
Chip.displayName = "Chip";
