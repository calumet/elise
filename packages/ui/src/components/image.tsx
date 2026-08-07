/**
 * Imagen.
 *
 * Existe como componente y no como `<img>` pelado por tres cosas que se olvidan
 * una y otra vez: el texto alternativo, que acá es obligatorio; la carga
 * diferida, que va puesta salvo que se pida lo contrario; y la proporción, que
 * reserva el hueco y evita el salto de maquetación al cargar.
 *
 * La proporción va como estilo y no como clase a propósito. Tailwind escanea el
 * código fuente en build y nunca genera una clase armada por interpolación, así
 * que un `aspect-[3/2]` construido con el valor de una prop no existiría.
 *
 * @module
 */

import * as React from "react";

import type { BoxProps } from "./box";

import { cn } from "@/lib/cn";

/** Props de {@link Image}. */
export type ImageProps = Omit<React.ComponentProps<"img">, "width" | "height"> & {
  /**
   * Obligatorio, y vacío para la imagen que no aporta nada. Es la diferencia
   * entre una ilustración que un lector de pantalla se salta y una que anuncia
   * el nombre del archivo.
   */
  alt: string;

  /**
   * La proporción, del tipo `16/9` o `1`. Reserva el sitio antes de que la
   * imagen llegue, así que la página no pega el salto de siempre al cargar.
   */
  aspectRatio?: number | string;

  objectFit?: "cover" | "contain";

  radius?: BoxProps["radius"];
  border?: BoxProps["border"];

  /** Ocupa todo el ancho disponible. Sin esto se queda en su tamaño natural. */
  fill?: boolean;
};

const ajustes: Record<NonNullable<ImageProps["objectFit"]>, string> = {
  cover: "object-cover",
  contain: "object-contain",
};

const radios: Record<NonNullable<BoxProps["radius"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

/**
 * Imagen.
 *
 * Existe como componente y no como `<img>` pelado por tres cosas que se olvidan
 * una y otra vez: el texto alternativo, que acá es obligatorio; la carga
 * diferida, que va puesta salvo que se pida lo contrario; y la proporción, que
 * reserva el hueco y evita el salto de maquetación al cargar.
 *
 * La proporción va como estilo y no como clase a propósito. Tailwind escanea el
 * código fuente en build y nunca genera una clase armada por interpolación, así
 * que un `aspect-[3/2]` construido con el valor de una prop no existiría.
 */
export const Image: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ImageProps> & React.RefAttributes<HTMLImageElement>
> = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      alt,
      aspectRatio,
      objectFit = "cover",
      radius,
      border,
      fill,
      loading = "lazy",
      style,
      ...props
    },
    ref,
  ) => (
    <img
      data-slot="image"
      ref={ref}
      alt={alt}
      loading={loading}
      style={aspectRatio !== undefined ? { aspectRatio, ...style } : style}
      className={cn(
        "block max-w-full",
        fill && "w-full",
        ajustes[objectFit],
        radius && radios[radius],
        border && (border === "strong" ? "border border-border-strong" : "border border-border"),
        className,
      )}
      {...props}
    />
  ),
);
Image.displayName = "Image";

/** Props de {@link Thumbnail}. */
export type ThumbnailProps = Omit<ImageProps, "aspectRatio" | "fill" | "radius"> & {
  size?: "xs" | "sm" | "md" | "lg";
};

/* 24, 40, 60 y 80. Los cuatro caen en la rejilla de 4px del sistema. */
const tamanos: Record<NonNullable<ThumbnailProps["size"]>, string> = {
  xs: "size-6",
  sm: "size-10",
  md: "size-15",
  lg: "size-20",
};

/**
 * La miniatura de un recurso: el producto de una fila, el icono de una
 * aplicación.
 *
 * Es cuadrada y de tamaño fijo, que es lo que la separa de una imagen normal:
 * puesta en una lista, lo que hace legible la columna es que todas midan igual,
 * no que cada una respete su proporción.
 *
 * Lleva borde siempre. Una foto de producto sobre fondo blanco, y son casi
 * todas, se queda sin contorno y la fila parece tener un hueco.
 *
 * El radio es el mismo en los cuatro tamaños y no una escala como en el avatar
 * cuadrado. Lo que se pone en fila son miniaturas de tamaños distintos, y con
 * el radio escalando la columna se lee desparejada.
 */
export const Thumbnail: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ThumbnailProps> & React.RefAttributes<HTMLImageElement>
> = React.forwardRef<HTMLImageElement, ThumbnailProps>(
  ({ className, size = "sm", ...props }, ref) => (
    <Image
      data-slot="thumbnail"
      ref={ref}
      border
      radius="md"
      className={cn("shrink-0", tamanos[size], className)}
      {...props}
    />
  ),
);
Thumbnail.displayName = "Thumbnail";
