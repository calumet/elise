import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

export type AlertProps = React.ComponentProps<"div"> & {
  tone?: "info" | "success" | "warning" | "danger";

  /** Sustituye el icono por defecto. `null` lo quita. */
  icon?: React.ReactNode;

  /** Muestra el boton de cierre y avisa al cerrarlo. */
  onDismiss?: () => void;
};

/* Superficie sutil sin borde: el color del fondo ya separa el bloque del resto
   de la pagina, y un borde en el mismo tono lo vuelve ruidoso. */
const toneClasses: Record<NonNullable<AlertProps["tone"]>, string> = {
  info: "bg-info-subtle text-info-subtle-foreground",
  success: "bg-success-subtle text-success-subtle-foreground",
  warning: "bg-warning-subtle text-warning-subtle-foreground",
  danger: "bg-destructive-subtle text-destructive-subtle-foreground",
};

const toneIcons: Record<NonNullable<AlertProps["tone"]>, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

/**
 * Mensaje en linea, no modal. Para interrumpir al usuario con una decision usa
 * `AlertDialog`.
 *
 * `danger` y `warning` se anuncian con `role="alert"` (interrumpe al lector de
 * pantalla); `info` y `success` con `role="status"` (espera a que termine).
 */
function Alert({ className, tone = "info", icon, onDismiss, children, ...props }: AlertProps) {
  const dismissLabel = useElLabel("ui", "dismiss", "Descartar");
  const ToneIcon = toneIcons[tone];
  const showIcon = icon !== null;

  return (
    <div
      data-slot="alert"
      data-tone={tone}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-xl px-4 py-3 text-sm",
        toneClasses[tone],
        onDismiss && "pr-11",
        className,
      )}
      {...props}
    >
      {showIcon ? (
        <span data-slot="alert-icon" className="mt-px shrink-0 [&>svg]:size-4">
          {icon ?? <ToneIcon aria-hidden="true" />}
        </span>
      ) : null}
      <div data-slot="alert-body" className="flex min-w-0 flex-col gap-1">
        {children}
      </div>
      {onDismiss ? (
        <button
          type="button"
          data-slot="alert-dismiss"
          onClick={onDismiss}
          className="absolute right-2 top-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-current transition-[background-color] duration-(--duration-fast) ease-out hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">{dismissLabel}</span>
        </button>
      ) : null}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="alert-title" className={cn("font-semibold text-balance", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("[&_a]:underline [&_a]:underline-offset-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
