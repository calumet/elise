/**
 * Campo de fecha: se puede escribir o elegir en el calendario.
 *
 * No es un calendario suelto sino un campo con calendario emergente, y por eso
 * trae rótulo, ayuda y error. Para el calendario a secas está `Calendar`, y para
 * un disparador sin campo, `DatePicker`.
 *
 * El valor viaja como `YYYY-MM-DD` y no como `Date`: una fecha de calendario no
 * tiene hora ni zona, y en cuanto se guarda un `Date` alguien acaba comparando
 * instantes y perdiendo un día al cruzar la medianoche.
 *
 * Lo escrito no se valida en cada tecla. Mientras se teclea, «3 de ago» pasa por
 * todos los estados intermedios inválidos, y avisar de cada uno convierte el
 * campo en una alarma. Se comprueba al salir, que es cuando quien escribe da por
 * terminada la fecha.
 *
 * ```tsx
 * <DateField
 *   label="Fecha de entrega"
 *   value={fecha}
 *   onValueChange={setFecha}
 *   min="2026-01-01"
 * />
 * ```
 *
 * @module
 */

import { Calendar as CalendarIcon } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

import { Calendar } from "./calendar";
import { Field } from "./field";
import { FIELD_BOX, INVALID_FIELD } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Convierte `YYYY-MM-DD` en una fecha local, o devuelve `null`.
 *
 * Se construye por partes y no desde la cadena entera porque `new Date("…")`
 * interpreta el formato ISO como UTC: al oeste de Greenwich eso adelanta el día
 * y la fecha que se elige no es la que se guarda.
 *
 * La comprobación de vuelta es lo que rechaza un 31 de febrero. `Date` no falla
 * con un día que no existe: lo desborda al mes siguiente, así que la única
 * señal fiable es que la fecha construida diga lo mismo que se le pidió.
 */
const toDate = (text: string): Date | null => {
  const parts = PATTERN.exec(text.trim());
  if (!parts) return null;
  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
};

/**
 * Escribe una fecha local en `YYYY-MM-DD`.
 *
 * Es el formato que comparten los tres controles de fecha. Se exporta porque los
 * selectores rotulan con él: con `toLocaleDateString` cada uno mostraba lo suyo
 * según el idioma del navegador, y un rango quedaba en dos formatos distintos
 * dentro de la misma frase.
 */
export const toISOText = (date: Date): string =>
  [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

/** Props de {@link DateField}. */
export type DateFieldProps = {
  label: React.ReactNode;

  /** Texto de ayuda bajo el campo. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;

  /** Fecha en `YYYY-MM-DD`. Cadena vacía, sin fecha. */
  value?: string;
  defaultValue?: string;

  /** Cada pulsación, y también al elegir en el calendario. */
  onValueChange?: (value: string) => void;

  /**
   * Al terminar de editar: al salir del campo, o al elegir en el calendario.
   * Solo llega con una fecha válida y admitida.
   */
  onValueCommit?: (value: string) => void;

  /**
   * Al terminar de editar con algo que no es una fecha admitida. Recibe el texto
   * tal cual se escribió, que es lo que sigue en el campo para poder corregirlo.
   */
  onInvalid?: (rawValue: string) => void;

  /** Primera y última fecha admitidas, en `YYYY-MM-DD`. */
  min?: string;
  max?: string;

  /** Fechas sueltas que no se admiten, por encima de `min` y `max`. */
  isDateDisabled?: (date: Date) => boolean;
};

/**
 * Campo de fecha: se puede escribir o elegir en el calendario.
 *
 * No es un calendario suelto sino un campo con calendario emergente, y por eso
 * trae rótulo, ayuda y error. Para el calendario a secas está `Calendar`, y para
 * un disparador sin campo, `DatePicker`.
 *
 * El valor viaja como `YYYY-MM-DD` y no como `Date`: una fecha de calendario no
 * tiene hora ni zona, y en cuanto se guarda un `Date` alguien acaba comparando
 * instantes y perdiendo un día al cruzar la medianoche.
 *
 * Lo escrito no se valida en cada tecla. Mientras se teclea, «3 de ago» pasa por
 * todos los estados intermedios inválidos, y avisar de cada uno convierte el
 * campo en una alarma. Se comprueba al salir, que es cuando quien escribe da por
 * terminada la fecha.
 *
 * ```tsx
 * <DateField
 *   label="Fecha de entrega"
 *   value={fecha}
 *   onValueChange={setFecha}
 *   min="2026-01-01"
 * />
 * ```
 */
export function DateField({
  label,
  description,
  error,
  required,
  readOnly,
  disabled,
  name,
  id,
  placeholder,
  className,
  value,
  defaultValue = "",
  onValueChange,
  onValueCommit,
  onInvalid,
  min,
  max,
  isDateDisabled,
}: DateFieldProps): React.JSX.Element {
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const text = controlled ? value : internal;

  const [open, setOpen] = React.useState(false);
  const field = React.useRef<HTMLInputElement>(null);

  const openCalendar = useElLabel("ui", "openCalendar", "Abrir calendario");
  const format = useElLabel("ui", "dateFormat", "AAAA-MM-DD");

  const type = React.useCallback(
    (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  const minLimit = min ? toDate(min) : null;
  const maxLimit = max ? toDate(max) : null;

  const allowed = React.useCallback(
    (date: Date) => {
      if (minLimit && date < minLimit) return false;
      if (maxLimit && date > maxLimit) return false;
      return !isDateDisabled?.(date);
    },
    [minLimit, maxLimit, isDateDisabled],
  );

  /* Una fecha a medio escribir no debe mover el calendario ni pintarse como
     elegida, así que solo cuenta la que ya está completa y admitida. */
  const selected = React.useMemo(() => {
    const date = toDate(text);
    return date && allowed(date) ? date : undefined;
  }, [text, allowed]);

  const closeEdit = () => {
    if (text === "") return;
    const date = toDate(text);
    if (!date || !allowed(date)) {
      onInvalid?.(text);
      return;
    }
    /* Se normaliza antes de confirmar, para que «2026-8-3» y «2026-08-03» no
       lleguen al consumidor como dos valores distintos. */
    const normalized = toISOText(date);
    if (normalized !== text) type(normalized);
    onValueCommit?.(normalized);
  };

  const selectInCalendar = (date?: Date) => {
    const next = date ? toISOText(date) : "";
    type(next);
    onValueCommit?.(next);
    setOpen(false);
    field.current?.focus();
  };

  return (
    <Field
      className={className}
      label={label}
      description={description}
      error={error}
      required={required}
      id={id}
    >
      {(control) => (
        <div data-slot="date-field" className="relative">
          <input
            {...control}
            ref={field}
            name={name}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            readOnly={readOnly}
            value={text}
            placeholder={placeholder ?? format}
            onChange={(e) => type(e.target.value)}
            onBlur={closeEdit}
            className={cn(FIELD_BOX, "pe-9 placeholder:text-muted-foreground", INVALID_FIELD)}
          />

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={openCalendar}
                disabled={disabled || readOnly}
                /* Fuera del tabulador: el campo ya es alcanzable y se puede
                   escribir la fecha entera, así que un segundo tope solo alarga
                   el recorrido del formulario. */
                tabIndex={-1}
                className="absolute inset-y-0 end-2 my-auto inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CalendarIcon aria-hidden="true" className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={selected}
                defaultMonth={selected}
                disabled={(date) => !allowed(date)}
                onSelect={selectInCalendar}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Field>
  );
}
