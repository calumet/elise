/**
 * Campo de texto de una línea. Con `aria-invalid` se enciende la marca de error, que es el mismo atributo que ya pone `Field`.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** Tamaño de un campo o de un control que se presenta como campo. */
export type TamanoCampo = "sm" | "md" | "lg" | "xl";

/**
 * El alto, el relleno y el tamaño de texto de cada paso.
 *
 * Vive acá y lo consumen `Input`, `SelectTrigger` y `ComboboxTrigger`, porque un
 * campo y un disparador puestos en la misma fila tienen que medir lo mismo. Los
 * altos coinciden con los de `Button`, que lleva más relleno a los costados
 * porque su caja la marca el rótulo y no el valor que se escribe dentro.
 */
export const TAMANOS_CAMPO: Record<TamanoCampo, string> = {
  sm: "h-8 px-3 py-1 text-sm",
  md: "h-9 px-3 py-2 text-base",
  lg: "h-10 px-4 py-2 text-base",
  xl: "h-11 px-4 py-2.5 text-base",
};

/** Props de {@link Input}. */
export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Por defecto `md`, 36px de alto. */
  size?: TamanoCampo;
};

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

/**
 * El `<input>` que va dentro de una caja compuesta: sin caja propia.
 *
 * `w-0` no es lo que mide, que eso lo pone `flex-1`: es lo que impide que el
 * ancho por defecto del `<input>` (veinte caracteres, 191px) sea el mínimo del
 * campo entero. Con él puesto, un campo compuesto no cabía en una columna de
 * 294px por más `min-w-0` que se le pusiera por fuera.
 */
export const CAMPO_DESNUDO =
  "w-0 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed";

/** Campo de texto de una línea. Con `aria-invalid` se enciende la marca de error, que es el mismo atributo que ya pone `Field`. */
export const Input: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<InputProps> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", size = "md", ...props }, ref) => (
    <input
      data-slot="input"
      ref={ref}
      type={type}
      className={cn(
        CAJA_CAMPO,
        TAMANOS_CAMPO[size],
        "placeholder:text-muted-foreground",
        CAMPO_INVALIDO,
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
