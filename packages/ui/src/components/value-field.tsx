/**
 * El campo cuyo valor es un registro: se resume en sitio y se edita aparte.
 *
 * @module
 */

import { ChevronRight, CirclePlus, Pencil } from "@calumet/elise-icons";
import * as React from "react";

import { Button } from "./button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Field, type FieldControlProps } from "./field";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link ValueField}. */
export type ValueFieldProps = Omit<React.ComponentProps<"div">, "children" | "onChange"> & {
  label: React.ReactNode;

  /**
   * El resumen del valor, una línea por elemento. Sin líneas el campo sale
   * vacío, con la fila que abre el editor.
   */
  lines?: React.ReactNode[];

  /** Texto de ayuda. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  disabled?: boolean;

  /** El rótulo de la fila vacía. Por defecto, «Agregar». */
  addLabel?: React.ReactNode;

  /** Ayuda bajo el título del editor. */
  editorDescription?: React.ReactNode;

  /** Ancho del modal, como en `Dialog`. */
  size?: "sm" | "md" | "lg";

  /** Se llama al confirmar, antes de cerrar. */
  onDone?: () => void;

  /** Se llama al cancelar, antes de cerrar. */
  onCancel?: () => void;

  /** Los campos del registro, dentro del modal. */
  children?: React.ReactNode;
};

/**
 * El campo cuyo valor es un registro.
 *
 * Una dirección son cuatro campos y un banner siete. Puestos en línea dentro
 * del formulario que los contiene, una lista de tres deja veintiún controles
 * seguidos y la pantalla se vuelve ilegible. Este campo los resume en sitio y
 * los edita aparte.
 *
 * Tiene dos caras. **Vacío** es una fila con un más, el rótulo de lo que falta
 * y un caret, que abre el editor. **Lleno** es el resumen en varias líneas con
 * un lápiz al costado. Con valor deja de ser un enlace: es un dato con su
 * acción de editar.
 *
 * El resumen lo arma quien llama y llega en `lines`, ya formateado. Con el
 * registro crudo el campo tendría que saber de direcciones, de banners y de
 * entradas de menú, que es justo lo que no puede saber.
 *
 * ```tsx
 * <ValueField
 *   label="Dirección de envío"
 *   description="Es la que sale en la factura."
 *   addLabel="Agregar dirección"
 *   lines={direccion && [direccion.calle, direccion.ciudad, direccion.pais]}
 *   onDone={() => form.trigger("direccion")}
 * >
 *   <Field label="Calle">{(c) => <Input {...c} {...form.register("direccion.calle")} />}</Field>
 * </ValueField>
 * ```
 *
 * Vaciar el campo no vive acá: es una acción del grupo, y `Section` ya acepta
 * `actions`.
 */
export function ValueField({
  className,
  label,
  lines,
  description,
  error,
  required,
  disabled,
  addLabel,
  editorDescription,
  size = "md",
  onDone,
  onCancel,
  children,
  ...props
}: ValueFieldProps): React.JSX.Element {
  const [abierto, setAbierto] = React.useState(false);

  const rotuloAgregar = useElLabel("ui", "valueFieldAdd", "Agregar");
  const rotuloEditar = useElLabel("ui", "valueFieldEdit", "Editar");
  const rotuloCancelar = useElLabel("ui", "valueFieldCancel", "Cancelar");
  const rotuloListo = useElLabel("ui", "valueFieldDone", "Listo");

  const lleno = Boolean(lines?.length);

  const cerrar = (confirmando: boolean) => {
    if (confirmando) onDone?.();
    else onCancel?.();
    setAbierto(false);
  };

  const vacio = (control: FieldControlProps) => (
    <button
      type="button"
      {...control}
      disabled={disabled}
      onClick={() => setAbierto(true)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2.5 text-start text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out",
        "hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "aria-invalid:border-destructive disabled:pointer-events-none disabled:opacity-55",
      )}
    >
      <CirclePlus aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{addLabel ?? rotuloAgregar}</span>
      {/* Sin caret cuando no se puede abrir: no lleva a ninguna parte. */}
      {disabled ? null : (
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  );

  const resumen = (control: FieldControlProps) => (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-border bg-card p-3",
        error ? "border-destructive" : null,
        disabled ? "opacity-55" : null,
      )}
    >
      <div className="min-w-0 flex-1 text-base leading-snug">
        {lines?.map((linea, indice) => (
          // Las líneas son un resumen y no una lista reordenable: el índice basta.
          <p key={indice} className={cn("truncate", indice > 0 ? "text-muted-foreground" : null)}>
            {linea}
          </p>
        ))}
      </div>
      <Button
        {...control}
        variant="ghost"
        size="icon"
        disabled={disabled}
        aria-label={`${rotuloEditar}: ${typeof label === "string" ? label : ""}`.trim()}
        onClick={() => setAbierto(true)}
      >
        <Pencil aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );

  return (
    <>
      <Field
        className={className}
        label={label}
        description={description}
        error={error}
        required={required}
        {...props}
      >
        {(control) => (lleno ? resumen(control) : vacio(control))}
      </Field>

      <Dialog
        open={abierto}
        onOpenChange={(siguiente) => (siguiente ? setAbierto(true) : cerrar(false))}
      >
        <DialogContent size={size}>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            {editorDescription ? <DialogDescription>{editorDescription}</DialogDescription> : null}
          </DialogHeader>
          <DialogBody>{children}</DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => cerrar(false)}>
              {rotuloCancelar}
            </Button>
            <Button onClick={() => cerrar(true)}>{rotuloListo}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
