/**
 * Selector de hora: un campo que se escribe y una lista de horas que se elige.
 *
 * En 24 horas y `HH:MM`, el mismo criterio que `DateField` con las fechas: un
 * formato que se ordena solo y no cambia con el idioma del navegador. Con
 * `hh:mm a.m.` una hora escrita en una máquina y leída en otra podía significar
 * dos cosas.
 *
 * El campo se puede escribir además de elegir. La lista es cómoda para «las
 * nueve y media» y pésima para «las 14:07», y a `step` de quince minutos esa
 * hora no está en la lista siquiera.
 *
 * Se valida al salir del campo y no mientras se escribe: quien va por «09:» no
 * ha escrito nada malo todavía, solo no ha terminado.
 *
 * @module
 */

import { Clock } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

import { Field } from "./field";
import { FIELD_BOX_COMPOSITE, BARE_FIELD, INVALID_FIELD } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const PATRON = /^(\d{1,2}):(\d{2})$/;

/** Minutos desde medianoche, o `null` si no es una hora. */
const toMinutes = (text: string): number | null => {
  const parts = PATRON.exec(text.trim());
  if (!parts) return null;
  const hour = Number(parts[1]);
  const minute = Number(parts[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
};

/** Escribe minutos desde medianoche en `HH:MM`. */
export const toTimeText = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Props de {@link TimePicker}. */
export type TimePickerProps = {
  label: React.ReactNode;

  /** Esconde el rótulo sin quitarlo del árbol de accesibilidad. */
  labelHidden?: boolean;

  /** Texto de ayuda bajo el campo. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;

  /** Hora en `HH:MM`, 24 horas. Cadena vacía, sin hora. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  /** Primera y última hora que ofrece la lista, en `HH:MM`. */
  min?: string;
  max?: string;

  /** Cada cuántos minutos hay una opción en la lista. */
  step?: number;
};

/**
 * Selector de hora: un campo que se escribe y una lista de horas que se elige.
 *
 * En 24 horas y `HH:MM`, el mismo criterio que `DateField` con las fechas: un
 * formato que se ordena solo y no cambia con el idioma del navegador. Con
 * `hh:mm a.m.` una hora escrita en una máquina y leída en otra podía significar
 * dos cosas.
 *
 * El campo se puede escribir además de elegir. La lista es cómoda para «las
 * nueve y media» y pésima para «las 14:07», y a `step` de quince minutos esa
 * hora no está en la lista siquiera.
 *
 * Se valida al salir del campo y no mientras se escribe: quien va por «09:» no
 * ha escrito nada malo todavía, solo no ha terminado.
 */
export const TimePicker: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TimePickerProps> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, TimePickerProps>(
  (
    {
      label,
      labelHidden,
      description,
      error,
      required,
      disabled,
      readOnly,
      name,
      id,
      placeholder = "HH:MM",
      className,
      value,
      defaultValue = "",
      onValueChange,
      min = "00:00",
      max = "23:59",
      step = 30,
    },
    ref,
  ) => {
    const openLabel = useElLabel("ui", "openTimeList", "Ver las horas");
    const listLabel = useElLabel("ui", "timeList", "Horas");

    const [internal, setInternal] = React.useState(defaultValue);
    const [typed, setTyped] = React.useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const controlled = value !== undefined;
    const hour = controlled ? value : internal;

    const change = (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    };

    const from = toMinutes(min) ?? 0;
    const hasta = toMinutes(max) ?? 1439;
    const options = React.useMemo(() => {
      const output: number[] = [];
      for (let m = from; m <= hasta; m += Math.max(1, step)) output.push(m);
      return output;
    }, [from, hasta, step]);

    const selected = toMinutes(hour);

    return (
      <Field
        label={label}
        labelHidden={labelHidden}
        description={description}
        error={error}
        required={required}
        id={id}
        className={className}
      >
        {(control) => (
          <div
            className={cn(FIELD_BOX_COMPOSITE, INVALID_FIELD)}
            aria-invalid={control["aria-invalid"]}
          >
            <input
              {...control}
              ref={ref}
              type="text"
              inputMode="numeric"
              name={name}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              value={typed ?? hour}
              onChange={(e) => setTyped(e.target.value)}
              onBlur={() => {
                if (typed === null) return;
                const minutes = toMinutes(typed);
                change(minutes === null ? "" : toTimeText(minutes));
                setTyped(null);
              }}
              className={cn(BARE_FIELD, "tabular-nums")}
            />

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={openLabel}
                  disabled={disabled || readOnly}
                  className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:text-border-strong"
                >
                  <Clock className="size-4" aria-hidden />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-32 p-1">
                {/* Barra nativa, la misma de la página y la de los desplegables.
                    Con una dibujada aparte la lista traía su propia barra: se
                    escondía en reposo y solo salía al apuntarla, así que en la
                    misma pantalla había dos maneras distintas de desplazar. */}
                <div
                  role="listbox"
                  aria-label={listLabel}
                  className="flex max-h-56 flex-col overflow-y-auto"
                >
                  {options.map((minutes) => {
                    const text = toTimeText(minutes);
                    const set = minutes === selected;
                    return (
                      <button
                        key={minutes}
                        type="button"
                        role="option"
                        aria-selected={set}
                        /* La elegida se enfoca al abrir, así que la lista no
                             arranca siempre en medianoche cuando ya hay hora. */
                        autoFocus={set}
                        onClick={() => {
                          change(text);
                          setTyped(null);
                          setOpen(false);
                        }}
                        className={cn(
                          "cursor-pointer rounded-sm px-2 py-1.5 text-start text-sm tabular-nums transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover focus-visible:bg-muted focus-visible:outline-none",
                          set && "bg-accent text-accent-foreground",
                        )}
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </Field>
    );
  },
);
TimePicker.displayName = "TimePicker";
