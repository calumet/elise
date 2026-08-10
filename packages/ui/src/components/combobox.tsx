/**
 * Raíz del combobox. Sostiene el valor y el estado de apertura, y monta el
 * `Popover`. No pinta nada por su cuenta; lo visible sale de las partes que se
 * componen adentro.
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
 * Para el caso común de un array de opciones existe `ComboboxField`, construido
 * sobre estas mismas partes.
 *
 * @module
 */

import { Check, ChevronsUpDown, X } from "@calumet/elise-icons";
import * as React from "react";

import { Badge } from "./badge";
import { Chip } from "./chip";
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
  /** Valores elegidos. En modo simple es un array de cero o un elemento. */
  valores: string[];
  elegir: (valor: string) => void;
  abierto: boolean;
  multiple: boolean;
};

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

const useCombobox = (parte: string) => {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) throw new Error(`<${parte}> debe usarse dentro de <Combobox>`);
  return ctx;
};

/** Props de {@link Combobox}. */
export type ComboboxProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Deja el panel abierto al elegir. Útil para selección múltiple. */
  closeOnSelect?: boolean;

  children?: React.ReactNode;
};

/**
 * Raíz del combobox. Sostiene el valor y el estado de apertura, y monta el
 * `Popover`. No pinta nada por su cuenta; lo visible sale de las partes que se
 * componen adentro.
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
 * Para el caso común de un array de opciones existe `ComboboxField`, construido
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
}: ComboboxProps): React.JSX.Element {
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

  const ctx = React.useMemo(
    () => ({ valores: value ? [value] : [], elegir, abierto, multiple: false }),
    [value, elegir, abierto],
  );

  return (
    <ComboboxContext.Provider value={ctx}>
      <Popover open={abierto} onOpenChange={cambiarApertura}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  );
}

/** Props de {@link MultiCombobox}. */
export type MultiComboboxProps = Omit<ComboboxProps, "value" | "defaultValue" | "onValueChange"> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

/**
 * Igual que `Combobox` pero acumula varios valores. Elegir un item que ya estaba
 * lo quita, y el panel se queda abierto por defecto para no obligar a reabrirlo
 * en cada elección.
 *
 * Comparte todas las partes con `Combobox`, donde `ComboboxItem` marca como
 * elegido cualquier valor que este en la selección.
 */
function MultiCombobox({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  closeOnSelect = false,
  children,
}: MultiComboboxProps): React.JSX.Element {
  const [valoresInternos, setValoresInternos] = React.useState<string[]>(defaultValue ?? []);
  const [abiertoInterno, setAbiertoInterno] = React.useState(defaultOpen ?? false);

  const valorControlado = valueProp !== undefined;
  const abiertoControlado = openProp !== undefined;
  const valores = valorControlado ? valueProp : valoresInternos;
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
      const siguiente = valores.includes(nuevo)
        ? valores.filter((v) => v !== nuevo)
        : [...valores, nuevo];
      if (!valorControlado) setValoresInternos(siguiente);
      onValueChange?.(siguiente);
      if (closeOnSelect) cambiarApertura(false);
    },
    [valores, valorControlado, onValueChange, closeOnSelect, cambiarApertura],
  );

  const ctx = React.useMemo(
    () => ({ valores, elegir, abierto, multiple: true }),
    [valores, elegir, abierto],
  );

  return (
    <ComboboxContext.Provider value={ctx}>
      <Popover open={abierto} onOpenChange={cambiarApertura}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  );
}

/** Props de {@link ComboboxTrigger}. */
export type ComboboxTriggerProps = React.ComponentProps<"button"> & {
  size?: "sm" | "md" | "lg";

  /** Muestra una X que devuelve el combobox a "sin selección". */
  onClear?: () => void;
};

/* La misma escala que `Button`, para que un combobox y un botón puestos uno al
   lado del otro en una barra de herramientas cuadren de alto. */
const triggerSizes: Record<NonNullable<ComboboxTriggerProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-3 text-base",
  lg: "h-10 px-4 text-base",
};

