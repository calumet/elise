import { Check, Minus } from "@calumet/elise-icons";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

import { FieldRequiredMark, useFieldIds } from "./field";
import { InlineError } from "./inline-error";

import { cn } from "@/lib/cn";

export type CheckboxProps = {
  /** Contenido del rótulo, al lado de la casilla. */
  label: React.ReactNode;

  /**
   * Esconde el rótulo a la vista sin quitarlo del árbol de accesibilidad.
   *
   * Hace falta en una celda de tabla, donde la columna ya dice de qué se trata
   * y repetirlo en cada fila sería ruido. No es lo mismo que no pasar rótulo:
   * sin él la casilla no tiene nombre y un lector de pantalla solo puede
   * anunciar «casilla».
   */
  labelHidden?: boolean;

  /** Texto de ayuda bajo el control. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el control como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  disabled?: boolean;
  name?: string;

  /** Lo que se envía en el formulario cuando está marcada. */
  value?: string;

  id?: string;
  className?: string;

  checked?: CheckboxPrimitive.CheckedState;
  defaultChecked?: CheckboxPrimitive.CheckedState;
  onCheckedChange?: (checked: CheckboxPrimitive.CheckedState) => void;
};

/**
 * Casilla de verificación.
 *
 * Es un campo, no un control suelto: lleva su rótulo al lado y admite ayuda y
 * error, con el enlace de accesibilidad ya resuelto. El rótulo, la ayuda y el
 * error van en una columna a la derecha, así que los tres empiezan en la misma
 * x y la ayuda cuelga del rótulo y no de la casilla.
 *
 * Se distingue de `Switch` en que no aplica nada al momento: la casilla dice
 * qué se va a enviar y el cambio ocurre al enviar. Para algo que surte efecto
 * al tocarlo, el interruptor.
 *
 * `checked` admite `"indeterminate"` además de los dos booleanos, que es el
 * estado de una casilla maestra cuando solo parte de sus hijas está marcada.
 * Ese tercer estado no existe en un `input` nativo salvo por propiedad del DOM.
 *
 * Con `name` el primitivo emite un input oculto, de modo que un formulario
 * nativo la envía igual.
 */
function Checkbox({
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
}: CheckboxProps) {
  const { id, idDescripcion, idError, hayError, control } = useFieldIds({
    id: idProp,
    description,
    error,
    required,
  });

  return (
    <div
      data-slot="checkbox-field"
      data-invalid={hayError ? "" : undefined}
      className={cn("flex items-start gap-2", className)}
    >
      <CheckboxPrimitive.Root
        {...control}
        data-slot="checkbox"
        name={name}
        value={value}
        disabled={disabled}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        /* Los 20px del control son los mismos que el interlineado del rótulo,
           así que la casilla y su primera línea de texto quedan a ras sin tener
           que empujar ninguna de las dos. */
        className={cn(
          "group inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-border-strong bg-card text-transparent transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-bevel",
          "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:shadow-bevel",
          "aria-invalid:border-destructive",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-current"
        >
          {/* El indicador se monta en los dos estados marcados, así que el glifo
              lo elige el `data-state` de la raíz y no hace falta leer `checked`,
              que en modo no controlado no llega por props. */}
          <Check className="hidden size-3 group-data-[state=checked]:block" aria-hidden="true" />
          <Minus
            className="hidden size-3 group-data-[state=indeterminate]:block"
            aria-hidden="true"
          />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <div className={cn("flex min-w-0 flex-col gap-1", disabled && "opacity-50")}>
        <label
          data-slot="checkbox-label"
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
            data-slot="checkbox-description"
            id={idDescripcion}
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        ) : null}

        {hayError ? (
          <InlineError data-slot="checkbox-error" id={idError}>
            {error}
          </InlineError>
        ) : null}
      </div>
    </div>
  );
}

export { Checkbox };
