import * as React from "react";

import { cn } from "@/lib/cn";

/* Los atributos se tipan contra `HTMLElement` porque la lista sale como `<ul>` o
   como `<ol>` según la variante, y atarlos a uno le mentiría al otro. */
export type ListProps = React.HTMLAttributes<HTMLElement> & {
  /** `numbered` sale como `<ol>` y numera. */
  variant?: "bulleted" | "numbered";
};

/**
 * Una lista de puntos o de pasos.
 *
 * Existe porque el reset de Tailwind le quita los marcadores a `<ul>` y `<ol>`,
 * así que una lista escrita a mano sale como párrafos pegados. Cada pantalla
 * termina reponiendo `list-disc` y su sangría por su cuenta, y con dos sangrías
 * distintas en la misma página.
 *
 * El marcador va por fuera del texto, no dentro. Con `list-inside`, una entrada
 * de dos renglones alinea el segundo con el punto y no con la primera letra.
 */
function List({ className, variant = "bulleted", ...props }: ListProps): React.JSX.Element {
  const Comp: React.ElementType = variant === "numbered" ? "ol" : "ul";

  return (
    <Comp
      data-slot="list"
      data-variant={variant}
      className={cn(
        "flex list-outside flex-col gap-1 ps-5 text-sm text-foreground",
        variant === "numbered" ? "list-decimal" : "list-disc",
        className,
      )}
      {...props}
    />
  );
}

function ListItem({ className, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return <li data-slot="list-item" className={cn("ps-1", className)} {...props} />;
}

export { List, ListItem };
