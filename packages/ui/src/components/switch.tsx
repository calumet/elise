import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { FieldRequiredMark, useFieldIds } from "./field";
import { InlineError } from "./inline-error";

import { cn } from "@/lib/cn";

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
 * un interruptor solo y sin nada que lo explique a su altura.
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
}: SwitchProps) {
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
      className={cn("flex flex-col gap-1.5", className)}
    >
      <div className="flex items-center gap-2.5">
        <SwitchPrimitive.Root
          {...control}
          data-slot="switch"
          name={name}
          value={value}
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-track shadow-bevel-inset transition-[background-color,box-shadow] duration-(--duration-fast) ease-out",
            "data-[state=checked]:bg-primary data-[state=checked]:shadow-bevel",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <SwitchPrimitive.Thumb
            data-slot="switch-thumb"
            /* El carril mide 44x24 con 1px de borde y el pulgar 18px, de modo
               que quedan 3px de hueco en los cuatro lados: arriba y abajo por
               el alto, y a los costados por los dos desplazamientos. */
            className="pointer-events-none block h-4.5 w-4.5 translate-x-0.5 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform duration-(--duration-fast) ease-out data-[state=checked]:translate-x-5.5"
          />
        </SwitchPrimitive.Root>

        <label
          data-slot="switch-label"
          htmlFor={id}
          className={cn(
            "cursor-pointer text-sm font-semibold text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            labelHidden && "sr-only",
          )}
        >
          {label}
          {required ? <FieldRequiredMark /> : null}
        </label>
      </div>

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
  );
}

export { Switch };
