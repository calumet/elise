import * as React from "react";

import { InlineError } from "./inline-error";

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

  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: React.ReactNode;

  required?: boolean;

  /**
   * Esconde el rótulo a la vista sin quitarlo del árbol de accesibilidad. Es el
   * `labelAccessibilityVisibility="exclusive"` de Shopify.
   *
   * No es lo mismo que no pasar rótulo: el control sigue teniendo nombre para un
   * lector de pantalla. Se usa cuando lo que rodea al campo ya lo explica, como
   * un buscador con su lupa dentro de una barra de herramientas.
   */
  labelHidden?: boolean;

  /** Fuerza el `id` del control. Por defecto se genera uno. */
  id?: string;

  /**
   * El control, como función. Recibe las props de accesibilidad ya calculadas y
   * tiene que aplicarlas.
   */
  children: (control: FieldControlProps) => React.ReactNode;
};

/**
 * Envoltorio de campo: rótulo, control, ayuda y error, con el enlace de
 * accesibilidad resuelto.
 *
 * El control se pasa como función y no como hijo directo para que aplicar
 * `aria-describedby` y `aria-invalid` sea obligatorio. Con un hijo normal es
 * fácil escribir el mensaje de error sin enlazarlo, y entonces el lector de
 * pantalla lo anuncia suelto, sin asociarlo al campo que lo produjo.
 *
 * ```tsx
 * <Field label="Correo" error={errors.email?.message} required>
 *   {(control) => <Input type="email" {...control} {...register("email")} />}
 * </Field>
 * ```
 *
 * No sabe nada de react-hook-form ni de Radix Form: recibe `error` ya resuelto,
 * así que sirve con `useZodForm`, con estado propio o sin librería.
 *
 * Para formularios que validan con la API nativa del navegador está `Form` y su
 * familia, montada sobre Radix Form. Las dos no se mezclan en un mismo campo,
 * porque cada una quiere ser dueña de su estado.
 */
function Field({
  className,
  label,
  description,
  error,
  required,
  labelHidden,
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
     el usuario más la necesita. */
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
      <label
        data-slot="field-label"
        htmlFor={id}
        className={cn("text-sm font-semibold text-foreground", labelHidden && "sr-only")}
      >
        {label}
        {required ? (
          <>
            {/* El sólido está calibrado como relleno; usado como texto no llega a
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
        <InlineError data-slot="field-error" id={idError}>
          {error}
        </InlineError>
      ) : null}
    </div>
  );
}

export { Field };
