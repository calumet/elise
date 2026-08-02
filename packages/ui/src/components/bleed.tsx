import * as React from "react";

import type { SpaceScale } from "./box";

import { cn } from "@/lib/cn";

export type BleedProps = React.ComponentProps<"div"> & {
  as?: React.ElementType;

  /** Cuánto sangrar en ambos ejes. */
  all?: SpaceScale;
  x?: SpaceScale;
  y?: SpaceScale;
  top?: SpaceScale;
  bottom?: SpaceScale;
};

/* Márgenes negativos, uno por valor de la escala. Van literales, ya que
   Tailwind no ve las clases interpoladas. */
const allClasses: Record<SpaceScale, string> = {
  0: "-m-0",
  1: "-m-1",
  2: "-m-2",
  3: "-m-3",
  4: "-m-4",
  5: "-m-5",
  6: "-m-6",
  8: "-m-8",
  10: "-m-10",
  12: "-m-12",
  16: "-m-16",
};

const xClasses: Record<SpaceScale, string> = {
  0: "-mx-0",
  1: "-mx-1",
  2: "-mx-2",
  3: "-mx-3",
  4: "-mx-4",
  5: "-mx-5",
  6: "-mx-6",
  8: "-mx-8",
  10: "-mx-10",
  12: "-mx-12",
  16: "-mx-16",
};

const yClasses: Record<SpaceScale, string> = {
  0: "-my-0",
  1: "-my-1",
  2: "-my-2",
  3: "-my-3",
  4: "-my-4",
  5: "-my-5",
  6: "-my-6",
  8: "-my-8",
  10: "-my-10",
  12: "-my-12",
  16: "-my-16",
};

const topClasses: Record<SpaceScale, string> = {
  0: "-mt-0",
  1: "-mt-1",
  2: "-mt-2",
  3: "-mt-3",
  4: "-mt-4",
  5: "-mt-5",
  6: "-mt-6",
  8: "-mt-8",
  10: "-mt-10",
  12: "-mt-12",
  16: "-mt-16",
};

const bottomClasses: Record<SpaceScale, string> = {
  0: "-mb-0",
  1: "-mb-1",
  2: "-mb-2",
  3: "-mb-3",
  4: "-mb-4",
  5: "-mb-5",
  6: "-mb-6",
  8: "-mb-8",
  10: "-mb-10",
  12: "-mb-12",
  16: "-mb-16",
};

/**
 * Rompe el padding del contenedor padre con margen negativo. Sirve para que un
 * elemento llegue al borde de una Card sin tener que sacarle el padding a la
 * Card entera: una imagen a sangre, una tabla a todo el ancho, un separador.
 *
 * El valor tiene que coincidir con el padding del padre; si no, el contenido se
 * desborda.
 */
function Bleed({ className, as: Comp = "div", all, x, y, top, bottom, ...props }: BleedProps) {
  return (
    <Comp
      data-slot="bleed"
      className={cn(
        all !== undefined && allClasses[all],
        x !== undefined && xClasses[x],
        y !== undefined && yClasses[y],
        top !== undefined && topClasses[top],
        bottom !== undefined && bottomClasses[bottom],
        className,
      )}
      {...props}
    />
  );
}

export { Bleed };
