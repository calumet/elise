/**
 * Indicador de progreso por pasos.
 *
 * Se renderiza como `<ol>`, ya que el orden es la información que el componente
 * transmite y un lector de pantalla debe poder anunciar "paso 2 de 4".
 *
 * El estado de cada paso lo decide quien lo usa, con `status`. El componente no
 * lo deduce de un índice, porque un flujo real salta pasos y vuelve atrás.
 *
 * @module
 */

import { Check } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** En qué punto está un paso. */
export type StepStatus = "complete" | "current" | "upcoming";

type StepperContextValue = {
  orientation: "horizontal" | "vertical";
};

const StepperContext = React.createContext<StepperContextValue>({ orientation: "horizontal" });

/** Props de {@link Stepper}. */
export type StepperProps = React.ComponentProps<"ol"> & {
  orientation?: "horizontal" | "vertical";
};

/**
 * Indicador de progreso por pasos.
 *
 * Se renderiza como `<ol>`, ya que el orden es la información que el componente
 * transmite y un lector de pantalla debe poder anunciar "paso 2 de 4".
 *
 * El estado de cada paso lo decide quien lo usa, con `status`. El componente no
 * lo deduce de un índice, porque un flujo real salta pasos y vuelve atrás.
 */
function Stepper({
  className,
  orientation = "horizontal",
  ...props
}: StepperProps): React.JSX.Element {
  const ctx = React.useMemo(() => ({ orientation }), [orientation]);
  return (
    <StepperContext.Provider value={ctx}>
      <ol
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row items-start overflow-x-auto" : "flex-col",
          className,
        )}
        {...props}
      />
    </StepperContext.Provider>
  );
}

/** Props de {@link StepperItem}. */
export type StepperItemProps = React.ComponentProps<"li"> & {
  status?: StepStatus;

  /** Número o icono dentro del indicador. Por defecto, la posición del paso. */
  indicator?: React.ReactNode;

  /** Oculta la línea de unión. Ponelo en el último paso. */
  last?: boolean;
};

const indicadorPorEstado: Record<StepStatus, string> = {
  complete: "border-primary bg-primary text-primary-foreground shadow-bevel",
  current: "border-primary bg-background text-accent-foreground",
  upcoming: "border-border-strong bg-background text-muted-foreground",
};

const lineaPorEstado: Record<StepStatus, string> = {
  complete: "bg-primary",
  current: "bg-border-strong",
  upcoming: "bg-border-strong",
};

/** Un paso. Su `status` decide si se dibuja hecho, en curso o pendiente. */
function StepperItem({
  className,
  status = "upcoming",
  indicator,
  last,
  children,
  ...props
}: StepperItemProps): React.JSX.Element {
  const { orientation } = React.useContext(StepperContext);
  const completado = useElLabel("ui", "stepComplete", "Completado");
  const actual = useElLabel("ui", "stepCurrent", "Paso actual");
  const horizontal = orientation === "horizontal";

  return (
    <li
      data-slot="stepper-item"
      data-status={status}
      aria-current={status === "current" ? "step" : undefined}
      className={cn(
        "flex gap-3",
        horizontal ? "flex-1 flex-col" : "flex-row",
        last && horizontal && "flex-none",
        className,
      )}
      {...props}
    >
      <div className={cn("flex items-center gap-2", horizontal ? "flex-row" : "flex-col")}>
        <span
          data-slot="stepper-indicator"
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
            indicadorPorEstado[status],
          )}
        >
          {status === "complete" && indicator === undefined ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            indicator
          )}
          <span className="sr-only">
            {status === "complete" ? completado : status === "current" ? actual : ""}
          </span>
        </span>
        {last ? null : (
          <span
            data-slot="stepper-line"
            aria-hidden="true"
            className={cn(
              "shrink-0 rounded-full",
              horizontal ? "h-0.5 w-full min-w-6 flex-1" : "min-h-6 w-0.5 flex-1",
              lineaPorEstado[status],
            )}
          />
        )}
      </div>
      <div
        data-slot="stepper-content"
        className={cn("flex min-w-0 flex-col gap-0.5", !horizontal && "pb-6")}
      >
        {children}
      </div>
    </li>
  );
}

/** El título del paso. */
function StepperTitle({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="stepper-title"
      className={cn(
        "text-sm font-semibold text-foreground",
        "group-data-[status=upcoming]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** El detalle del paso. */
function StepperDescription({ className, ...props }: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="stepper-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Stepper, StepperItem, StepperTitle, StepperDescription };
