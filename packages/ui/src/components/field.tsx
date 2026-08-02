import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props que el campo tiene que recibir para quedar bien enlazado. */
export type FieldControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
  "aria-required": true | undefined;
};

export type FieldProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode;

  /** Texto de ayuda. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el campo como invalido. */
  error?: React.ReactNode;

  required?: boolean;

  /** Fuerza el `id` del control. Por defecto se genera uno. */
  id?: string;

  /**
   * El control, como funcion. Recibe las props de accesibilidad ya calculadas y
   * tiene que aplicarlas.
   */
  children: (control: FieldControlProps) => React.ReactNode;
};

/**
 * Envoltorio de campo: rotulo, control, ayuda y error, con el enlace de
 * accesibilidad resuelto.
 *
 * El control se pasa como funcion y no como hijo directo para que aplicar
 * `aria-describedby` y `aria-invalid` sea obligatorio. Con un hijo normal es
 * facil escribir el mensaje de error sin enlazarlo, y entonces el lector de
 * pantalla lo anuncia suelto, sin asociarlo al campo que lo produjo.
 *
 * ```tsx
 * <Field label="Correo" error={errors.email?.message} required>
 *   {(control) => <Input type="email" {...control} {...register("email")} />}
 * </Field>
 * ```
 *
 * No sabe nada de react-hook-form ni de Radix Form: recibe `error` ya resuelto,
 * asi que sirve con `useZodForm`, con estado propio o sin libreria.
 *
 * Para formularios que validan con la API nativa del navegador esta `Form` y su
 * familia, montada sobre Radix Form. Las dos no se mezclan en un mismo campo,
 * porque cada una quiere ser dueña de su estado.
 */
function Field({
  className,
  label,
  description,
  error,
  required,
  id: idProp,
  children,
  ...props
}: FieldProps) {
  const generado = React.useId();
  const id = idProp ?? generado;
  const idDescripcion = `${id}-description`;
  const idError = `${id}-error`;
  const requeridoLabel = useElLabel("ui", "required", "obligatorio");

  const hayError = Boolean(error);

  /* La ayuda sigue enlazada aunque haya error, para no perderla justo cuando
     el usuario mas la necesita. */
  const describedBy =
    [description ? idDescripcion : null, hayError ? idError : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div
      data-slot="field"
      data-invalid={hayError ? "" : undefined}
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      <label data-slot="field-label" htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {required ? (
          <>
            {/* El solido esta calibrado como relleno; usado como texto no llega a
                4.5:1 en oscuro. Va el `-subtle-foreground`, igual que en Badge. */}
            <span aria-hidden="true" className="ml-0.5 text-destructive-subtle-foreground">
              *
            </span>
            <span className="sr-only"> ({requeridoLabel})</span>
          </>
        ) : null}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": hayError || undefined,
        "aria-required": required || undefined,
      })}

      {description ? (
        <p
          data-slot="field-description"
          id={idDescripcion}
          className="text-xs text-muted-foreground"
        >
          {description}
        </p>
      ) : null}

      {hayError ? (
        /* `role="alert"` para que el mensaje se anuncie al aparecer, sin esperar
           a que el foco vuelva al campo. */
        <p
          data-slot="field-error"
          id={idError}
          role="alert"
          className="text-xs font-medium text-destructive-subtle-foreground"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { Field };
