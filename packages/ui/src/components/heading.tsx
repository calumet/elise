/**
 * El titular de una sección, en la familia de titular del tema.
 *
 * Es el único componente que usa `--font-display`. Un tema que no lo defina lo
 * deja cayendo en `--font-sans`, así que sin tocar nada se ve como un `Text` en
 * negrita, que es lo que había antes.
 *
 * `level` pone la etiqueta y de ahí sale el tamaño, para que un `h2` no tenga
 * que elegirlo cada pantalla. Pasar `size` lo separa, igual que en `Text`: el
 * nivel es la semántica y el tamaño es lo que se ve.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

import { Text, type TextProps } from "./text";

/** Props de {@link Heading}. */
export type HeadingProps = Omit<TextProps, "as" | "truncate" | "lines"> & {
  /** El nivel del encabezado, de `h1` a `h6`. Por defecto `2`. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

const TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/* Los tres últimos se juntan en el cuerpo: por debajo de `lg` lo que separa a un
   titular de su párrafo es el peso, no el tamaño. */
const LEVEL_SIZES: Record<NonNullable<HeadingProps["level"]>, TextProps["size"]> = {
  1: "3xl",
  2: "2xl",
  3: "xl",
  4: "lg",
  5: "base",
  6: "base",
};

/** El titular de una sección, en la familia de titular del tema. `level` pone la etiqueta y su tamaño; `size` lo separa. */
function Heading({
  className,
  level = 2,
  size,
  weight = "semibold",
  balance = true,
  ...props
}: HeadingProps): React.JSX.Element {
  return (
    <Text
      as={TAGS[level - 1]}
      size={size ?? LEVEL_SIZES[level]}
      weight={weight}
      balance={balance}
      data-slot="heading"
      className={cn("font-display", className)}
      {...props}
    />
  );
}

export { Heading };
