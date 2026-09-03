/**
 * La franja de paginado, dentro de un `<nav>` rotulado.
 *
 * @module
 */

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
} from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/**
 * Caja de un control de paginar: cuadrada, del alto de una fila de tabla, con
 * relleno plano y sin borde ni bisel.
 *
 * No usa `Button` porque no es un botón del catálogo: de `Button` solo
 * aprovecharía el foco, y pasarlo por ahí obligaría a deshacer con `border:
 * none` y `box-shadow: none` casi todo lo demás que pone.
 */
const CAJA =
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover active:bg-state-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background aria-disabled:pointer-events-none aria-disabled:text-border-strong disabled:pointer-events-none disabled:text-border-strong";

/** Props de {@link Pagination}. */
export type PaginationProps = React.ComponentProps<"nav"> & {
  /**
   * `table` la convierte en la franja del pie de una tabla: filete arriba,
   * banda tenue y todo centrado. No es un componente aparte porque paginar es
   * lo mismo dentro que fuera de una tabla: la misma pieza cambia de envoltorio
   * según dónde se apoye.
   */
  variant?: "default" | "table";

  /**
   * Un control que acompaña a los pasos, al final de la franja. Solo en la
   * variante de tabla.
   *
   * La franja se reparte en tres bandas de las que la primera y la tercera
   * miden lo mismo, así que los pasos quedan centrados en el ancho de la tabla
   * y no en el hueco que sobra. Puestos con `justify-between` se desplazarían
   * cada vez que este control cambia de ancho.
   *
   * Las bandas son `flex-1` y no una rejilla de `1fr auto 1fr`. Con la rejilla
   * el reparto vive en una utilidad de valor arbitrario, y una utilidad que no
   * llegue a generarse no falla a la vista: la rejilla cae a una sola columna,
   * las tres bandas se apilan y la franja pasa de 41px a 65px sin que nada
   * diga por qué. Con `flex-1` el reparto no depende de ninguna clase que
   * pueda faltar.
   */
  end?: React.ReactNode;
};

/** La franja de paginado, dentro de un `<nav>` rotulado. */
function Pagination({
  className,
  variant = "default",
  end,
  children,
  ...props
}: PaginationProps): React.JSX.Element {
  const label = useElLabel("ui", "pagination", "Paginación");
  return (
    <nav
      role="navigation"
      aria-label={label}
      data-slot="pagination"
      data-variant={variant}
      className={cn(
        "flex w-full flex-wrap items-center",
        variant === "table"
          ? "gap-x-3 gap-y-1 border-t border-border bg-muted px-3 py-1.5"
          : "justify-center",
        className,
      )}
      {...props}
    >
      {variant === "table" ? (
        <>
          <div className="flex-1" aria-hidden />
          {children}
          <div className="flex flex-1 justify-end">{end}</div>
        </>
      ) : (
        children
      )}
    </nav>
  );
}

/**
 * Los controles van pegados y con un pelo de aire entre ellos: se leen como una
 * sola pieza partida por una raya, no como botones sueltos. De ahí que las
 * esquinas interiores se cuadren y solo redondeen las de los extremos.
 */
function PaginationContent({ className, ...props }: React.ComponentProps<"ul">): React.JSX.Element {
  return (
    <ul
      data-slot="pagination-content"
      className={cn(
        "flex list-none flex-row items-center gap-px",
        "[&>li:not(:first-child)>*]:rounded-s-none [&>li:not(:last-child)>*]:rounded-e-none",
        className,
      )}
      {...props}
    />
  );
}

/** Un número de página. */
function PaginationItem({ className, ...props }: React.ComponentProps<"li">): React.JSX.Element {
  return <li data-slot="pagination-item" className={cn("flex", className)} {...props} />;
}

/** Props de {@link PaginationLink}. */
export type PaginationLinkProps = React.ComponentProps<"a"> & {
  isActive?: boolean;
};

/**
 * Una página numerada. La actual va rellena y las demás transparentes: el
 * relleno es lo que dice dónde estás, sin sumar un borde que competiría con el
 * de la franja.
 */
function PaginationLink({ className, isActive, ...props }: PaginationLinkProps): React.JSX.Element {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(CAJA, "text-sm", isActive && "bg-fill-tertiary font-medium", className)}
      {...props}
    />
  );
}

/** Props de los pasos de la franja: anterior, siguiente, primera y última. */
export type PaginationButtonProps = React.ComponentProps<"button">;

/**
 * Un paso: anterior, siguiente, primera, última. Van siempre rellenos, porque
 * son la acción de la franja y no una página entre otras.
 */
const PaginationStep: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<PaginationButtonProps> & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ className, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(CAJA, "bg-fill-tertiary", className)} {...props} />
  ),
);
PaginationStep.displayName = "PaginationStep";

/** Ir a la página anterior. */
function PaginationPrevious({ className, ...props }: PaginationButtonProps): React.JSX.Element {
  const ariaLabel = useElLabel("ui", "previousPage", "Ir a la página anterior");
  return (
    <PaginationStep aria-label={ariaLabel} className={className} {...props}>
      <ChevronLeft className="size-4" aria-hidden />
    </PaginationStep>
  );
}

/** Ir a la página siguiente. */
function PaginationNext({ className, ...props }: PaginationButtonProps): React.JSX.Element {
  const ariaLabel = useElLabel("ui", "nextPage", "Ir a la página siguiente");
  return (
    <PaginationStep aria-label={ariaLabel} className={className} {...props}>
      <ChevronRight className="size-4" aria-hidden />
    </PaginationStep>
  );
}

/** Ir a la primera página. */
function PaginationFirst({ className, ...props }: PaginationButtonProps): React.JSX.Element {
  const ariaLabel = useElLabel("ui", "firstPage", "Ir a la primera página");
  return (
    <PaginationStep aria-label={ariaLabel} className={className} {...props}>
      <ChevronsLeft className="size-4" aria-hidden />
    </PaginationStep>
  );
}

/** Ir a la última página. */
function PaginationLast({ className, ...props }: PaginationButtonProps): React.JSX.Element {
  const ariaLabel = useElLabel("ui", "lastPage", "Ir a la última página");
  return (
    <PaginationStep aria-label={ariaLabel} className={className} {...props}>
      <ChevronsRight className="size-4" aria-hidden />
    </PaginationStep>
  );
}

/**
 * El rótulo que va entre los dos pasos, del estilo «1-20 de 340». Va dentro del grupo y
 * no al lado porque es lo que separa los dos controles; fuera, los dos botones
 * quedarían pegados y el rótulo suelto en un extremo.
 */
function PaginationLabel({ className, ...props }: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      data-slot="pagination-label"
      aria-live="polite"
      className={cn("px-3 text-xs font-medium whitespace-nowrap text-foreground", className)}
      {...props}
    />
  );
}

/** Los puntos suspensivos que reemplazan al tramo de páginas que no se muestra. */
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">): React.JSX.Element {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-7 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <Ellipsis className="size-4" />
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationLabel,
  PaginationStep,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
  PaginationEllipsis,
};
