import * as React from "react";

import { cn } from "@/lib/cn";

export type TimelineProps = React.ComponentProps<"ol">;

export type TimelineItemProps = Omit<React.ComponentProps<"li">, "title"> & {
  /** Cuándo pasó. Va arriba y pequeño, como antetítulo. */
  time?: React.ReactNode;

  /** Qué pasó. */
  title: React.ReactNode;

  /** En qué punto está, que es lo que tiñe la marca. */
  tone?: "neutral" | "success" | "warning" | "danger" | "info";

  /** Sustituye a la marca redonda: un icono, un avatar. */
  marker?: React.ReactNode;
};

const tonos: Record<NonNullable<TimelineItemProps["tone"]>, string> = {
  neutral: "border-border-strong bg-card",
  success: "border-success bg-success",
  warning: "border-warning bg-warning",
  danger: "border-destructive bg-destructive",
  info: "border-info bg-info",
};

/**
 * Sucesos en orden.
 *
 * Es una lista ordenada de verdad. Un lector de pantalla anuncia cuántos
 * sucesos hay y por cuál va, que es la mitad de lo que aporta una línea de
 * tiempo; con `<div>` habría que decirlo a mano en cada uno.
 */
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, ...props }, ref) => (
    <ol
      data-slot="timeline"
      ref={ref}
      className={cn("m-0 flex list-none flex-col p-0", className)}
      {...props}
    />
  ),
);
Timeline.displayName = "Timeline";

/**
 * Un suceso.
 *
 * El riel lo dibuja cada suceso como un borde a su izquierda, y el último lo
 * corta. Con un riel único por detrás habría que medir dónde acaba el último
 * punto para no dejarlo colgando por debajo, y eso cambia con el alto del texto.
 *
 * La marca se saca del flujo y se centra sobre el riel. Va detrás del texto en
 * el marcado a propósito: es decoración, y leerla antes que el suceso no aporta
 * nada.
 */
export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, time, title, tone = "neutral", marker, children, ...props }, ref) => (
    <li
      data-slot="timeline-item"
      ref={ref}
      className={cn(
        "relative flex flex-col gap-1 border-s border-border ps-5 pb-5 last:border-transparent last:pb-0",
        className,
      )}
      {...props}
    >
      {time ? (
        <span data-slot="timeline-time" className="text-xs text-muted-foreground">
          {time}
        </span>
      ) : null}

      <span data-slot="timeline-title" className="font-medium text-foreground">
        {title}
      </span>

      {children ? <div className="text-sm text-muted-foreground">{children}</div> : null}

      <span
        aria-hidden="true"
        data-slot="timeline-marker"
        data-tone={tone}
        className={cn(
          "absolute start-0 top-0.5 flex size-3 -translate-x-1/2 items-center justify-center rounded-full border-2 rtl:translate-x-1/2",
          marker && "size-6 border-0 bg-transparent",
          !marker && tonos[tone],
        )}
      >
        {marker}
      </span>
    </li>
  ),
);
TimelineItem.displayName = "TimelineItem";
