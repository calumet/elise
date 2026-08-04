import * as React from "react";

import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Marca de campo inválido, compartida por los controles de texto.
 *
 * El relleno acompaña al borde porque un borde de color es lo primero que se
 * pierde de vista al recorrer un formulario largo, y porque en un formulario con
 * varios errores el relleno dice de un vistazo cuántos quedan. Lo enciende
 * `aria-invalid`, que es el mismo atributo que ya pone `Field`, así que no hace
 * falta una prop aparte que se pueda desincronizar del estado real.
 */
export const CAMPO_INVALIDO =
  "aria-invalid:border-destructive-subtle-foreground aria-invalid:bg-destructive-subtle";

/**
 * La caja de un campo: alto, borde, radio, relleno y foco.
 *
 * La comparten los controles que se escriben y los que solo abren algo pero se
 * presentan como campo, como los selectores de fecha. Está aquí y no repetida en
 * cada uno porque la última vez que se repitió acabaron con tres altos y dos
 * posiciones de icono distintos entre controles que el usuario ve en la misma
 * pantalla.
 */
export const CAJA_CAMPO =
  "flex h-9 w-full rounded-md border border-input hover:border-border-strong bg-background px-3 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

/**
 * La misma caja, pero para campos que llevan piezas dentro: un icono, un
 * prefijo, un botón de paso, unas etiquetas.
 *
 * Cambia dos cosas respecto a `CAJA_CAMPO`. El anillo de foco reacciona a
 * `focus-within` y no a `focus-visible`, porque quien recibe el foco es el
 * `<input>` de dentro y no la caja. Y el relleno de la derecha es menor, para
 * que un botón pegado al borde no quede hundido.
 *
 * El apagado mira al `<input>` y no a cualquier descendiente apagado. Con
 * `has-disabled` a secas, un campo numérico en su tope apagaba el botón de sumar
 * y con él se apagaba el campo entero, valor incluido.
 */
export const CAJA_CAMPO_COMPUESTA =
  "flex h-9 w-full items-center gap-1.5 rounded-md border border-input bg-background ps-3 pe-1 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:border-border-strong focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50";

/** El `<input>` que va dentro de una caja compuesta: sin caja propia. */
export const CAMPO_DESNUDO =
  "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      data-slot="input"
      ref={ref}
      type={type}
      className={cn(CAJA_CAMPO, "placeholder:text-muted-foreground", CAMPO_INVALIDO, className)}
      {...props}
    />
  ),
);

Input.displayName = "Input";
