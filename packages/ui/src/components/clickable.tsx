/**
 * Una caja entera que se pulsa: la fila de ajustes que lleva a su pantalla, la
 * tarjeta de una métrica que abre su informe, el bloque de un recurso.
 *
 * Es lo que evita el arreglo de siempre, que es poner el `onClick` en un `div`
 * y dejarlo sin foco ni teclado, o envolver todo en un `Button` y pasarse el
 * resto del rato deshaciéndole el aspecto. Acepta lo mismo que `Box` y decide
 * el elemento por sí sola: con `href` es un enlace y sin él un botón, que es la
 * diferencia entre navegar y hacer algo.
 *
 * El realce al apuntar es un velo encima de la superficie que haya, así que
 * responde igual con fondo propio que sin él.
 *
 * Apagado, un enlace no tiene `disabled`, de modo que se marca con
 * `aria-disabled` y se le quitan los eventos. Un `<a>` con `disabled` a secas
 * sigue navegando.
 *
 * @module
 */

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

import { type BoxStyleProps, boxClasses } from "./box";

/* Los manejadores se tipan contra `HTMLElement` y no contra el botón: el
   componente puede salir como `<a>` o como `<button>`, y el tipo común es lo
   único que encaja en los dos sin que un `onCopy` de uno choque con el del
   otro. */
/** Props de {@link Clickable}. */
export type ClickableProps = BoxStyleProps &
  React.HTMLAttributes<HTMLElement> & {
    /** Con `href` sale un `<a>`; sin él, un `<button>`. */
    href?: string;
    target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    rel?: string;
    download?: string;

    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    name?: string;
    value?: string | number;
    form?: string;

    /**
     * Cómo se llama esto para un lector de pantalla. Casi siempre hace falta:
     * lo de dentro suele ser un título y un párrafo, y anunciarlo entero deja
     * un nombre larguísimo que no dice a dónde lleva.
     */
    accessibilityLabel?: string;

    /**
     * Cede el marcado al hijo, para envolver el enlace del router de turno sin
     * anidar dos `<a>`.
     */
    asChild?: boolean;
  };

/**
 * Una caja entera que se pulsa: la fila de ajustes que lleva a su pantalla, la
 * tarjeta de una métrica que abre su informe, el bloque de un recurso.
 *
 * Es lo que evita el arreglo de siempre, que es poner el `onClick` en un `div`
 * y dejarlo sin foco ni teclado, o envolver todo en un `Button` y pasarse el
 * resto del rato deshaciéndole el aspecto. Acepta lo mismo que `Box` y decide
 * el elemento por sí sola: con `href` es un enlace y sin él un botón, que es la
 * diferencia entre navegar y hacer algo.
 *
 * El realce al apuntar es un velo encima de la superficie que haya, así que
 * responde igual con fondo propio que sin él.
 *
 * Apagado, un enlace no tiene `disabled`, de modo que se marca con
 * `aria-disabled` y se le quitan los eventos. Un `<a>` con `disabled` a secas
 * sigue navegando.
 */
export const Clickable: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ClickableProps> & React.RefAttributes<HTMLElement>
> = React.forwardRef<HTMLElement, ClickableProps>(
  (
    {
      className,
      padding,
      paddingX,
      paddingY,
      background,
      border,
      radius,
      shadow,
      overflowHidden,
      href,
      target,
      rel,
      download,
      type = "button",
      disabled,
      accessibilityLabel,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const isLink = href !== undefined;
    const Component: React.ElementType = asChild ? Slot : isLink ? "a" : "button";

    const elementProps = isLink
      ? {
          href: disabled ? undefined : href,
          target,
          rel: rel ?? (target === "_blank" ? "noreferrer noopener" : undefined),
          download,
        }
      : { type, disabled };

    return (
      <Component
        data-slot="clickable"
        ref={ref}
        aria-label={accessibilityLabel}
        aria-disabled={disabled || undefined}
        className={cn(
          "block w-full cursor-pointer text-start transition-[background-color,box-shadow] duration-(--duration-fast) ease-out",
          "hover:bg-state-hover active:bg-state-active",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
          "aria-disabled:pointer-events-none aria-disabled:opacity-50",
          boxClasses({
            padding,
            paddingX,
            paddingY,
            background,
            border,
            radius,
            shadow,
            overflowHidden,
          }),
          className,
        )}
        {...elementProps}
        {...props}
      />
    );
  },
);
Clickable.displayName = "Clickable";
