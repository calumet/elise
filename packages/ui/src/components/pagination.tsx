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
 * No usa `Button` porque no es un botón del catálogo: en Polaris estos llevan
 * `border: none` y `box-shadow: none` forzados sobre la variante terciaria, o
 * sea que de `Button` solo aprovecharían el foco. Pasarlos por ahí obligaría a
 * deshacer casi todo lo que `Button` pone.
 */
const CAJA =
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-fill-tertiary-hover active:bg-fill-tertiary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background aria-disabled:pointer-events-none aria-disabled:text-border-strong disabled:pointer-events-none disabled:text-border-strong";

export type PaginationProps = React.ComponentProps<"nav"> & {
  /**
   * `table` la convierte en la franja del pie de una tabla: filete arriba,
   * banda tenue y todo centrado. Es el sitio donde vive la paginación en
   * Polaris, y por eso no es un componente aparte: la misma pieza cambia de
   * envoltorio según dónde se apoye.
   */
  variant?: "default" | "table";
};

function Pagination({ className, variant = "default", ...props }: PaginationProps) {
  const label = useElLabel("ui", "pagination", "Paginación");
  return (
    <nav
      role="navigation"
      aria-label={label}
      data-slot="pagination"
      data-variant={variant}
      className={cn(
        "flex w-full items-center justify-center",
        variant === "table" && "border-t border-border bg-muted px-3 py-1.5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Los controles van pegados y con un pelo de aire entre ellos: se leen como una
 * sola pieza partida por una raya, no como botones sueltos. De ahí que las
 * esquinas interiores se cuadren y solo redondeen las de los extremos.
 */
function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
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

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn("flex", className)} {...props} />;
}

export type PaginationLinkProps = React.ComponentProps<"a"> & {
  isActive?: boolean;
};

/**
 * Una página numerada. La actual va rellena y las demás transparentes: el
 * relleno es lo que dice dónde estás, sin sumar un borde que competiría con el
 * de la franja.
 */
function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
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

export type PaginationButtonProps = React.ComponentProps<"button">;

/**
 * Un paso: anterior, siguiente, primera, última. Van siempre rellenos, porque
 * son la acción de la franja y no una página entre otras.
 */
const PaginationStep = React.forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ className, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(CAJA, "bg-fill-tertiary", className)} {...props} />
  ),
);
PaginationStep.displayName = "PaginationStep";

function PaginationPrevious({ className, ...props }: PaginationButtonProps) {
  const ariaLabel = useElLabel("ui", "previousPage", "Ir a la página anterior");
  return (
    <PaginationStep aria-label={ariaLabel} className={className} {...props}>
      <ChevronLeft className="size-4" aria-hidden />
    </PaginationStep>
  );
}

function PaginationNext({ className, ...props }: PaginationButtonProps) {
  const ariaLabel = useElLabel("ui", "nextPage", "Ir a la página siguiente");
  return (
    <PaginationStep aria-label={ariaLabel} className={className} {...props}>
      <ChevronRight className="size-4" aria-hidden />
    </PaginationStep>
  );
}

function PaginationFirst({ className, ...props }: PaginationButtonProps) {
  const ariaLabel = useElLabel("ui", "firstPage", "Ir a la primera página");
  return (
    <PaginationStep aria-label={ariaLabel} className={className} {...props}>
      <ChevronsLeft className="size-4" aria-hidden />
    </PaginationStep>
  );
}

function PaginationLast({ className, ...props }: PaginationButtonProps) {
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
function PaginationLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-label"
      aria-live="polite"
      className={cn("px-3 text-xs font-medium whitespace-nowrap text-foreground", className)}
      {...props}
    />
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
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
