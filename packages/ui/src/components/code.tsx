import * as React from "react";

import { cn } from "@/lib/cn";

export type CodeProps = React.ComponentProps<"code">;

/**
 * Un fragmento de código dentro de una línea de texto: el nombre de un prop, un
 * valor, una ruta.
 *
 * Lleva fondo y contorno además de la tipografía monoespaciada. Solo con la
 * fuente, un identificador corto metido en una frase no se separa de ella; la
 * caja es lo que dice dónde empieza y dónde acaba.
 *
 * El tamaño es fijo y no relativo al texto que lo rodea. Lo natural sería
 * `0.9em`, porque una monoespaciada se ve más grande que una de palo al mismo
 * tamaño, pero eso deja el resultado fuera de la escala tipográfica en cuanto el
 * texto de alrededor no mide 14px. Un paso por debajo cumple lo mismo y sigue
 * siendo un tamaño de la escala.
 *
 * Para un bloque de varias líneas esto no sirve: eso es un `<pre>`, que necesita
 * conservar los saltos y poder desplazarse.
 */
export const Code = React.forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => (
  <code
    data-slot="code"
    ref={ref}
    className={cn(
      "rounded-sm border border-border-subtle bg-muted px-1 py-0.5 font-mono text-sm text-foreground",
      className,
    )}
    {...props}
  />
));
Code.displayName = "Code";
