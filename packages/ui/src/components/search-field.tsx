/**
 * Campo de búsqueda.
 *
 * Lupa al principio y aspa al final en cuanto hay algo escrito. El aspa está
 * porque vaciar un buscador es la acción más frecuente que hay sobre él, y
 * seleccionar todo y borrar cuesta dos gestos donde este cuesta uno.
 *
 * El `<input>` es de tipo `search`, así que Escape lo vacía y el navegador puede
 * ofrecer las búsquedas anteriores. Lo que no hereda es el aspa nativa de
 * WebKit, que se quita: aparecía además de esta y en otro sitio.
 *
 * @module
 */

import { Search, X } from "@calumet/elise-icons";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

import { Field } from "./field";
import { FIELD_BOX_COMPOSITE, BARE_FIELD, INVALID_FIELD } from "./input";

/** Props de {@link SearchField}. */
export type SearchFieldProps = {
  label: React.ReactNode;

  /**
   * Esconde el rótulo sin quitarlo del árbol de accesibilidad. Hace falta a
   * menudo: un buscador dentro de una barra de herramientas se explica solo con
   * la lupa, pero sin rótulo un lector de pantalla no sabría qué se busca.
   */
  labelHidden?: boolean;

  /** Texto de ayuda bajo el campo. Sigue visible aunque haya error. */
  description?: React.ReactNode;

  /** Mensaje de error. Su presencia marca el campo como inválido. */
  error?: React.ReactNode;

  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  minLength?: number;

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/**
 * Campo de búsqueda.
 *
 * Lupa al principio y aspa al final en cuanto hay algo escrito. El aspa está
 * porque vaciar un buscador es la acción más frecuente que hay sobre él, y
 * seleccionar todo y borrar cuesta dos gestos donde este cuesta uno.
 *
 * El `<input>` es de tipo `search`, así que Escape lo vacía y el navegador puede
 * ofrecer las búsquedas anteriores. Lo que no hereda es el aspa nativa de
 * WebKit, que se quita: aparecía además de esta y en otro sitio.
 */
export const SearchField: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SearchFieldProps> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      label,
      labelHidden,
      description,
      error,
      required,
      readOnly,
      disabled,
      name,
      id,
      placeholder,
      className,
      maxLength,
      minLength,
      value,
      defaultValue = "",
      onValueChange,
    },
    ref,
  ) => {
    const clearLabel = useElLabel("ui", "clearSearch", "Vaciar la búsqueda");

    const [internal, setInternal] = React.useState(defaultValue);
    const controlled = value !== undefined;
    const text = controlled ? value : internal;
    const own = React.useRef<HTMLInputElement | null>(null);

    const type = (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    };

    const clear = () => {
      type("");
      /* El foco vuelve al campo: quien vacía casi siempre va a escribir otra
         cosa, y dejarlo en un botón que acaba de desaparecer lo manda al
         principio del documento. */
      own.current?.focus();
    };

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
            className={cn(FIELD_BOX_COMPOSITE, INVALID_FIELD)}
            aria-invalid={control["aria-invalid"]}
          >
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />

            <input
              {...control}
              ref={(node) => {
                own.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              type="search"
              name={name}
              placeholder={placeholder}
              readOnly={readOnly}
              disabled={disabled}
              maxLength={maxLength}
              minLength={minLength}
              value={text}
              onChange={(e) => type(e.target.value)}
              className={cn(
                BARE_FIELD,
                "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
              )}
            />

            {text && !disabled && !readOnly ? (
              <button
                type="button"
                aria-label={clearLabel}
                onClick={clear}
                className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        )}
      </Field>
    );
  },
);
SearchField.displayName = "SearchField";
