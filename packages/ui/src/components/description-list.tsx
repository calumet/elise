/**
 * Lista de pares: un término y lo que vale.
 *
 * Es `<dl>` de verdad, con sus `<dt>` y `<dd>`, y no dos columnas de `<div>`.
 * La relación entre el rótulo y su valor está en el marcado, así que un lector
 * de pantalla puede recorrerla por términos en vez de leer veinte textos sueltos
 * sin saber cuál explica a cuál.
 *
 * Estrecha se apila y ancha se parte en dos columnas, la del término a un cuarto
 * del ancho: el término suele ser una o dos palabras y el valor una frase, así
 * que repartir a la mitad dejaría la primera columna medio vacía. El corte está
 * en 490px, el mismo con el que la tabla pasa a lista.
 *
 * Mide su propio hueco y no la ventana: la misma lista puede ir a lo ancho de
 * una página o dentro de una tarjeta estrecha, y lo que decide es cuánto sitio
 * tiene, no cuánto tiene la pantalla. De ahí el `<div>` de fuera, que es lo que
 * se mide.
 *
 * El filete va entre pares y no debajo de cada línea. Con una raya por línea, el
 * término y su valor se leerían como dos filas distintas en vez de como una.
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link DescriptionList}. */
export type DescriptionListProps = React.ComponentProps<"dl"> & {
  /** `tight` aprieta el aire vertical a la mitad. */
  gap?: "loose" | "tight";
};

const DentroDeListaApretada: React.Context<boolean> = React.createContext(false);

/**
 * Lista de pares: un término y lo que vale.
 *
 * Es `<dl>` de verdad, con sus `<dt>` y `<dd>`, y no dos columnas de `<div>`.
 * La relación entre el rótulo y su valor está en el marcado, así que un lector
 * de pantalla puede recorrerla por términos en vez de leer veinte textos sueltos
 * sin saber cuál explica a cuál.
 *
 * Estrecha se apila y ancha se parte en dos columnas, la del término a un cuarto
 * del ancho: el término suele ser una o dos palabras y el valor una frase, así
 * que repartir a la mitad dejaría la primera columna medio vacía. El corte está
 * en 490px, el mismo con el que la tabla pasa a lista.
 *
 * Mide su propio hueco y no la ventana: la misma lista puede ir a lo ancho de
 * una página o dentro de una tarjeta estrecha, y lo que decide es cuánto sitio
 * tiene, no cuánto tiene la pantalla. De ahí el `<div>` de fuera, que es lo que
 * se mide.
 *
 * El filete va entre pares y no debajo de cada línea. Con una raya por línea, el
 * término y su valor se leerían como dos filas distintas en vez de como una.
 */
export const DescriptionList: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<DescriptionListProps> & React.RefAttributes<HTMLDListElement>
> = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, gap = "loose", ...props }, ref) => (
    <DentroDeListaApretada.Provider value={gap === "tight"}>
      <div className="@container w-full">
        <dl
          data-slot="description-list"
          data-gap={gap}
          ref={ref}
          className={cn(
            "m-0 grid grid-cols-1 p-0 break-words @min-[490px]:grid-cols-[minmax(0,25%)_minmax(0,1fr)]",
            className,
          )}
          {...props}
        />
      </div>
    </DentroDeListaApretada.Provider>
  ),
);
DescriptionList.displayName = "DescriptionList";

/**
 * El término.
 *
 * En dos columnas el filete tiene que cruzar las dos, así que lo llevan el
 * término y su valor, cada uno el trozo que le toca. Apilada solo lo lleva el
 * término, que es el que abre el par.
 */
export const DescriptionListTerm: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<"dt">> & React.RefAttributes<HTMLElement>
> = React.forwardRef<HTMLElement, React.ComponentProps<"dt">>(({ className, ...props }, ref) => {
  const apretada = React.useContext(DentroDeListaApretada);
  return (
    <dt
      data-slot="description-list-term"
      ref={ref}
      className={cn(
        "font-semibold text-foreground",
        "[&:not(:first-child)]:border-t [&:not(:first-child)]:border-border-subtle",
        apretada
          ? "pt-2 pb-1 @min-[490px]:py-2 @min-[490px]:pe-2"
          : "pt-4 pb-2 @min-[490px]:py-4 @min-[490px]:pe-4",
        className,
      )}
      {...props}
    />
  );
});
DescriptionListTerm.displayName = "DescriptionListTerm";

/** El valor de un par: el `<dd>`. */
export const DescriptionListDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentProps<"dd">> & React.RefAttributes<HTMLElement>
> = React.forwardRef<HTMLElement, React.ComponentProps<"dd">>(({ className, ...props }, ref) => {
  const apretada = React.useContext(DentroDeListaApretada);
  return (
    <dd
      data-slot="description-list-description"
      ref={ref}
      className={cn(
        "m-0 text-foreground",
        "@min-[490px]:[&:not(:nth-child(2))]:border-t @min-[490px]:[&:not(:nth-child(2))]:border-border-subtle",
        apretada ? "pb-2 @min-[490px]:py-2" : "pb-4 @min-[490px]:py-4",
        className,
      )}
      {...props}
    />
  );
});
DescriptionListDescription.displayName = "DescriptionListDescription";
