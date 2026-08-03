import { Calendar as CalendarIcon } from "@calumet/elise-icons";
import * as React from "react";

import { Calendar } from "./calendar";
import { Field } from "./field";
import { CAMPO_INVALIDO } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

const PATRON = /^(\d{4})-(\d{2})-(\d{2})$/;

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
const aFecha = (texto: string): Date | null => {
  const partes = PATRON.exec(texto.trim());
  if (!partes) return null;
  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const fecha = new Date(anio, mes - 1, dia);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
    return null;
  }
  return fecha;
};

const aTexto = (fecha: Date) =>
  [
    String(fecha.getFullYear()).padStart(4, "0"),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");

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
 * Sigue a `s-date-field` de Shopify, que no es un calendario suelto sino un
 * campo con calendario emergente, y por eso trae rótulo, ayuda y error. Para el
 * calendario a secas está `Calendar`, y para un disparador sin campo,
 * `DatePicker`.
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
}: DateFieldProps) {
  const controlado = value !== undefined;
  const [interno, setInterno] = React.useState(defaultValue);
  const texto = controlado ? value : interno;

  const [abierto, setAbierto] = React.useState(false);
  const campo = React.useRef<HTMLInputElement>(null);

  const abrirCalendario = useElLabel("ui", "openCalendar", "Abrir calendario");
  const formato = useElLabel("ui", "dateFormat", "AAAA-MM-DD");

  const escribir = React.useCallback(
    (siguiente: string) => {
      if (!controlado) setInterno(siguiente);
      onValueChange?.(siguiente);
    },
    [controlado, onValueChange],
  );

  const limiteMin = min ? aFecha(min) : null;
  const limiteMax = max ? aFecha(max) : null;

  const admitida = React.useCallback(
    (fecha: Date) => {
      if (limiteMin && fecha < limiteMin) return false;
      if (limiteMax && fecha > limiteMax) return false;
      return !isDateDisabled?.(fecha);
    },
    [limiteMin, limiteMax, isDateDisabled],
  );

  /* Una fecha a medio escribir no debe mover el calendario ni pintarse como
     elegida, así que solo cuenta la que ya está completa y admitida. */
  const elegida = React.useMemo(() => {
    const fecha = aFecha(texto);
    return fecha && admitida(fecha) ? fecha : undefined;
  }, [texto, admitida]);

  const cerrarEdicion = () => {
    if (texto === "") return;
    const fecha = aFecha(texto);
    if (!fecha || !admitida(fecha)) {
      onInvalid?.(texto);
      return;
    }
    /* Se normaliza antes de confirmar, para que «2026-8-3» y «2026-08-03» no
       lleguen al consumidor como dos valores distintos. */
    const normalizado = aTexto(fecha);
    if (normalizado !== texto) escribir(normalizado);
    onValueCommit?.(normalizado);
  };

  const elegirEnCalendario = (fecha?: Date) => {
    const siguiente = fecha ? aTexto(fecha) : "";
    escribir(siguiente);
    onValueCommit?.(siguiente);
    setAbierto(false);
    campo.current?.focus();
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
            ref={campo}
            name={name}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            readOnly={readOnly}
            value={texto}
            placeholder={placeholder ?? formato}
            onChange={(e) => escribir(e.target.value)}
            onBlur={cerrarEdicion}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:border-border-strong placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
              CAMPO_INVALIDO,
            )}
          />

          <Popover open={abierto} onOpenChange={setAbierto}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={abrirCalendario}
                disabled={disabled || readOnly}
                /* Fuera del tabulador: el campo ya es alcanzable y se puede
                   escribir la fecha entera, así que un segundo tope solo alarga
                   el recorrido del formulario. */
                tabIndex={-1}
                className="absolute inset-y-0 end-2 my-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CalendarIcon aria-hidden="true" className="size-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={elegida}
                defaultMonth={elegida}
                disabled={(fecha) => !admitida(fecha)}
                onSelect={elegirEnCalendario}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Field>
  );
}
