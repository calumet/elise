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

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

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
import { FIELD_SIZES, type FieldSize } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Spinner } from "./spinner";

/* ------------------------------------------------------------------ *
 * Primitivo componible
 * ------------------------------------------------------------------ */

type ComboboxContextValue = {
  /** Valores elegidos. En modo simple es un array de cero o un elemento. */
  values: string[];
  select: (value: string) => void;
  open: boolean;
  multiple: boolean;
};

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

const useCombobox = (part: string) => {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx) throw new Error(`<${part}> debe usarse dentro de <Combobox>`);
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

  /**
   * Le da al panel su propio bloqueo de scroll. Hace falta dentro de un
   * `Dialog`: el bloqueo del diálogo cancela la rueda sobre la lista, que
   * entonces solo se recorre con las flechas o arrastrando la barra.
   */
  modal?: boolean;

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
  modal,
  children,
}: ComboboxProps): React.JSX.Element {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);

  const controlledValue = valueProp !== undefined;
  const controlledOpen = openProp !== undefined;
  const value = controlledValue ? valueProp : internalValue;
  const open = controlledOpen ? openProp : internalOpen;

  const changeOpening = React.useCallback(
    (next: boolean) => {
      if (!controlledOpen) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const select = React.useCallback(
    (newValue: string) => {
      if (!controlledValue) setInternalValue(newValue);
      onValueChange?.(newValue);
      if (closeOnSelect) changeOpening(false);
    },
    [controlledValue, onValueChange, closeOnSelect, changeOpening],
  );

  const ctx = React.useMemo(
    () => ({ values: value ? [value] : [], select, open, multiple: false }),
    [value, select, open],
  );

  return (
    <ComboboxContext.Provider value={ctx}>
      <Popover open={open} onOpenChange={changeOpening} modal={modal}>
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
  modal,
  children,
}: MultiComboboxProps): React.JSX.Element {
  const [internalValues, setInternalValues] = React.useState<string[]>(defaultValue ?? []);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);

  const controlledValue = valueProp !== undefined;
  const controlledOpen = openProp !== undefined;
  const values = controlledValue ? valueProp : internalValues;
  const open = controlledOpen ? openProp : internalOpen;

  const changeOpening = React.useCallback(
    (next: boolean) => {
      if (!controlledOpen) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const select = React.useCallback(
    (newValue: string) => {
      const next = values.includes(newValue)
        ? values.filter((v) => v !== newValue)
        : [...values, newValue];
      if (!controlledValue) setInternalValues(next);
      onValueChange?.(next);
      if (closeOnSelect) changeOpening(false);
    },
    [values, controlledValue, onValueChange, closeOnSelect, changeOpening],
  );

  const ctx = React.useMemo(
    () => ({ values, select, open, multiple: true }),
    [values, select, open],
  );

  return (
    <ComboboxContext.Provider value={ctx}>
      <Popover open={open} onOpenChange={changeOpening} modal={modal}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  );
}

/** Props de {@link ComboboxTrigger}. */
export type ComboboxTriggerProps = React.ComponentProps<"button"> & {
  /** Por defecto `md`, 36px de alto. */
  size?: FieldSize;

  /** Muestra una X que devuelve el combobox a "sin selección". */
  onClear?: () => void;
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
  const { open } = useCombobox("ComboboxTrigger");
  const clearLabel = useElLabel("ui", "clear", "Limpiar seleccion");
  const showClear = Boolean(onClear) && !disabled;

  return (
    /* El botón de limpiar va como hermano del disparador, porque un <button>
       dentro de otro <button> es HTML inválido. */
    <div className="relative w-full">
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-slot="combobox-trigger"
          data-state={open ? "open" : "closed"}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background text-foreground transition-[border-color,box-shadow] duration-(--duration-fast) ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            FIELD_SIZES[size],
            className,
          )}
          {...props}
        >
          {/* El hueco para la X va en el contenido. Con el padding puesto en el
              botón, el chevron se corre hacia adentro y queda debajo. */}
          <span className={cn("min-w-0 flex-1 truncate text-left", showClear && "pr-6")}>
            {children}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      {showClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={onClear}
          className="absolute top-1/2 right-8 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-[background-color,color] duration-(--duration-fast) ease-out before:absolute before:-inset-0.5 before:content-[''] hover:bg-state-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
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
  const defaultPlaceholder = useElLabel("ui", "comboboxPlaceholder", "Seleccionar…");
  const empty = children === undefined || children === null || children === "";
  return (
    <span
      data-slot="combobox-value"
      data-placeholder={empty ? "" : undefined}
      className={cn("truncate data-placeholder:text-muted-foreground", className)}
      {...props}
    >
      {empty ? (placeholder ?? defaultPlaceholder) : children}
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
  const defaultPlaceholder = useElLabel("ui", "comboboxSearch", "Buscar…");
  return (
    <CommandInput
      data-slot="combobox-input"
      placeholder={placeholder ?? defaultPlaceholder}
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
  const byDefault = useElLabel("ui", "comboboxEmpty", "Sin resultados");
  return (
    <CommandEmpty data-slot="combobox-empty" {...props}>
      {children ?? byDefault}
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
  const byDefault = useElLabel("ui", "loading", "Cargando");
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
      {label ?? byDefault}
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

  /**
   * A qué profundidad cuelga la opción, para una lista que aplana un árbol. La
   * raíz es 0. Sangra 16px por nivel, la misma medida que `Tree`.
   */
  level?: number;

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
  level = 0,
  onSelect,
  children,
  ...props
}: ComboboxItemProps): React.JSX.Element {
  const { values, select } = useCombobox("ComboboxItem");
  const selected = values.includes(value);

  return (
    <CommandItem
      data-slot="combobox-item"
      /* La profundidad sale al DOM porque desde afuera la fila no la delata:
         para la auditoría visual, dos filas que arrancan en distinta x son un
         defecto salvo que la sangría esté declarada. */
      data-level={level > 0 ? level : undefined}
      value={value}
      keywords={keywords}
      onSelect={() => {
        select(value);
        onSelect?.(value);
      }}
      /* El fondo de cmdk (`data-selected`) marca el resaltado del teclado, que
         se mueve con las flechas. El *elegido* se distingue por peso, para que
         ambos estados se lean a la vez. */
      className={cn("justify-between", selected && "font-semibold", className)}
      {...props}
    >
      {/* La sangría va en el contenido y no en la fila: sobre la fila
          estrecharía el resaltado, de modo que cuanto más hondo cuelga una
          opción menos se vería al recorrerla con las flechas. */}
      <span
        className="flex min-w-0 flex-1 items-center gap-2"
        style={level > 0 ? { paddingInlineStart: `${level * 16}px` } : undefined}
      >
        {icon}
        {children}
      </span>
      {selected ? (
        <Check className="size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
      ) : null}
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

  /**
   * Agrupa opciones bajo un encabezado. Es un solo escalón, así que no sirve
   * para un árbol: para eso está `level`.
   */
  group?: string;

  /**
   * A qué profundidad cuelga la opción, para una lista que aplana un árbol. La
   * raíz es 0.
   */
  level?: number;
};

/* La lista es la misma en `ComboboxField` y en `MultiComboboxField`. */
function OptionList({
  align,
  contentClassName,
  searchPlaceholder,
  emptyMessage,
  groups,
}: {
  align?: ComboboxContentProps["align"];
  contentClassName?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  groups: Array<[string, ComboboxOption[]]>;
}): React.JSX.Element {
  return (
    <ComboboxContent align={align} className={contentClassName}>
      <ComboboxInput placeholder={searchPlaceholder} />
      <ComboboxList>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        {groups.map(([group, items]) => (
          <ComboboxGroup key={group || "sin-grupo"} heading={group || undefined}>
            {items.map((o) => (
              <ComboboxItem
                key={o.value}
                value={o.value}
                keywords={[o.label, ...(o.keywords ?? [])]}
                disabled={o.disabled}
                level={o.level}
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
  );
}

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

  /** Le da al panel su propio bloqueo de scroll. Hace falta dentro de un `Dialog`. */
  modal?: boolean;

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
  modal,
  name,
  className,
  contentClassName,
  align = "start",
  ...props
}: ComboboxFieldProps): React.JSX.Element {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internal;

  const change = (newValue: string) => {
    if (!controlled) setInternal(newValue);
    onValueChange?.(newValue);
  };

  const selected = options.find((o) => o.value === value);

  /* Preserva el orden de aparición de los grupos en `options`. */
  const groups = React.useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    for (const o of options) {
      const groupKey = o.group ?? "";
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(o);
    }
    return [...map.entries()];
  }, [options]);

  return (
    <Combobox value={value} onValueChange={change} modal={modal}>
      <ComboboxTrigger
        size={size}
        disabled={disabled}
        className={className}
        onClear={clearable && selected ? () => change("") : undefined}
        {...props}
      >
        <ComboboxValue placeholder={placeholder}>{selected?.label}</ComboboxValue>
      </ComboboxTrigger>

      {name ? <input type="hidden" name={name} value={value} /> : null}

      <OptionList
        align={align}
        contentClassName={contentClassName}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        groups={groups}
      />
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
const howManyFit = (widths: number[], counterWidth: number, available: number, gap: number) => {
  let used = 0;
  for (let i = 0; i < widths.length; i++) {
    const overflowChip = widths[i] + (i > 0 ? gap : 0);
    const extraAfter = widths.length - i - 1;
    const reserve = extraAfter > 0 ? gap + counterWidth : 0;
    if (used + overflowChip + reserve > available) return i;
    used += overflowChip;
  }
  return widths.length;
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
  modal,
  name,
  maxChips,
  className,
  contentClassName,
  align = "start",
  ...props
}: MultiComboboxFieldProps): React.JSX.Element {
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
  const controlled = valueProp !== undefined;
  const values = controlled ? valueProp : internal;

  const change = (next: string[]) => {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  const selected = values
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is ComboboxOption => Boolean(o));

  const rowRef = React.useRef<HTMLSpanElement>(null);
  const meterRef = React.useRef<HTMLSpanElement>(null);
  const [fit, setFit] = React.useState(selected.length);

  const keys = selected.map((o) => o.value).join("|");
  React.useLayoutEffect(() => {
    const row = rowRef.current;
    const meter = meterRef.current;
    if (!row || !meter) return;

    const measure = () => {
      const childNodes = [...meter.children] as HTMLElement[];
      if (childNodes.length === 0) return;
      const counterWidth = childNodes[childNodes.length - 1].getBoundingClientRect().width;
      const widths = childNodes.slice(0, -1).map((c) => c.getBoundingClientRect().width);
      const gap = parseFloat(getComputedStyle(row).columnGap) || 4;
      setFit(Math.max(1, howManyFit(widths, counterWidth, row.clientWidth, gap)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [keys]);

  const cap = maxChips === undefined ? fit : Math.min(fit, maxChips);
  const visible = selected.slice(0, cap);
  const rest = selected.length - visible.length;

  const groups = React.useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    for (const o of options) {
      const groupKey = o.group ?? "";
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(o);
    }
    return [...map.entries()];
  }, [options]);

  return (
    <MultiCombobox value={values} onValueChange={change} modal={modal}>
      <ComboboxTrigger
        size={size}
        disabled={disabled}
        className={className}
        onClear={selected.length > 0 && !disabled ? () => change([]) : undefined}
        {...props}
      >
        {selected.length === 0 ? (
          <ComboboxValue placeholder={placeholder} />
        ) : (
          <span ref={rowRef} className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
            {/* `removeAs="span"` porque el disparador ya es un `<button>` y
                anidar otro sería HTML inválido. */}
            {visible.map((o) => (
              <Chip
                key={o.value}
                accessibilityLabel={o.label}
                removeAs="span"
                onRemove={() => change(values.filter((v) => v !== o.value))}
              >
                {o.label}
              </Chip>
            ))}
            {rest > 0 ? (
              <Badge tone="neutral" size="sm" variant="outline" className="shrink-0">
                +{rest}
              </Badge>
            ) : null}

            {/* Fila de medición: lleva siempre todas las fichas y el contador, a
                su ancho natural y fuera del flujo. De aquí salen los anchos que
                deciden cuántas entran. */}
            <span
              ref={meterRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 flex w-max items-center gap-1 opacity-0"
            >
              {selected.map((o) => (
                <Chip key={o.value} removeAs="presentation" onRemove={() => {}}>
                  {o.label}
                </Chip>
              ))}
              <Badge tone="neutral" size="sm" variant="outline">
                +{selected.length}
              </Badge>
            </span>
          </span>
        )}
      </ComboboxTrigger>

      {name ? values.map((v) => <input key={v} type="hidden" name={name} value={v} />) : null}

      <OptionList
        align={align}
        contentClassName={contentClassName}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        groups={groups}
      />
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
