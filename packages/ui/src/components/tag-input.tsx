import * as React from "react";

import { Chip } from "./chip";
import { Field } from "./field";
import { CAMPO_DESNUDO, CAMPO_INVALIDO } from "./input";

import { cn } from "@/lib/cn";

export type TagInputProps = {
  label: React.ReactNode;

  /** Esconde el rótulo sin quitarlo del árbol de accesibilidad. */
  labelHidden?: boolean;

  /** Texto de ayuda bajo el campo. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;

  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;

  /** Tope de etiquetas. Al llegar, el campo deja de aceptar. */
  max?: number;

  /**
   * Además de Intro. Por omisión, la coma: es lo que se teclea sin pensar al
   * escribir una lista.
   */
  separators?: string[];
};

/**
 * Campo de etiquetas: lo que se escribe se convierte en fichas que se pueden
 * quitar de una en una.
 *
 * Las fichas van dentro de la caja y no debajo, porque son el valor del campo y
 * no un resumen de él: fuera, borrar una parecería una acción sobre otra cosa.
 *
 * Retroceso con el campo vacío quita la última. Es lo que hace todo campo de
 * etiquetas y lo que la gente prueba primero, pero no es la única forma: cada
 * ficha lleva su propio botón, que es el que llega por teclado y por lector de
 * pantalla.
 *
 * Repetidas no entran. Un campo de etiquetas describe un conjunto, y la segunda
 * copia de una etiqueta no añade nada mientras ensucia la lista.
 */
export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      label,
      labelHidden,
      description,
      error,
      required,
      disabled,
      name,
      id,
      placeholder,
      className,
      value,
      defaultValue = [],
      onValueChange,
      max = Infinity,
      separators = [","],
    },
    ref,
  ) => {
    const [interno, setInterno] = React.useState(defaultValue);
    const [texto, setTexto] = React.useState("");
    const controlado = value !== undefined;
    const etiquetas = controlado ? value : interno;
    const propio = React.useRef<HTMLInputElement | null>(null);

    const cambiar = (siguientes: string[]) => {
      if (!controlado) setInterno(siguientes);
      onValueChange?.(siguientes);
    };

    /* Devuelve si hay que vaciar el campo. Una repetida también lo vacía aunque
       no añada nada: la etiqueta ya está puesta, así que dejar el texto escrito
       haría parecer que la tecla no hizo nada. */
    const anadir = (crudo: string) => {
      const limpio = crudo.trim();
      if (!limpio) return false;
      if (etiquetas.includes(limpio)) return true;
      if (etiquetas.length >= max) return false;
      cambiar([...etiquetas, limpio]);
      return true;
    };

    const teclas = (evento: React.KeyboardEvent<HTMLInputElement>) => {
      if (evento.key === "Enter" || separators.includes(evento.key)) {
        /* Intro dentro de un formulario lo enviaría, y aquí lo que cierra es la
           etiqueta. Solo se para cuando hay algo que cerrar. */
        if (!texto.trim()) return;
        evento.preventDefault();
        if (anadir(texto)) setTexto("");
        return;
      }
      if (evento.key === "Backspace" && texto === "" && etiquetas.length) {
        cambiar(etiquetas.slice(0, -1));
      }
    };

    /* Pegar una lista entera la reparte, en vez de meterla como una sola
       etiqueta con comas dentro. */
    const pegar = (evento: React.ClipboardEvent<HTMLInputElement>) => {
      const trozos = evento.clipboardData
        .getData("text")
        .split(new RegExp(`[${separators.join("")}\\n]`))
        .map((t) => t.trim())
        .filter(Boolean);
      if (trozos.length < 2) return;
      evento.preventDefault();
      const siguientes = [...etiquetas];
      for (const t of trozos) {
        if (siguientes.length >= max || siguientes.includes(t)) continue;
        siguientes.push(t);
      }
      cambiar(siguientes);
      setTexto("");
    };

    const lleno = etiquetas.length >= max;

    return (
      <Field
        label={label}
        labelHidden={labelHidden}
        description={description}
        error={error}
        required={required}
        id={id}
        className={className}
      >
        {(control) => (
          <div
            aria-invalid={control["aria-invalid"]}
            data-disabled={disabled ? "" : undefined}
            onPointerDown={(e) => {
              /* Pulsar el aire de la caja lleva al campo, como en cualquier
                 campo de texto: la caja entera se lee como uno. */
              if (e.target === e.currentTarget) propio.current?.focus();
            }}
            className={cn(
              "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1 ps-1.5 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:border-border-strong focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background data-disabled:cursor-not-allowed data-disabled:opacity-50",
              CAMPO_INVALIDO,
            )}
          >
            {etiquetas.map((etiqueta) => (
              <Chip
                key={etiqueta}
                data-slot="tag-input-tag"
                disabled={disabled}
                onRemove={() => cambiar(etiquetas.filter((e) => e !== etiqueta))}
              >
                {etiqueta}
              </Chip>
            ))}

            <input
              {...control}
              ref={(nodo) => {
                propio.current = nodo;
                if (typeof ref === "function") ref(nodo);
                else if (ref) ref.current = nodo;
              }}
              type="text"
              /* Al llegar al tope el campo se apaga, pero el apagado de la caja
                 lo manda `data-disabled` y no este `disabled`: si no, llenar la
                 lista apagaría también las etiquetas ya puestas. */
              disabled={disabled || lleno}
              placeholder={etiquetas.length ? undefined : placeholder}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={teclas}
              onPaste={pegar}
              /* Al salir del campo, lo escrito a medias se cierra en etiqueta.
                 Perderlo por cambiar de campo es el fallo más molesto que tiene
                 este control. */
              onBlur={() => {
                if (anadir(texto)) setTexto("");
              }}
              className={cn(CAMPO_DESNUDO, "h-6 w-20")}
            />

            {name
              ? etiquetas.map((etiqueta) => (
                  <input key={etiqueta} type="hidden" name={name} value={etiqueta} />
                ))
              : null}
          </div>
        )}
      </Field>
    );
  },
);
TagInput.displayName = "TagInput";
