import * as React from "react";

import { cn } from "@/lib/cn";
import { SUPERFICIE } from "@/lib/superficie";

/* La `ref` se ensancha a `HTMLElement` porque con `as` la tarjeta puede salir
   como cualquier etiqueta, y atarla al `<div>` le mentiría a quien la use como
   `<section>`. */
export type CardProps = Omit<React.ComponentProps<"div">, "ref"> & {
  as?: React.ElementType;
  ref?: React.Ref<HTMLElement>;
};

function Card({ className, as: Comp = "div", ...props }: CardProps): React.JSX.Element {
  return (
    <Comp
      data-slot="card"
      className={cn(SUPERFICIE, "flex flex-col gap-3 py-4 text-card-foreground", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-header"
      className={cn(
        /* Las filas las crea `auto-rows-min`. Fijarlas en dos deja una vacía
           cuando la cabecera solo trae título, y ese hueco se suma debajo del
           rótulo. */
        "@container/card-header grid auto-rows-min items-start gap-2 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

/* `as` para cuando el título de la tarjeta es además el encabezado de una
   región, que ahí tiene que ser un `<h2>` y no un `<div>`. */
function CardTitle({
  className,
  as: Comp = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: React.ElementType }): React.JSX.Element {
  return (
    <Comp
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return <div data-slot="card-content" className={cn("px-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 [.border-t]:pt-4", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
