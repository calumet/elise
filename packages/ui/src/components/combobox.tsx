import { Check, ChevronsUpDown, X } from "@calumet/elise-icons";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Spinner } from "./spinner";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * Primitivo componible
 * ------------------------------------------------------------------ */

type ComboboxContextValue = {
  value: string;
  elegir: (valor: string) => void;
  abierto: boolean;
};

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

const useCombobox = (parte: string) => {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) throw new Error(`<${parte}> debe usarse dentro de <Combobox>`);
  return ctx;
};

export type ComboboxProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Deja el panel abierto al elegir. Util para seleccion multiple. */
  closeOnSelect?: boolean;

  children?: React.ReactNode;
};

/**
 * Raiz del combobox. Sostiene el valor y el estado de apertura, y monta el
 * `Popover`. No pinta nada por su cuenta: las partes se componen adentro.
 *
 * ```tsx
 * <Combobox value={v} onValueChange={setV}>
 *   <ComboboxTrigger>
 *     <ComboboxValue placeholder="Elegir…">{etiqueta}</ComboboxValue>
 *   </ComboboxTrigger>
 *   <ComboboxContent>
 *     <ComboboxInput />
 *     <ComboboxList>
 *       <ComboboxEmpty>Sin resultados</ComboboxEmpty>
 *       <ComboboxItem value="co">Colombia</ComboboxItem>
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 * ```
 *
 * Para el caso comun —un array de opciones— existe `ComboboxField`, construido
 * sobre estas mismas partes.
 */
function Combobox({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  closeOnSelect = true,
  children,
}: ComboboxProps) {
  const [valorInterno, setValorInterno] = React.useState(defaultValue ?? "");
  const [abiertoInterno, setAbiertoInterno] = React.useState(defaultOpen ?? false);

  const valorControlado = valueProp !== undefined;
  const abiertoControlado = openProp !== undefined;
  const value = valorControlado ? valueProp : valorInterno;
  const abierto = abiertoControlado ? openProp : abiertoInterno;

  const cambiarApertura = React.useCallback(
    (siguiente: boolean) => {
      if (!abiertoControlado) setAbiertoInterno(siguiente);
      onOpenChange?.(siguiente);
    },
    [abiertoControlado, onOpenChange],
  );

  const elegir = React.useCallback(
    (nuevo: string) => {
      if (!valorControlado) setValorInterno(nuevo);
      onValueChange?.(nuevo);
      if (closeOnSelect) cambiarApertura(false);
    },
    [valorControlado, onValueChange, closeOnSelect, cambiarApertura],
  );

  const ctx = React.useMemo(() => ({ value, elegir, abierto }), [value, elegir, abierto]);

  return (
    <ComboboxContext.Provider value={ctx}>
      <Popover open={abierto} onOpenChange={cambiarApertura}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  );
}

export type ComboboxTriggerProps = React.ComponentProps<"button"> & {
  size?: "sm" | "md" | "lg";

  /** Muestra una X que devuelve el combobox a "sin seleccion". */
  onClear?: () => void;
};

const triggerSizes: Record<NonNullable<ComboboxTriggerProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-3 text-base",
  lg: "h-11 px-4 text-base",
};

