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

import { Field } from "./field";
import { CAJA_CAMPO_COMPUESTA, CAMPO_DESNUDO, CAMPO_INVALIDO } from "./input";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

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
    const etiquetaVaciar = useElLabel("ui", "clearSearch", "Vaciar la búsqueda");

    const [interno, setInterno] = React.useState(defaultValue);
    const controlado = value !== undefined;
    const texto = controlado ? value : interno;
    const propio = React.useRef<HTMLInputElement | null>(null);

    const escribir = (siguiente: string) => {
      if (!controlado) setInterno(siguiente);
      onValueChange?.(siguiente);
    };

    const vaciar = () => {
      escribir("");
      /* El foco vuelve al campo: quien vacía casi siempre va a escribir otra
         cosa, y dejarlo en un botón que acaba de desaparecer lo manda al
         principio del documento. */
      propio.current?.focus();
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
            className={cn(CAJA_CAMPO_COMPUESTA, CAMPO_INVALIDO)}
            aria-invalid={control["aria-invalid"]}
          >
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />

            <input
              {...control}
              ref={(nodo) => {
                propio.current = nodo;
                if (typeof ref === "function") ref(nodo);
                else if (ref) ref.current = nodo;
              }}
              type="search"
              name={name}
              placeholder={placeholder}
              readOnly={readOnly}
              disabled={disabled}
              maxLength={maxLength}
              minLength={minLength}
              value={texto}
              onChange={(e) => escribir(e.target.value)}
              className={cn(
                CAMPO_DESNUDO,
                "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
              )}
            />

            {texto && !disabled && !readOnly ? (
              <button
                type="button"
                aria-label={etiquetaVaciar}
                onClick={vaciar}
                className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
