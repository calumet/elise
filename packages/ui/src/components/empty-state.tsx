import * as React from "react";

import { cn } from "@/lib/cn";

export type EmptyStateProps = React.ComponentProps<"div"> & {
  size?: "sm" | "md";
};

const sizeClasses: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "gap-3 px-6 py-8",
  md: "gap-4 px-6 py-14",
};

/**
 * Estado vacío para listas, tablas y paneles sin contenido. Es un contenedor
 * compuesto: `EmptyStateMedia`, `EmptyStateTitle`, `EmptyStateDescription` y
 * `EmptyStateActions` se combinan según haga falta.
 *
 * Para "no hay resultados" de una búsqueda, el título debería nombrar el
 * término buscado, no decir solo "Sin resultados".
 */
function EmptyState({ className, size = "md", ...props }: EmptyStateProps): React.JSX.Element {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateMedia({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="empty-state-media"
      aria-hidden="true"
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateTitle({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="empty-state-title"
      className={cn("text-lg font-semibold text-balance text-foreground", className)}
      {...props}
    />
  );
}

function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="empty-state-description"
      className={cn("max-w-sm text-sm text-balance text-muted-foreground", className)}
      {...props}
    />
  );
}

function EmptyStateActions({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn("mt-1 flex flex-wrap items-center justify-center gap-2", className)}
      {...props}
    />
  );
}

export { EmptyState, EmptyStateMedia, EmptyStateTitle, EmptyStateDescription, EmptyStateActions };
