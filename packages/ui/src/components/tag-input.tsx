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
 *
 * @module
 */

import * as React from "react";

import { cn } from "@/lib/cn";

import { Chip } from "./chip";
import { Field } from "./field";
import { BARE_FIELD, INVALID_FIELD } from "./input";

/** Props de {@link TagInput}. */
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
export const TagInput: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<TagInputProps> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, TagInputProps>(
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
    const [internal, setInternal] = React.useState(defaultValue);
    const [text, setText] = React.useState("");
    const controlled = value !== undefined;
    const labels = controlled ? value : internal;
    const own = React.useRef<HTMLInputElement | null>(null);

    const change = (next: string[]) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    };

    /* Devuelve si hay que vaciar el campo. Una repetida también lo vacía aunque
       no añada nada: la etiqueta ya está puesta, así que dejar el texto escrito
       haría parecer que la tecla no hizo nada. */
    const add = (raw: string) => {
      const clean = raw.trim();
      if (!clean) return false;
      if (labels.includes(clean)) return true;
      if (labels.length >= max) return false;
      change([...labels, clean]);
      return true;
    };

    const keys = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || separators.includes(event.key)) {
        /* Intro dentro de un formulario lo enviaría, y aquí lo que cierra es la
           etiqueta. Solo se para cuando hay algo que cerrar. */
        if (!text.trim()) return;
        event.preventDefault();
        if (add(text)) setText("");
        return;
      }
      if (event.key === "Backspace" && text === "" && labels.length) {
        change(labels.slice(0, -1));
      }
    };

    /* Pegar una lista entera la reparte, en vez de meterla como una sola
       etiqueta con comas dentro. */
    const paste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      const chunks = event.clipboardData
        .getData("text")
        .split(new RegExp(`[${separators.join("")}\\n]`))
        .map((t) => t.trim())
        .filter(Boolean);
      if (chunks.length < 2) return;
      event.preventDefault();
      const next = [...labels];
      const seen = new Set(next);
      for (const t of chunks) {
        if (next.length >= max || seen.has(t)) continue;
        next.push(t);
        seen.add(t);
      }
      change(next);
      setText("");
    };

    const full = labels.length >= max;

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
              if (e.target === e.currentTarget) own.current?.focus();
            }}
            className={cn(
              "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1 ps-1.5 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background focus-within:outline-none hover:border-border-strong data-disabled:cursor-not-allowed data-disabled:opacity-50",
              INVALID_FIELD,
            )}
          >
            {labels.map((defaultLabel) => (
              <Chip
                key={defaultLabel}
                data-slot="tag-input-tag"
                disabled={disabled}
                onRemove={() => change(labels.filter((e) => e !== defaultLabel))}
              >
                {defaultLabel}
              </Chip>
            ))}

            <input
              {...control}
              ref={(node) => {
                own.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              type="text"
              /* Al llegar al tope el campo se apaga, pero el apagado de la caja
                 lo manda `data-disabled` y no este `disabled`: si no, llenar la
                 lista apagaría también las etiquetas ya puestas. */
              disabled={disabled || full}
              placeholder={labels.length ? undefined : placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={keys}
              onPaste={paste}
              /* Al salir del campo, lo escrito a medias se cierra en etiqueta.
                 Perderlo por cambiar de campo es el fallo más molesto que tiene
                 este control. */
              onBlur={() => {
                if (add(text)) setText("");
              }}
              className={cn(BARE_FIELD, "h-6 w-20")}
            />

            {name
              ? labels.map((defaultLabel) => (
                  <input key={defaultLabel} type="hidden" name={name} value={defaultLabel} />
                ))
              : null}
          </div>
        )}
      </Field>
    );
  },
);
TagInput.displayName = "TagInput";
