import * as React from "react";

import { FieldRequiredMark, useFieldIds } from "./field";
import { InlineError } from "./inline-error";

import { cn } from "@/lib/cn";

export type CheckboxGroupProps = {
  /** Rótulo del grupo entero. Hace de leyenda. */
  label: React.ReactNode;

  /** Esconde el rótulo sin quitarlo del árbol de accesibilidad. */
  labelHidden?: boolean;

  /** Texto de ayuda bajo las opciones. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error del grupo. Su presencia lo marca como inválido. */
  error?: React.ReactNode;

  required?: boolean;

  id?: string;
  className?: string;

  /** Las casillas del grupo. */
  children?: React.ReactNode;
};

/**
 * Grupo de opciones que se pueden elegir a la vez.
 *
 * Es a `Checkbox` lo que `RadioGroup` es a un radio: el rótulo, la ayuda y el
 * error son del grupo y no de cada casilla, porque la pregunta se hace una vez
 * y las opciones son las respuestas. Un error como «elige al menos un aviso» no
 * pertenece a ninguna casilla en particular.
 *
 * No es dueño del valor. Cada casilla lleva el suyo, que es lo que separa esto
 * de un grupo de radios: no hay una respuesta, hay tantas como casillas, y
 * centralizarlas obligaría a inventar un formato de lista que el formulario ya
 * resuelve por `name`.
 *
 * Sale como `role="group"` y no como `<fieldset>`: la leyenda de un fieldset se
 * coloca sobre el borde y hay que deshacerlo entero para que se vea como el
 * resto de los campos.
 */
function CheckboxGroup({
  label,
  labelHidden,
  description,
  error,
  required,
  id: idProp,
  className,
  children,
}: CheckboxGroupProps): React.JSX.Element {
  const { id, idDescripcion, idError, hayError, control } = useFieldIds({
    id: idProp,
    description,
    error,
    required,
  });
  const idRotulo = `${id}-label`;

  return (
    <div
      data-slot="checkbox-group-field"
      data-invalid={hayError ? "" : undefined}
      className={cn("flex flex-col gap-1.5", className)}
    >
      <span
        data-slot="checkbox-group-label"
        id={idRotulo}
        className={cn("text-sm font-semibold text-foreground", labelHidden && "sr-only")}
      >
        {label}
        {required ? <FieldRequiredMark /> : null}
      </span>

      <div
        data-slot="checkbox-group"
        role="group"
        aria-labelledby={idRotulo}
        aria-describedby={control["aria-describedby"]}
        className="grid gap-3"
      >
        {children}
      </div>

      {description ? (
        <p
          data-slot="checkbox-group-description"
          id={idDescripcion}
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      ) : null}

      {hayError ? (
        <InlineError data-slot="checkbox-group-error" id={idError}>
          {error}
        </InlineError>
      ) : null}
    </div>
  );
}

export { CheckboxGroup };
