/**
 * Interruptor de encendido y apagado.
 *
 * Se distingue de `Checkbox` en que aplica el cambio al momento, sin esperar a
 * que se envíe un formulario. Si el cambio necesita confirmación, la casilla es
 * el control correcto.
 *
 * Es un campo, no un control suelto: lleva su rótulo al lado y admite ayuda y
 * error, con el enlace de accesibilidad ya resuelto. Antes había que ponerle un
 * `Label` externo a mano, y con eso cada sitio inventaba su propia fila y nadie
 * enlazaba la ayuda.
 *
 * El rótulo va al lado y no encima, al contrario que en `Field`: el control ya
 * ocupa el inicio de la línea, así que un rótulo arriba dejaría un renglón con
 * un interruptor solo y sin nada que lo explique a su altura. El rótulo, la
 * ayuda y el error viven en una columna a la derecha del control, de modo que
 * los tres empiezan en la misma x y la ayuda se lee colgando del rótulo y no
 * del interruptor.
 *
 * El carril va plano, sin bisel: es un canal por el que corre el pulgar, no una
 * cara que se hunda al pulsarla. El bisel lo llevan los rellenos que hacen de
 * botón, y aquí hacía que la pastilla entera pareciera pulsable.
 *
 * Acepta modo controlado con `checked` y no controlado con `defaultChecked`.
 * Con `name` el primitivo emite un input oculto, de modo que un formulario
 * nativo lo envía igual.
 *
 * @module
 */

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { FieldRequiredMark, useFieldIds } from "./field";
import { InlineError } from "./inline-error";

import { cn } from "@/lib/cn";

/** Props de {@link Switch}. */
export type SwitchProps = {
  /** Contenido del rótulo, al lado del interruptor. */
  label: React.ReactNode;

  /**
   * Esconde el rótulo a la vista sin quitarlo del árbol de accesibilidad.
   *
   * Es lo que hace falta cuando el interruptor va en una celda de tabla o en
   * una barra de herramientas y quien lo rodea ya dice de qué se trata. No es
   * lo mismo que no pasar rótulo: sin él el control no tiene nombre y un lector
   * de pantalla solo puede anunciar «interruptor».
   */
  labelHidden?: boolean;

  /** Texto de ayuda bajo el control. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el control como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  disabled?: boolean;
  name?: string;

  /** Lo que se envía en el formulario cuando está encendido. */
  value?: string;

  id?: string;
  className?: string;

  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * Interruptor de encendido y apagado.
 *
 * Se distingue de `Checkbox` en que aplica el cambio al momento, sin esperar a
 * que se envíe un formulario. Si el cambio necesita confirmación, la casilla es
 * el control correcto.
 *
 * Es un campo, no un control suelto: lleva su rótulo al lado y admite ayuda y
 * error, con el enlace de accesibilidad ya resuelto. Antes había que ponerle un
 * `Label` externo a mano, y con eso cada sitio inventaba su propia fila y nadie
 * enlazaba la ayuda.
 *
 * El rótulo va al lado y no encima, al contrario que en `Field`: el control ya
 * ocupa el inicio de la línea, así que un rótulo arriba dejaría un renglón con
 * un interruptor solo y sin nada que lo explique a su altura. El rótulo, la
 * ayuda y el error viven en una columna a la derecha del control, de modo que
 * los tres empiezan en la misma x y la ayuda se lee colgando del rótulo y no
 * del interruptor.
 *
 * El carril va plano, sin bisel: es un canal por el que corre el pulgar, no una
 * cara que se hunda al pulsarla. El bisel lo llevan los rellenos que hacen de
 * botón, y aquí hacía que la pastilla entera pareciera pulsable.
 *
 * Acepta modo controlado con `checked` y no controlado con `defaultChecked`.
 * Con `name` el primitivo emite un input oculto, de modo que un formulario
 * nativo lo envía igual.
 */
function Switch({
  label,
  labelHidden,
  description,
  error,
  required,
  disabled,
  name,
  value,
  id: idProp,
  className,
  checked,
  defaultChecked,
  onCheckedChange,
}: SwitchProps): React.JSX.Element {
  const { id, idDescripcion, idError, hayError, control } = useFieldIds({
    id: idProp,
    description,
    error,
    required,
  });

  return (
    <div
      data-slot="switch-field"
      data-invalid={hayError ? "" : undefined}
      className={cn("flex items-start gap-2", className)}
    >
      <SwitchPrimitive.Root
        {...control}
        data-slot="switch"
        name={name}
        value={value}
        disabled={disabled}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        /* El carril mide 32x20 y el pulgar 16, así que quedan 2px de aire en
           los cuatro lados y 12 de recorrido. Los 20 de alto son los mismos que
           la línea del rótulo, y por eso el control y su primera línea de texto
           quedan a ras sin tener que empujar ninguno de los dos. */
        className={cn(
          "inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full bg-track transition-[background-color] duration-(--duration-fast) ease-out",
          "data-[state=checked]:bg-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform duration-(--duration-fast) ease-out data-[state=checked]:translate-x-3.5"
        />
      </SwitchPrimitive.Root>

      <div className={cn("flex min-w-0 flex-col gap-1", disabled && "opacity-50")}>
        <label
          data-slot="switch-label"
          htmlFor={id}
          className={cn(
            "text-base text-foreground",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            labelHidden && "sr-only",
          )}
        >
          {label}
          {required ? <FieldRequiredMark /> : null}
        </label>

        {description ? (
          <p
            data-slot="switch-description"
            id={idDescripcion}
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        ) : null}

        {hayError ? (
          <InlineError data-slot="switch-error" id={idError}>
            {error}
          </InlineError>
        ) : null}
      </div>
    </div>
  );
}

export { Switch };
