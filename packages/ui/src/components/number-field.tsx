/**
 * Campo numérico: `min`, `max`, `step`, prefijo, sufijo y el teclado que sale
 * en un móvil.
 *
 * El `<input>` es de texto y no de tipo `number`. Uno de tipo `number` cambia el
 * valor al girar la rueda del ratón sobre él, aunque quien lo hace esté
 * desplazando la página, y cuando lo que se escribe no es un número devuelve
 * cadena vacía sin decir cuál era: no hay forma de corregir lo que se tecleó.
 * `inputMode` da el teclado numérico igual, que es lo único que se quería.
 *
 * Los dos botones de paso están además de las flechas del teclado, no en su
 * lugar: el teclado lo usa quien ya está escribiendo en el campo, y los botones
 * quien llegó con el ratón y no va a moverlo.
 *
 * @module
 */

import { Minus, Plus } from "@calumet/elise-icons";
import * as React from "react";

import { Field } from "./field";
import { CAJA_CAMPO_COMPUESTA, CAMPO_DESNUDO, CAMPO_INVALIDO } from "./input";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link NumberField}. */
export type NumberFieldProps = {
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

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  min?: number;
  max?: number;
  step?: number;

  /** Se pinta pegado al valor, del tipo `$` o `https://`. */
  prefix?: React.ReactNode;

  /** Igual pero al otro lado, del tipo `%` o `kg`. */
  suffix?: React.ReactNode;

  /** Qué teclado sale en un móvil. */
  inputMode?: "decimal" | "numeric";
};

/** Decimales que hace falta escribir para que el paso no arrastre cola. */
const decimalesDe = (paso: number) => {
  const texto = String(paso);
  const punto = texto.indexOf(".");
  return punto === -1 ? 0 : texto.length - punto - 1;
};

const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Campo numérico: `min`, `max`, `step`, prefijo, sufijo y el teclado que sale
 * en un móvil.
 *
 * El `<input>` es de texto y no de tipo `number`. Uno de tipo `number` cambia el
 * valor al girar la rueda del ratón sobre él, aunque quien lo hace esté
 * desplazando la página, y cuando lo que se escribe no es un número devuelve
 * cadena vacía sin decir cuál era: no hay forma de corregir lo que se tecleó.
 * `inputMode` da el teclado numérico igual, que es lo único que se quería.
 *
 * Los dos botones de paso están además de las flechas del teclado, no en su
 * lugar: el teclado lo usa quien ya está escribiendo en el campo, y los botones
 * quien llegó con el ratón y no va a moverlo.
 */
export const NumberField: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<NumberFieldProps> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
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
      min = -Infinity,
      max = Infinity,
      step = 1,
      prefix,
      suffix,
      inputMode = "decimal",
    },
    ref,
  ) => {
    const etiquetaMenos = useElLabel("ui", "decrement", "Restar");
    const etiquetaMas = useElLabel("ui", "increment", "Sumar");

    const [interno, setInterno] = React.useState(defaultValue);
    const controlado = value !== undefined;
    const texto = controlado ? value : interno;

    const escribir = (siguiente: string) => {
      if (!controlado) setInterno(siguiente);
      onValueChange?.(siguiente);
    };

    const pasar = (direccion: 1 | -1) => {
      const actual = Number(texto);
      /* Sin valor todavía, el primer paso arranca del mínimo si lo hay; si no,
         de cero. Arrancar de cero con un mínimo de 10 daría un valor inválido
         al primer clic. */
      const base =
        texto.trim() === "" || Number.isNaN(actual) ? (min > -Infinity ? min : 0) : actual;
      const siguiente = limitar(base + step * direccion, min, max);
      escribir(siguiente.toFixed(decimalesDe(step)));
    };

    const numero = Number(texto);
    const hayNumero = texto.trim() !== "" && !Number.isNaN(numero);
    const enElTope = hayNumero && numero >= max;
    const enElSuelo = hayNumero && numero <= min;

    const teclas = (evento: React.KeyboardEvent) => {
      if (evento.key !== "ArrowUp" && evento.key !== "ArrowDown") return;
      evento.preventDefault();
      pasar(evento.key === "ArrowUp" ? 1 : -1);
    };

    const paso = (direccion: 1 | -1, apagado: boolean, etiqueta: string) => (
      <button
        type="button"
        tabIndex={-1}
        aria-label={etiqueta}
        disabled={disabled || readOnly || apagado}
        onClick={() => pasar(direccion)}
        className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground disabled:pointer-events-none disabled:text-border-strong"
      >
        {direccion === 1 ? (
          <Plus className="size-4" aria-hidden />
        ) : (
          <Minus className="size-4" aria-hidden />
        )}
      </button>
    );

    return (
      <Field
        label={label}
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
            {prefix ? (
              <span className="shrink-0 text-muted-foreground" aria-hidden="true">
                {prefix}
              </span>
            ) : null}

            <input
              {...control}
              ref={ref}
              type="text"
              inputMode={inputMode}
              name={name}
              placeholder={placeholder}
              readOnly={readOnly}
              disabled={disabled}
              value={texto}
              onChange={(e) => escribir(e.target.value)}
              onKeyDown={teclas}
              /* El campo es de texto, así que el rango y el valor los tiene que
                 decir ARIA: si no, un lector de pantalla no sabe entre qué y qué
                 se mueve ni por dónde va. */
              role="spinbutton"
              aria-valuenow={hayNumero ? numero : undefined}
              aria-valuemin={min > -Infinity ? min : undefined}
              aria-valuemax={max < Infinity ? max : undefined}
              aria-valuetext={hayNumero ? undefined : ""}
              className={cn(CAMPO_DESNUDO, "tabular-nums")}
            />

            {suffix ? (
              <span className="shrink-0 text-muted-foreground" aria-hidden="true">
                {suffix}
              </span>
            ) : null}

            {paso(-1, enElSuelo, etiquetaMenos)}
            {paso(1, enElTope, etiquetaMas)}
          </div>
        )}
      </Field>
    );
  },
);
NumberField.displayName = "NumberField";
