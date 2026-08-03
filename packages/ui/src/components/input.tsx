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
