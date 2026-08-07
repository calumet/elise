/**
 * Elige una fecha, con el calendario dentro de un popover.
 *
 * @module
 */

import { Calendar as CalendarIcon } from "@calumet/elise-icons";
import * as React from "react";

import { Calendar } from "./calendar";
import { aTextoISO } from "./date-field";
import { CAJA_CAMPO } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/**
 * Disparador de los selectores de fecha.
 *
 * Se presenta como campo y no como botón: los tres controles de fecha (este, el
 * de rango y `DateField`) aparecen juntos en un formulario, y si uno tiene borde
 * de campo y otro relleno de botón se leen como cosas distintas cuando solo
 * cambia lo que hay dentro. Lleva el calendario al final, del mismo tamaño y a
 * la misma distancia del borde que el de `DateField`.
 *
 * Sin caret. Un caret anuncia una lista de opciones; aquí lo que se abre es un
 * calendario, y decirlo con su propio icono ahorra la promesa equivocada.
 */
function DisparadorFecha({
  etiqueta,
  vacio,
  ...props
}: React.ComponentProps<"button"> & { etiqueta: string; vacio: boolean }) {
  return (
    <button
      type="button"
      className={cn(CAJA_CAMPO, "cursor-pointer items-center justify-between gap-2 text-start")}
      {...props}
    >
      <span className={cn("min-w-0 truncate", vacio && "text-muted-foreground")}>{etiqueta}</span>
      <CalendarIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

type DatePickerProps = {
  value?: Date;
  onChange: (date?: Date) => void;
  formatLabel?: (date?: Date) => string;
};

/** Elige una fecha, con el calendario dentro de un popover. */
export function DatePicker({ value, onChange, formatLabel }: DatePickerProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const placeholder = useElLabel("ui", "selectDate", "Seleccionar fecha");

  const isValidDate = value && !isNaN(value.getTime());
  const label = formatLabel ? formatLabel(value) : isValidDate ? aTextoISO(value!) : placeholder;

  return (
    <div data-slot="date-picker" className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <DisparadorFecha etiqueta={label} vacio={!isValidDate} />
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          {/* Rótulo de mes, no desplegables: se navega con las flechas y el
              encabezado se queda como título. Quien necesite saltar años puede
              montar `Calendar` con `captionLayout="dropdown"`. */}
          <Calendar
            mode="single"
            selected={isValidDate ? value : undefined}
            disabled={(d) => d < new Date("1900-01-01")}
            onSelect={(d) => {
              onChange(d ?? undefined);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

type DateRangeValue = { from: Date | undefined; to?: Date };
type DateRangePickerProps = {
  value?: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  formatLabel?: (range?: DateRangeValue) => string;
};

/** Elige un rango de fechas, con los dos meses a la vista. */
export function DateRangePicker({
  value,
  onChange,
  formatLabel,
}: DateRangePickerProps): React.JSX.Element {
  const placeholder = useElLabel("ui", "selectDate", "Seleccionar fecha");
  const range: DateRangeValue = value ?? { from: undefined, to: undefined };
  const completo = Boolean(range?.from && range?.to);
  /* El mismo formato que `DateField`, con doble guion entre las dos fechas:
     `YYYY-MM-DD--YYYY-MM-DD`. Un rango escrito con dos formatos locales y un
     guion suelto no se puede ni leer ni teclear de vuelta, porque el separador
     se confunde con el de la propia fecha. */
  const label =
    formatLabel?.(range) ??
    (completo ? `${aTextoISO(range.from!)}--${aTextoISO(range.to!)}` : placeholder);

  return (
    <div data-slot="date-range-picker" className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <DisparadorFecha etiqueta={label} vacio={!completo} />
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(range) => {
              onChange(range ?? { from: undefined, to: undefined });
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
