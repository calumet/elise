export type DitherKind = "flow" | "patch" | "dark" | "text";

export type DitherProps = {
  /** Qué forma toma la nube de puntos. */
  kind: DitherKind;
  /** Palabra que dibuja `kind="text"`. */
  text?: string;
  /** Lado de la celda en px. */
  cell?: number;
  className?: string;
};

/**
 * Lienzo de la nube de puntos.
 *
 * Solo emite el elemento y su configuración. Quien lo pinta y lo anima es
 * `public/dither.js`, que se carga aparte del bundle: el canvas necesita el
 * elemento y el CSS, y las dos cosas están listas mucho antes de que React
 * hidrate.
 */
export function Dither({ kind, text, cell, className }: DitherProps) {
  return (
    <canvas
      aria-hidden
      /* `public/dither.js` corre antes de hidratar y le fija `width` y `height`
         al ajustarlo a su caja. React llega después, no tiene esos atributos en
         su árbol y los reporta como desajuste. Es el caso para el que existe
         este prop: el DOM se cambia a propósito fuera de React. */
      suppressHydrationWarning
      className={className}
      data-dither={kind}
      data-cell={cell}
      data-text={text}
    />
  );
}
