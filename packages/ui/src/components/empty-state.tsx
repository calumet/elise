/**
 * Estado vacío para listas, tablas y paneles sin contenido. Es un contenedor
 * compuesto: `EmptyStateMedia`, `EmptyStateTitle`, `EmptyStateDescription` y
 * `EmptyStateActions` se combinan según haga falta.
 *
 * Para "no hay resultados" de una búsqueda, el título debería nombrar el
 * término buscado, no decir solo "Sin resultados".
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

/** Props de {@link EmptyState}. */
export type EmptyStateProps = React.ComponentProps<"div"> & {
  /** `lg` es para cuando toda la pantalla está vacía: el título y el icono crecen. */
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<EmptyStateProps["size"]>, string> = {
  sm: "gap-3 px-6 py-8",
  md: "gap-4 px-6 py-14",
  lg: "gap-4 px-6 py-16",
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
      data-size={size}
      className={cn(
        "group/empty-state flex flex-col items-center justify-center text-center",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}

/** Props de {@link EmptyStateMedia}. */
export type EmptyStateMediaProps = React.ComponentProps<"div"> & {
  /** `accent` lo tiñe con el acento del tema, que con un color de marca es su tinte. */
  tone?: "muted" | "accent";
};

const mediaToneClasses: Record<NonNullable<EmptyStateMediaProps["tone"]>, string> = {
  muted: "bg-muted text-muted-foreground",
  accent: "bg-accent text-accent-foreground",
};

/** El icono o la ilustración del estado vacío. */
function EmptyStateMedia({
  className,
  tone = "muted",
  ...props
}: EmptyStateMediaProps): React.JSX.Element {
  return (
    <div
      data-slot="empty-state-media"
      aria-hidden="true"
      className={cn(
        "flex size-11 items-center justify-center rounded-full group-data-[size=lg]/empty-state:size-14 [&>svg]:size-icon-lg group-data-[size=lg]/empty-state:[&>svg]:size-icon-xl",
        mediaToneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Qué falta, en una línea. */
function EmptyStateTitle({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="empty-state-title"
      className={cn(
        "text-lg font-semibold text-balance text-foreground group-data-[size=lg]/empty-state:text-xl",
        className,
      )}
      {...props}
    />
  );
}

/** Por qué está vacío y qué se puede hacer. */
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

/** Las acciones que sacan del estado vacío. */
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