/** El control que abre la lista, con el valor elegido adentro. */
function ComboboxTrigger({
  className,
  size = "md",
  onClear,
  children,
  disabled,
  ...props
}: ComboboxTriggerProps): React.JSX.Element {
  const { abierto } = useCombobox("ComboboxTrigger");
  const limpiarLabel = useElLabel("ui", "clear", "Limpiar seleccion");
  const mostrarLimpiar = Boolean(onClear) && !disabled;

  return (
    /* El botón de limpiar va como hermano del disparador, porque un <button>
       dentro de otro <button> es HTML inválido. */
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
          {/* El hueco para la X va en el contenido. Con el padding puesto en el
              botón, el chevron se corre hacia adentro y queda debajo. */}
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

/** Props de {@link ComboboxValue}. */
export type ComboboxValueProps = React.ComponentProps<"span"> & {
  placeholder?: string;
};

/**
 * Texto del disparador. Si no recibe `children`, cae en el placeholder.
 *
 * Los items viven dentro del panel y se desmontan al cerrarlo, de modo que el
 * primitivo no puede deducir la etiqueta a partir del valor. Quien compone es
 * dueño de su estado y pasa el texto; `ComboboxField` lo resuelve desde sus
 * `options`.
 */
function ComboboxValue({
  className,
  placeholder,
  children,
  ...props
}: ComboboxValueProps): React.JSX.Element {
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

/** Props de {@link ComboboxContent}. */
export type ComboboxContentProps = React.ComponentProps<typeof PopoverContent> & {
  /** Desactiva el filtrado de cmdk, para listas que ya filtra el servidor. */
  shouldFilter?: boolean;
};

/** El panel con el campo de búsqueda y la lista. */
function ComboboxContent({
  className,
  children,
  align = "start",
  shouldFilter,
  ...props
}: ComboboxContentProps): React.JSX.Element {
  return (
    <PopoverContent
      align={align}
      data-slot="combobox-content"
      /* El panel copia el ancho del disparador vía la variable de Radix. */
      className={cn("w-(--radix-popover-trigger-width) p-0", className)}
      {...props}
    >
      <Command shouldFilter={shouldFilter}>{children}</Command>
    </PopoverContent>
  );
}

/** El campo que filtra las opciones mientras se escribe. */
function ComboboxInput({
  className,
  placeholder,
  ...props
}: React.ComponentProps<typeof CommandInput>): React.JSX.Element {
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

/** La lista de opciones que sobrevivieron al filtro. */
function ComboboxList({
  className,
  ...props
}: React.ComponentProps<typeof CommandList>): React.JSX.Element {
  return <CommandList data-slot="combobox-list" className={className} {...props} />;
}

/** Lo que se muestra cuando el filtro no deja ninguna opción. */
function ComboboxEmpty({
  children,
  ...props
}: React.ComponentProps<typeof CommandEmpty>): React.JSX.Element {
  const porDefecto = useElLabel("ui", "comboboxEmpty", "Sin resultados");
  return (
    <CommandEmpty data-slot="combobox-empty" {...props}>
      {children ?? porDefecto}
    </CommandEmpty>
  );
}

/** Agrupa opciones afines bajo un título. */
function ComboboxGroup(props: React.ComponentProps<typeof CommandGroup>): React.JSX.Element {
  return <CommandGroup data-slot="combobox-group" {...props} />;
}

/** La línea que separa dos grupos. */
function ComboboxSeparator(
  props: React.ComponentProps<typeof CommandSeparator>,
): React.JSX.Element {
  return <CommandSeparator data-slot="combobox-separator" {...props} />;
}

/** Props de {@link ComboboxLoading}. */
export type ComboboxLoadingProps = React.ComponentProps<"div"> & { label?: string };

/** Fila de carga, para listas que se piden al servidor mientras se escribe. */
function ComboboxLoading({ className, label, ...props }: ComboboxLoadingProps): React.JSX.Element {
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

/** Props de {@link ComboboxItem}. */
export type ComboboxItemProps = Omit<
  React.ComponentProps<typeof CommandItem>,
  "onSelect" | "value"
> & {
  value: string;

  /** Términos extra por los que el item también debería encontrarse. */
  keywords?: string[];

  /** Icono al inicio de la fila. Para items que son acciones, no opciones. */
  icon?: React.ReactNode;

  onSelect?: (value: string) => void;
};

/**
 * Opción de la lista.
 *
 * El check va al final de la fila y solo existe cuando el item está elegido, en
 * vez de reservarle una columna al inicio. Así todas las filas (opciones,
 * acciones, elegidas o no) arrancan en la misma x. Con el check al inicio,
 * cualquier fila sin él queda corrida el ancho del icono.
 */
function ComboboxItem({
  className,
  value,
  keywords,
  icon,
  onSelect,
  children,
  ...props
}: ComboboxItemProps): React.JSX.Element {
  const { valores, elegir } = useCombobox("ComboboxItem");
  const elegido = valores.includes(value);

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
 * Envoltorio para el caso común
 * ------------------------------------------------------------------ */

/** Una opción. Su `value` es contra lo que corre el filtro. */
export type ComboboxOption = {
  value: string;
  label: string;

  /** Segunda línea dentro de la opción. */
  description?: string;

  disabled?: boolean;

  /** Términos extra por los que la opción también debería encontrarse. */
  keywords?: string[];

  /** Agrupa opciones bajo un encabezado. */
  group?: string;
};

/** Props de {@link ComboboxField}. */
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
 * Combobox para el caso común de un array de opciones. Está construido sobre
 * las partes de `Combobox`, así que no puede hacer nada que el primitivo no
 * permita.
 *
 * Para carga asíncrona, secciones a medida o acciones dentro de la lista, compone
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
}: ComboboxFieldProps): React.JSX.Element {
  const [interno, setInterno] = React.useState(defaultValue ?? "");
  const controlado = valueProp !== undefined;
  const value = controlado ? valueProp : interno;

  const cambiar = (nuevo: string) => {
    if (!controlado) setInterno(nuevo);
    onValueChange?.(nuevo);
  };

  const seleccionada = options.find((o) => o.value === value);

  /* Preserva el orden de aparición de los grupos en `options`. */
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

/** Props de {@link MultiComboboxField}. */
export type MultiComboboxFieldProps = Omit<
  ComboboxFieldProps,
  "value" | "defaultValue" | "onValueChange" | "clearable"
> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;

  /**
   * Tope duro de chips visibles. Sin él, la cantidad la decide el ancho
   * disponible.
   */
  maxChips?: number;
};

/**
 * Cuántos de los anchos dados entran en `disponible`, dejando sitio para el
 * contador cuando de verdad sobra alguno.
 *
 * Los anchos se miden sobre una fila aparte que siempre lleva todos los chips,
 * de modo que el cálculo no dependa de su propio resultado.
 */
const cuantosCaben = (anchos: number[], anchoContador: number, disponible: number, gap: number) => {
  let usado = 0;
  for (let i = 0; i < anchos.length; i++) {
    const sumaChip = anchos[i] + (i > 0 ? gap : 0);
    const sobranDespues = anchos.length - i - 1;
    const reserva = sobranDespues > 0 ? gap + anchoContador : 0;
    if (usado + sumaChip + reserva > disponible) return i;
    usado += sumaChip;
  }
  return anchos.length;
};

/**
 * Multiselección lista para usar. Muestra lo elegido como chips removibles
 * dentro del disparador y resume con "+N" los que no entran en el ancho.
 */
function MultiComboboxField({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
  size = "md",
  name,
  maxChips,
  className,
  contentClassName,
  align = "start",
  ...props
}: MultiComboboxFieldProps): React.JSX.Element {
  const [internos, setInternos] = React.useState<string[]>(defaultValue ?? []);
  const controlado = valueProp !== undefined;
  const valores = controlado ? valueProp : internos;

  const cambiar = (siguiente: string[]) => {
    if (!controlado) setInternos(siguiente);
    onValueChange?.(siguiente);
  };

  const elegidas = valores
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is ComboboxOption => Boolean(o));

  const filaRef = React.useRef<HTMLSpanElement>(null);
  const medidorRef = React.useRef<HTMLSpanElement>(null);
  const [caben, setCaben] = React.useState(elegidas.length);

  const claves = elegidas.map((o) => o.value).join("|");
  React.useLayoutEffect(() => {
    const fila = filaRef.current;
    const medidor = medidorRef.current;
    if (!fila || !medidor) return;

    const medir = () => {
      const hijos = [...medidor.children] as HTMLElement[];
      if (hijos.length === 0) return;
      const anchoContador = hijos[hijos.length - 1].getBoundingClientRect().width;
      const anchos = hijos.slice(0, -1).map((c) => c.getBoundingClientRect().width);
      const gap = parseFloat(getComputedStyle(fila).columnGap) || 4;
      setCaben(Math.max(1, cuantosCaben(anchos, anchoContador, fila.clientWidth, gap)));
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(fila);
    return () => ro.disconnect();
  }, [claves]);

  const tope = maxChips === undefined ? caben : Math.min(caben, maxChips);
  const visibles = elegidas.slice(0, tope);
  const resto = elegidas.length - visibles.length;

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
    <MultiCombobox value={valores} onValueChange={cambiar}>
      <ComboboxTrigger
        size={size}
        disabled={disabled}
        className={cn(elegidas.length > 0 && "h-auto min-h-10 py-1.5", className)}
        onClear={elegidas.length > 0 && !disabled ? () => cambiar([]) : undefined}
        {...props}
      >
        {elegidas.length === 0 ? (
          <ComboboxValue placeholder={placeholder} />
        ) : (
          <span ref={filaRef} className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
            {/* `removeAs="span"` porque el disparador ya es un `<button>` y
                anidar otro sería HTML inválido. */}
            {visibles.map((o) => (
              <Chip
                key={o.value}
                accessibilityLabel={o.label}
                removeAs="span"
                onRemove={() => cambiar(valores.filter((v) => v !== o.value))}
              >
                {o.label}
              </Chip>
            ))}
            {resto > 0 ? (
              <Badge tone="neutral" size="sm" variant="outline" className="shrink-0">
                +{resto}
              </Badge>
            ) : null}

            {/* Fila de medición: lleva siempre todas las fichas y el contador, a
                su ancho natural y fuera del flujo. De aquí salen los anchos que
                deciden cuántas entran. */}
            <span
              ref={medidorRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 flex w-max items-center gap-1 opacity-0"
            >
              {elegidas.map((o) => (
                <Chip key={o.value} removeAs="presentation" onRemove={() => {}}>
                  {o.label}
                </Chip>
              ))}
              <Badge tone="neutral" size="sm" variant="outline">
                +{elegidas.length}
              </Badge>
            </span>
          </span>
        )}
      </ComboboxTrigger>

      {name ? valores.map((v) => <input key={v} type="hidden" name={name} value={v} />) : null}

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
    </MultiCombobox>
  );
}

export {
  Combobox,
  MultiCombobox,
  MultiComboboxField,
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
