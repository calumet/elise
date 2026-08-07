/**
 * La ruta de migas, dentro de un `<nav>` rotulado.
 *
 * @module
 */

import { ChevronRight, Ellipsis as MoreHorizontal } from "@calumet/elise-icons";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/cn";

/** La ruta de migas, dentro de un `<nav>` rotulado. */
function Breadcrumb({ ...props }: React.ComponentProps<"nav">): React.JSX.Element {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/** La lista de tramos. */
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">): React.JSX.Element {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

/** Un tramo. */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

/** El enlace de un tramo. */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}): React.JSX.Element {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

/** El tramo actual, que no es enlace y lleva `aria-current`. */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

/** El separador entre tramos. Se oculta del lector de pantalla. */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">): React.JSX.Element {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

/** Los puntos suspensivos que reemplazan a los tramos del medio cuando la ruta es larga. */
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
