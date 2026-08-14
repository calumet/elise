/**
 * Raíz del selector. Guarda el valor elegido.
 *
 * @module
 */

import { ChevronDown } from "@calumet/elise-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as React from "react";

import { CAJA_CAMPO, CAMPO_INVALIDO, TAMANOS_CAMPO, type TamanoCampo } from "./input";

import { cn } from "@/lib/cn";

/** Raíz del selector. Guarda el valor elegido. */
export const Select = SelectPrimitive.Root;
/** Agrupa opciones afines, con `SelectLabel` como título. */
export const SelectGroup = SelectPrimitive.Group;
/** Muestra la opción elegida dentro del disparador, o el `placeholder` si no hay ninguna. */
export const SelectValue = SelectPrimitive.Value;

/** Props de {@link SelectTrigger}. */
export type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
  /** Por defecto `md`, 36px de alto. */
  size?: TamanoCampo;
};

/** El control que abre la lista. */
export const SelectTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<SelectTriggerProps> &
    React.RefAttributes<React.ComponentRef<typeof SelectPrimitive.Trigger>>
> = React.forwardRef<React.ComponentRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(
  ({ className, children, size = "md", ...props }, ref) => (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      ref={ref}
      /* La caja sale de `CAJA_CAMPO` y no de una copia: cuando era propia, el
       selector y el campo de al lado ya se habían desincronizado en el borde y
       en el foco. */
      className={cn(
        CAJA_CAMPO,
        TAMANOS_CAMPO[size],
        "items-center justify-between data-placeholder:text-muted-foreground",
        CAMPO_INVALIDO,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/** El panel con las opciones. */
export const SelectContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>> &
    React.RefAttributes<React.ComponentRef<typeof SelectPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      data-slot="select-content"
      ref={ref}
      position={position}
      className={cn(
        "z-popover min-w-32 max-h-(--radix-select-content-available-height) overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
        position === "popper" && "translate-y-1",
        className,
      )}
      {...props}
    >
      {/* Radix esconde la barra del visor, con su propia regla para
          `[data-radix-select-viewport]`, porque da por hecho que en su lugar se
          usan sus botones de subir y bajar. Sin ellos una lista larga se
          desplazaba sin que nada lo indicara. Se devuelve la del sistema, que
          es la misma que la de la página y la de cualquier otra lista.

          Va en `style` y no en una clase porque la regla de Radix no está en
          ninguna capa y las capas pierden contra lo que no lo está: una
          utilidad de Tailwind no la gana. */}
      <SelectPrimitive.Viewport className="p-1" style={{ scrollbarWidth: "thin" }}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

/** Título de un grupo. No se puede elegir. */
export const SelectLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>> &
    React.RefAttributes<React.ComponentRef<typeof SelectPrimitive.Label>>
> = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    data-slot="select-label"
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

/** Una opción. */
export const SelectItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>> &
    React.RefAttributes<React.ComponentRef<typeof SelectPrimitive.Item>>
> = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-3 py-2 pl-6 text-base outline-none transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted data-highlighted:text-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
        <polyline
          points="3.5 8.5 6.5 11.5 12.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SelectPrimitive.ItemIndicator>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

/** La línea que separa dos grupos. */
export const SelectSeparator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>> &
    React.RefAttributes<React.ComponentRef<typeof SelectPrimitive.Separator>>
> = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
