import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";

import { FieldRequiredMark, useFieldIds } from "./field";
import { InlineError } from "./inline-error";

import { cn } from "@/lib/cn";

/* El grupo baja el id de su error para que una opción concreta pueda señalarse
   como la culpable con `invalid`. Sin esto, marcar una opción como inválida
   dejaría el `aria-invalid` apuntando a un mensaje que el lector de pantalla no
   sabría encontrar. */
const GrupoCtx = React.createContext<{ idError: string; hayError: boolean } | null>(null);

export type RadioGroupProps = {
  /** Rótulo del grupo entero. Hace de leyenda. */
  label: React.ReactNode;

  /** Esconde el rótulo sin quitarlo del árbol de accesibilidad. */
  labelHidden?: boolean;

  /** Texto de ayuda bajo las opciones. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error del grupo. Su presencia lo marca como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  disabled?: boolean;
  name?: string;

  id?: string;
  className?: string;

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  children?: React.ReactNode;
};

/**
 * Grupo de opciones excluyentes.
 *
 * El rótulo, la ayuda y el error son del grupo y no de cada opción, que es lo
 * que lo distingue de una pila de casillas: la pregunta se hace una vez y las
 * opciones son las respuestas. Un error como «elige una forma de envío» no
 * pertenece a ninguna de ellas en particular.
 *
 * El grupo es dueño del valor, con `value` y `onValueChange` en modo controlado
 * y `defaultValue` en el no controlado.
 *
 * El foco entra una vez al grupo y las flechas recorren las opciones, de modo
 * que tabular salta al control siguiente y no a la opción siguiente.
 */
function RadioGroup({
  label,
  labelHidden,
  description,
  error,
  required,
  disabled,
  name,
  id: idProp,
  className,
  value,
  defaultValue,
  onValueChange,
  children,
}: RadioGroupProps) {
  const { id, idDescripcion, idError, hayError, control } = useFieldIds({
    id: idProp,
    description,
    error,
    required,
  });
  const idRotulo = `${id}-label`;

  const contexto = React.useMemo(() => ({ idError, hayError }), [idError, hayError]);

  return (
    <div
      data-slot="radio-group-field"
      data-invalid={hayError ? "" : undefined}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {/* El rótulo del grupo se enlaza con `aria-labelledby` y no con `htmlFor`,
          porque lo que rotula no es un control sino un conjunto: `htmlFor`
          quiere un elemento rotulable y aquí solo hay un contenedor. */}
      <span
        data-slot="radio-group-label"
        id={idRotulo}
        className={cn("text-sm font-semibold text-foreground", labelHidden && "sr-only")}
      >
        {label}
        {required ? <FieldRequiredMark /> : null}
      </span>

      <GrupoCtx.Provider value={contexto}>
        <RadioGroupPrimitive.Root
          data-slot="radio-group"
          aria-labelledby={idRotulo}
          aria-describedby={control["aria-describedby"]}
          aria-invalid={control["aria-invalid"]}
          aria-required={control["aria-required"]}
          name={name}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          className="grid gap-3"
        >
          {children}
        </RadioGroupPrimitive.Root>
      </GrupoCtx.Provider>

      {description ? (
        <p
          data-slot="radio-group-description"
          id={idDescripcion}
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      ) : null}

      {hayError ? (
        <InlineError data-slot="radio-group-error" id={idError}>
          {error}
        </InlineError>
      ) : null}
    </div>
  );
}

export type RadioGroupItemProps = {
  value: string;

  /** Contenido del rótulo, al lado del punto. */
  label: React.ReactNode;

  /** Ayuda de esta opción en concreto, no del grupo. */
  description?: React.ReactNode;

  /**
   * Señala esta opción como la que provoca el error del grupo. El mensaje sigue
   * siendo uno solo y del grupo; esto solo dice cuál de las respuestas lo
   * dispara, y la enlaza para que el lector de pantalla lo anuncie al llegar.
   */
  invalid?: boolean;

  disabled?: boolean;
  id?: string;
  className?: string;
};

/**
 * Una opción del grupo.
 *
 * Lleva su rótulo al lado y puede llevar su propia ayuda, para lo que cambia de
 * una respuesta a otra («llega en tres días», «llega mañana»). Lo que no lleva
 * es mensaje de error propio: ese es del grupo.
 */
function RadioGroupItem({
  value,
  label,
  description,
  invalid,
  disabled,
  id: idProp,
  className,
}: RadioGroupItemProps) {
  const grupo = React.useContext(GrupoCtx);
  const generado = React.useId();
  const id = idProp ?? generado;
  const idDescripcion = `${id}-description`;

  const senalado = Boolean(invalid && grupo?.hayError);
  const describedBy =
    [description ? idDescripcion : null, senalado ? grupo?.idError : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div data-slot="radio-group-option" className={cn("flex items-start gap-2", className)}>
      <RadioGroupPrimitive.Item
        data-slot="radio-group-item"
        id={id}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={senalado || undefined}
        /* Los 20px del punto son los mismos que el interlineado del rótulo, así
           que los dos quedan a ras sin empujar ninguno. */
        className={cn(
          "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-card transition-[background-color,border-color,box-shadow] duration-(--duration-fast) ease-out",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:shadow-bevel",
          "aria-invalid:border-destructive",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="block size-2.5 rounded-full bg-primary-foreground"
        />
      </RadioGroupPrimitive.Item>

      <div className={cn("flex min-w-0 flex-col gap-1", disabled && "opacity-50")}>
        <label
          data-slot="radio-group-item-label"
          htmlFor={id}
          className={cn(
            "text-base text-foreground",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {label}
        </label>

        {description ? (
          <p
            data-slot="radio-group-item-description"
            id={idDescripcion}
            className="text-xs text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { RadioGroup, RadioGroupItem };
