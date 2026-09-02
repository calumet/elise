/**
 * Mensaje en línea, no modal. Para interrumpir al usuario con una decisión usa
 * `AlertDialog`.
 *
 * Con un `AlertTitle` toma la forma de anuncio de página: tarjeta con una barra
 * del tono arriba (icono, título y cierre) y el cuerpo en blanco debajo. Sin
 * título se queda en un bloque de una sola pieza en superficie sutil, que es lo
 * que cabe dentro de una tarjeta sin competir con ella. Entre una y otra se
 * elige por lo mismo: cuánto tiene que pesar el aviso.
 *
 * `danger` y `warning` se anuncian con `role="alert"` (interrumpe al lector de
 * pantalla); `info` y `success` con `role="status"` (espera a que termine).
 *
 * @module
 */

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link Alert}. */
export type AlertProps = React.ComponentProps<"div"> & {
  tone?: "info" | "success" | "warning" | "danger";

  /** Sustituye el icono por defecto. `null` lo quita. */
  icon?: React.ReactNode;

  /** Muestra el botón de cierre y avisa al cerrarlo. */
  onDismiss?: () => void;
};

/* Dos formas. Sin encabezado el bloque es una superficie sutil de una sola
   pieza, que es lo que cabe dentro de una tarjeta sin pelearse con ella. Con
   encabezado se convierte en tarjeta propia: barra del tono
   arriba y cuerpo en blanco, que es como se anuncia algo a nivel de página.
   La superficie sutil va sin borde, porque el color del fondo ya separa el
   bloque y un borde en el mismo tono agrega ruido. */
const toneClasses: Record<NonNullable<AlertProps["tone"]>, string> = {
  info: "bg-info-subtle text-info-subtle-foreground",
  success: "bg-success-subtle text-success-subtle-foreground",
  warning: "bg-warning-subtle text-warning-subtle-foreground",
  danger: "bg-destructive-subtle text-destructive-subtle-foreground",
};

const barraClasses: Record<NonNullable<AlertProps["tone"]>, string> = {
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive text-destructive-foreground",
};

const toneIcons: Record<NonNullable<AlertProps["tone"]>, React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

/* Los márgenes negativos dejan el botón en 28px de área táctil sin que la barra
   crezca por él: sin el vertical, la misma alerta mide 36px o 44 según se pueda
   cerrar o no, y dos avisos seguidos no cuadran. El horizontal es el mismo
   arreglo en el otro eje: centrar un glifo de 16 en una caja de 28 lo deja 6px
   por dentro, y ahí deja de alinear con el icono del tono de enfrente. */
const BOTON_CERRAR =
  "-my-1 -me-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-current transition-[background-color] duration-(--duration-fast) ease-out hover:bg-current/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 focus-visible:ring-offset-transparent";

/**
 * Mensaje en línea, no modal. Para interrumpir al usuario con una decisión usa
 * `AlertDialog`.
 *
 * Con un `AlertTitle` toma la forma de anuncio de página: tarjeta con una barra
 * del tono arriba (icono, título y cierre) y el cuerpo en blanco debajo. Sin
 * título se queda en un bloque de una sola pieza en superficie sutil, que es lo
 * que cabe dentro de una tarjeta sin competir con ella. Entre una y otra se
 * elige por lo mismo: cuánto tiene que pesar el aviso.
 *
 * `danger` y `warning` se anuncian con `role="alert"` (interrumpe al lector de
 * pantalla); `info` y `success` con `role="status"` (espera a que termine).
 */
function Alert({
  className,
  tone = "info",
  icon,
  onDismiss,
  children,
  ...props
}: AlertProps): React.JSX.Element {
  const dismissLabel = useElLabel("ui", "dismiss", "Descartar");
  const ToneIcon = toneIcons[tone];
  const showIcon = icon !== null;
  const rol = tone === "danger" || tone === "warning" ? "alert" : "status";

  /* El título sube a la barra y el resto se queda en el cuerpo. Se reparte aquí
     y no con dos props para que la composición siga siendo la misma escriba
     quien escriba: `<Alert><AlertTitle/>…</Alert>` en los dos casos. */
  const titulo: React.ReactNode[] = [];
  const cuerpo: React.ReactNode[] = [];
  React.Children.forEach(children, (hijo) => {
    const tipo = React.isValidElement(hijo) ? (hijo.type as { displayName?: string }) : null;
    if (tipo?.displayName === "AlertTitle") titulo.push(hijo);
    else cuerpo.push(hijo);
  });

  const cierre = onDismiss ? (
    <button type="button" data-slot="alert-dismiss" onClick={onDismiss} className={BOTON_CERRAR}>
      <X className="size-4" aria-hidden="true" />
      <span className="sr-only">{dismissLabel}</span>
    </button>
  ) : null;

  const marcaIcono = (claseExtra?: string) =>
    showIcon ? (
      <span data-slot="alert-icon" className={cn("shrink-0 [&>svg]:size-4", claseExtra)}>
        {icon ?? <ToneIcon aria-hidden="true" />}
      </span>
    ) : null;

  if (titulo.length > 0) {
    return (
      <div
        data-slot="alert"
        data-tone={tone}
        role={rol}
        className={cn(
          "w-full overflow-hidden rounded-xl border border-border bg-card text-sm text-card-foreground",
          className,
        )}
        {...props}
      >
        <div
          data-slot="alert-bar"
          className={cn("flex items-center gap-2 px-3 py-2", barraClasses[tone])}
        >
          {marcaIcono()}
          {titulo}
          <span className="ms-auto" />
          {cierre}
        </div>
        {cuerpo.length > 0 ? (
          /* El cuerpo va en flujo normal y separa sus bloques con margen, no
             como columna flex. En flex, una frase con un enlace dentro se parte
             en un renglón por trozo, que es lo que hace cualquier aviso que
             remate en «mirá la documentación». */
          <div data-slot="alert-body" className="min-w-0 px-4 py-3 [&>*+*]:mt-1">
            {cuerpo}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      data-slot="alert"
      data-tone={tone}
      role={rol}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-4 py-3 text-sm",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {marcaIcono("mt-px")}
      <div data-slot="alert-body" className="flex min-w-0 flex-1 flex-col gap-1">
        {cuerpo}
      </div>
      {cierre}
    </div>
  );
}

/** El título del aviso. Su presencia es lo que convierte al `Alert` en anuncio de página. */
function AlertTitle({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="alert-title"
      className={cn("min-w-0 font-semibold text-balance", className)}
      {...props}
    />
  );
}
/* `Alert` lo busca por nombre para subirlo a la barra del tono. */
AlertTitle.displayName = "AlertTitle";

/** El detalle del aviso. */
function AlertDescription({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return (
    <div
      data-slot="alert-description"
      className={cn("[&_a]:underline [&_a]:underline-offset-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