function ComboboxTrigger({
  className,
  size = "md",
  onClear,
  children,
  disabled,
  ...props
}: ComboboxTriggerProps) {
  const { abierto } = useCombobox("ComboboxTrigger");
  const limpiarLabel = useElLabel("ui", "clear", "Limpiar seleccion");
  const mostrarLimpiar = Boolean(onClear) && !disabled;

  return (
    /* El boton de limpiar es hermano del disparador, no hijo: un <button>
       dentro de otro <button> es HTML invalido. */
    <div className="relative w-full">
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-slot="combobox-trigger"
          data-state={abierto ? "open" : "closed"}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background text-foreground transition-[border-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            triggerSizes[size],
            className,
          )}
          {...props}
        >
          {/* El hueco para la X va en el contenido, no en el boton: con padding
              en el boton el chevron se corre hacia adentro y queda debajo. */}
          <span className={cn("min-w-0 flex-1 truncate text-left", mostrarLimpiar && "pr-6")}>
            {children}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      {mostrarLimpiar ? (
        <button
          type="button"
          aria-label={limpiarLabel}
          onClick={onClear}
          className="absolute top-1/2 right-8 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export type ComboboxValueProps = React.ComponentProps<"span"> & {
  placeholder?: string;
};

/**
 * Texto del disparador. Si no recibe `children`, cae en el placeholder.
 *
 * El primitivo no adivina la etiqueta a partir del valor: los items viven
 * dentro del panel y se desmontan al cerrarlo. Quien compone es dueño de su
 * estado y pasa el texto; `ComboboxField` lo resuelve desde sus `options`.
 */
function ComboboxValue({ className, placeholder, children, ...props }: ComboboxValueProps) {
  const phDefecto = useElLabel("ui", "comboboxPlaceholder", "Seleccionar…");
  const vacio = children === undefined || children === null || children === "";
  return (
    <span
      data-slot="combobox-value"
      data-placeholder={vacio ? "" : undefined}
      className={cn("truncate data-placeholder:text-muted-foreground", className)}
      {...props}
    >
      {vacio ? (placeholder ?? phDefecto) : children}
    </span>
  );
}

export type ComboboxContentProps = React.ComponentProps<typeof PopoverContent> & {
  /** Desactiva el filtrado de cmdk, para listas que ya filtra el servidor. */
  shouldFilter?: boolean;
};

function ComboboxContent({
  className,
  children,
  align = "start",
  shouldFilter,
  ...props
}: ComboboxContentProps) {
  return (
    <PopoverContent
      align={align}
      data-slot="combobox-content"
      /* El panel copia el ancho del disparador via la variable de Radix. */
      className={cn("w-(--radix-popover-trigger-width) p-0", className)}
      {...props}
    >
      <Command shouldFilter={shouldFilter}>{children}</Command>
    </PopoverContent>
  );
}

function ComboboxInput({
  className,
  placeholder,
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  const phDefecto = useElLabel("ui", "comboboxSearch", "Buscar…");
  return (
    <CommandInput
      data-slot="combobox-input"
      placeholder={placeholder ?? phDefecto}
      wrapperClassName="h-10"
      className={className}
      {...props}
    />
  );
}

function ComboboxList({ className, ...props }: React.ComponentProps<typeof CommandList>) {
  return <CommandList data-slot="combobox-list" className={className} {...props} />;
}

function ComboboxEmpty({ children, ...props }: React.ComponentProps<typeof CommandEmpty>) {
  const porDefecto = useElLabel("ui", "comboboxEmpty", "Sin resultados");
  return (
    <CommandEmpty data-slot="combobox-empty" {...props}>
      {children ?? porDefecto}
    </CommandEmpty>
  );
}

function ComboboxGroup(props: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="combobox-group" {...props} />;
}

function ComboboxSeparator(props: React.ComponentProps<typeof CommandSeparator>) {
  return <CommandSeparator data-slot="combobox-separator" {...props} />;
}

export type ComboboxLoadingProps = React.ComponentProps<"div"> & { label?: string };

/** Fila de carga, para listas que se piden al servidor mientras se escribe. */
function ComboboxLoading({ className, label, ...props }: ComboboxLoadingProps) {
  const porDefecto = useElLabel("ui", "loading", "Cargando");
  return (
    <div
      data-slot="combobox-loading"
      className={cn(
        "flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Spinner size="sm" />
      {label ?? porDefecto}
    </div>
  );
}

export type ComboboxItemProps = Omit<
  React.ComponentProps<typeof CommandItem>,
  "onSelect" | "value"
> & {
  value: string;

  /** Terminos extra por los que el item tambien deberia encontrarse. */
  keywords?: string[];

  /** Icono al inicio de la fila. Para items que son acciones, no opciones. */
  icon?: React.ReactNode;

  onSelect?: (value: string) => void;
};

/**
 * Opcion de la lista.
 *
 * El check va al final de la fila y solo existe cuando el item esta elegido, en
 * vez de reservarle una columna al inicio. Asi todas las filas —opciones,
 * acciones, elegidas o no— arrancan en la misma x, que es como lo resuelve
 * Polaris en su `TextOption`. Con el check al inicio, cualquier fila sin el
 * queda corrida el ancho del icono.
 */
function ComboboxItem({
  className,
  value,
  keywords,
  icon,
  onSelect,
  children,
  ...props
}: ComboboxItemProps) {
  const { value: actual, elegir } = useCombobox("ComboboxItem");
  const elegido = actual === value;

  return (
    <CommandItem
      data-slot="combobox-item"
      value={value}
      keywords={keywords}
      onSelect={() => {
        elegir(value);
        onSelect?.(value);
      }}
      /* El fondo de cmdk (`data-selected`) marca el resaltado del teclado, que
         se mueve con las flechas. El *elegido* se distingue por peso, para que
         ambos estados se lean a la vez. */
      className={cn("justify-between", elegido && "font-semibold", className)}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {icon}
        {children}
      </span>
      {elegido ? <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
    </CommandItem>
  );
}

/* ------------------------------------------------------------------ *
 * Envoltorio para el caso comun
 * ------------------------------------------------------------------ */

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

export type ComboboxFieldProps = {
  options: ComboboxOption[];

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;

  disabled?: boolean;
  clearable?: boolean;
  size?: ComboboxTriggerProps["size"];

  /** Emite un input oculto, para formularios que se envian por HTML. */
  name?: string;

  className?: string;
  contentClassName?: string;
  align?: ComboboxContentProps["align"];
} & Omit<React.ComponentProps<"button">, "value" | "defaultValue" | "onChange" | "name">;

/**
 * Combobox listo para el caso comun: un array de opciones. Esta construido
 * sobre las partes de `Combobox`, asi que no puede hacer nada que el primitivo
 * no permita.
 *
 * Para carga asincrona, secciones a medida o acciones dentro de la lista, compone
 * las partes directamente.
 */
function ComboboxField({
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
}: ComboboxFieldProps) {
  const [interno, setInterno] = React.useState(defaultValue ?? "");
  const controlado = valueProp !== undefined;
  const value = controlado ? valueProp : interno;

  const cambiar = (nuevo: string) => {
    if (!controlado) setInterno(nuevo);
    onValueChange?.(nuevo);
  };

  const seleccionada = options.find((o) => o.value === value);

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
    <Combobox value={value} onValueChange={cambiar}>
      <ComboboxTrigger
        size={size}
        disabled={disabled}
        className={className}
        onClear={clearable && seleccionada ? () => cambiar("") : undefined}
        {...props}
      >
        <ComboboxValue placeholder={placeholder}>{seleccionada?.label}</ComboboxValue>
      </ComboboxTrigger>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      <ComboboxContent align={align} className={contentClassName}>
        <ComboboxInput placeholder={searchPlaceholder} />
        <ComboboxList>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          {grupos.map(([grupo, items]) => (
            <ComboboxGroup key={grupo || "sin-grupo"} heading={grupo || undefined}>
              {items.map((o) => (
                <ComboboxItem
                  key={o.value}
                  value={o.value}
                  keywords={[o.label, ...(o.keywords ?? [])]}
                  disabled={o.disabled}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{o.label}</span>
                    {o.description ? (
                      <span className="truncate text-xs font-normal text-muted-foreground">
                        {o.description}
                      </span>
                    ) : null}
                  </span>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export {
  Combobox,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
  ComboboxLoading,
  ComboboxField,
};
