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

import { Field } from "./field";
import { CAJA_CAMPO_COMPUESTA, CAMPO_DESNUDO, CAMPO_INVALIDO } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

const PATRON = /^(\d{1,2}):(\d{2})$/;

/** Minutos desde medianoche, o `null` si no es una hora. */
const aMinutos = (texto: string): number | null => {
  const partes = PATRON.exec(texto.trim());
  if (!partes) return null;
  const hora = Number(partes[1]);
  const minuto = Number(partes[2]);
  if (hora > 23 || minuto > 59) return null;
  return hora * 60 + minuto;
};

/** Escribe minutos desde medianoche en `HH:MM`. */
export const aTextoHora = (minutos: number): string =>
  `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;

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
    const etiquetaAbrir = useElLabel("ui", "openTimeList", "Ver las horas");
    const etiquetaLista = useElLabel("ui", "timeList", "Horas");

    const [interno, setInterno] = React.useState(defaultValue);
    const [escrito, setEscrito] = React.useState<string | null>(null);
    const [abierto, setAbierto] = React.useState(false);
    const controlado = value !== undefined;
    const hora = controlado ? value : interno;

    const cambiar = (siguiente: string) => {
      if (!controlado) setInterno(siguiente);
      onValueChange?.(siguiente);
    };

    const desde = aMinutos(min) ?? 0;
    const hasta = aMinutos(max) ?? 1439;
    const opciones = React.useMemo(() => {
      const salida: number[] = [];
      for (let m = desde; m <= hasta; m += Math.max(1, step)) salida.push(m);
      return salida;
    }, [desde, hasta, step]);

    const elegida = aMinutos(hora);

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
            className={cn(CAJA_CAMPO_COMPUESTA, CAMPO_INVALIDO)}
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
              value={escrito ?? hora}
              onChange={(e) => setEscrito(e.target.value)}
              onBlur={() => {
                if (escrito === null) return;
                const minutos = aMinutos(escrito);
                cambiar(minutos === null ? "" : aTextoHora(minutos));
                setEscrito(null);
              }}
              className={cn(CAMPO_DESNUDO, "tabular-nums")}
            />

            <Popover open={abierto} onOpenChange={setAbierto}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={etiquetaAbrir}
                  disabled={disabled || readOnly}
                  className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:text-border-strong"
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
                  aria-label={etiquetaLista}
                  className="flex max-h-56 flex-col overflow-y-auto"
                >
                  {opciones.map((minutos) => {
                    const texto = aTextoHora(minutos);
                    const puesta = minutos === elegida;
                    return (
                      <button
                        key={minutos}
                        type="button"
                        role="option"
                        aria-selected={puesta}
                        /* La elegida se enfoca al abrir, así que la lista no
                             arranca siempre en medianoche cuando ya hay hora. */
                        autoFocus={puesta}
                        onClick={() => {
                          cambiar(texto);
                          setEscrito(null);
                          setAbierto(false);
                        }}
                        className={cn(
                          "cursor-pointer rounded-sm px-2 py-1.5 text-start text-sm tabular-nums transition-[background-color] duration-(--duration-fast) ease-out hover:bg-muted focus-visible:outline-none focus-visible:bg-muted",
                          puesta && "bg-accent text-accent-foreground",
                        )}
                      >
                        {texto}
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
