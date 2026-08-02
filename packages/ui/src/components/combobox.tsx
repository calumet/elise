import { Check, ChevronsUpDown, X } from "@calumet/elise-icons";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

export type ComboboxOption = {
  value: string;
  label: string;

  /** Segunda linea dentro de la opcion. */
  description?: string;

  disabled?: boolean;

  /** Terminos extra por los que la opcion tambien deberia encontrarse. */
  keywords?: string[];

  /** Agrupa opciones bajo un encabezado. */
  group?: string;
};

export type ComboboxProps = {
  options: ComboboxOption[];

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  /** Texto del disparador cuando no hay seleccion. */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;

  disabled?: boolean;

  /** Muestra una X para volver a "sin seleccion". */
  clearable?: boolean;

  size?: "sm" | "md" | "lg";

  /** Emite un input oculto, para formularios que se envian por HTML. */
  name?: string;

  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
} & Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "name">;

const sizeClasses: Record<NonNullable<ComboboxProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-3 text-base",
  lg: "h-11 px-4 text-base",
};

/**
 * Select con busqueda. Combina `Popover` para el posicionamiento y `Command`
 * (cmdk) para el filtrado, la navegacion por teclado y el patron ARIA de
 * combobox — `role="combobox"`, `aria-expanded`, `aria-controls` y
 * `aria-activedescendant` los aporta cmdk, no se replican aca.
 *
 * Para elegir varias opciones a la vez, ver `MultiCombobox`.
 */
function Combobox({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  clearable = false,
  size = "md",
  name,
  className,
  contentClassName,
  align = "start",
  ...props
}: ComboboxProps) {
  const [abierto, setAbierto] = React.useState(false);
  const [interno, setInterno] = React.useState(defaultValue ?? "");
  const controlado = valueProp !== undefined;
  const value = controlado ? valueProp : interno;

  const phSelect = useElLabel("ui", "comboboxPlaceholder", "Seleccionar…");
  const phSearch = useElLabel("ui", "comboboxSearch", "Buscar…");
  const sinResultados = useElLabel("ui", "comboboxEmpty", "Sin resultados");
  const limpiarLabel = useElLabel("ui", "clear", "Limpiar seleccion");

  const seleccionada = options.find((o) => o.value === value);
  const mostrarLimpiar = clearable && Boolean(seleccionada) && !disabled;

  const elegir = (nuevo: string) => {
    if (!controlado) setInterno(nuevo);
    onValueChange?.(nuevo);
    setAbierto(false);
  };

  /* Preserva el orden de aparicion de los grupos en `options`. */
  const grupos = React.useMemo(() => {
    const mapa = new Map<string, ComboboxOption[]>();
    for (const o of options) {
      const clave = o.group ?? "";
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave)!.push(o);
    }
    return [...mapa.entries()];
  }, [options]);

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      {/* El boton de limpiar es hermano del disparador, no hijo: un <button>
          dentro de otro <button> es HTML invalido. Se superpone en absoluto y
          el disparador reserva el espacio con padding. */}
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            data-slot="combobox-trigger"
            data-placeholder={seleccionada ? undefined : ""}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background text-foreground transition-[border-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground",
              sizeClasses[size],
              className,
            )}
            {...props}
          >
            {/* El hueco para la X va en el texto, no en el boton: con padding en
                el boton el chevron se corre hacia adentro y queda debajo. */}
            <span className={cn("min-w-0 flex-1 truncate text-left", mostrarLimpiar && "pr-6")}>
              {seleccionada?.label ?? placeholder ?? phSelect}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        {mostrarLimpiar ? (
          <button
            type="button"
            aria-label={limpiarLabel}
            onClick={() => elegir("")}
            className="absolute top-1/2 right-8 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      <PopoverContent
        align={align}
        /* El panel copia el ancho del disparador via la variable de Radix. */
        className={cn("w-(--radix-popover-trigger-width) p-0", contentClassName)}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? phSearch} wrapperClassName="h-10" />
          <CommandList>
            <CommandEmpty>{emptyMessage ?? sinResultados}</CommandEmpty>
            {grupos.map(([grupo, items]) => (
              <CommandGroup key={grupo || "sin-grupo"} heading={grupo || undefined}>
                {items.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.value}
                    keywords={[o.label, ...(o.keywords ?? [])]}
                    disabled={o.disabled}
                    onSelect={() => elegir(o.value)}
                  >
                    <Check
                      className={cn("size-4 shrink-0", o.value === value ? "" : "invisible")}
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{o.label}</span>
                      {o.description ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {o.description}
                        </span>
                      ) : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox };
