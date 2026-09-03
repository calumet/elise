/**
 * Raíz de el menú contextual. Guarda qué está abierto; no dibuja nada por sí sola.
 *
 * @module
 */

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as React from "react";

import { cn } from "@/lib/cn";

const baseItem =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-3 py-2 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-state-hover data-highlighted:text-foreground";

/* Las filas con indicador lo pintan en absoluto sobre una canaleta izquierda, de
   modo que su texto arranca en pl-7 mientras el de una fila plana arranca en
   px-3. Sin reservar la canaleta, mezcladas en el mismo menú cada fila
   arrancaría en una x distinta.

   La canaleta se reserva solo cuando el menú de verdad trae una fila con
   indicador, que es para lo que sirve data-slot. Un menú de puras acciones se
   queda sin sangría y no gana un hueco vacío a la izquierda. */
const canaletaIndicador =
  "[&:has([data-slot=context-menu-checkbox-item],[data-slot=context-menu-radio-item])_[data-slot=context-menu-item]]:pl-7 [&:has([data-slot=context-menu-checkbox-item],[data-slot=context-menu-radio-item])_[data-slot=context-menu-sub-trigger]]:pl-7";

/** Raíz de el menú contextual. Guarda qué está abierto; no dibuja nada por sí sola. */
export const ContextMenu = ContextMenuPrimitive.Root;
/** El control que abre el menú contextual. */
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
/** Agrupa opciones afines. Con `ContextMenuLabel` encima, les pone título. */
export const ContextMenuGroup = ContextMenuPrimitive.Group;
/** Monta el panel al final del `body`, para que no lo recorte ningún ancestro. */
export const ContextMenuPortal = ContextMenuPrimitive.Portal;
/** Un submenú. Guarda si está abierto. */
export const ContextMenuSub = ContextMenuPrimitive.Sub;
/** Agrupa opciones excluyentes y guarda cuál está elegida. */
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

/** El panel con las opciones. */
export const ContextMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      data-slot="context-menu-content"
      ref={ref}
      className={cn(
        "z-popover min-w-[200px] rounded-xl border border-border bg-popover p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
        canaletaIndicador,
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

/** Una opción. `inset` la alinea con las que llevan casilla. */
export const ContextMenuItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.Item>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    data-slot="context-menu-item"
    ref={ref}
    className={cn(baseItem, className)}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

/** Opción con casilla, para un ajuste que se prende y se apaga. */
export const ContextMenuCheckboxItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    data-slot="context-menu-checkbox-item"
    ref={ref}
    className={cn(baseItem, "pl-7", className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
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
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

/** Una opción excluyente dentro de un `ContextMenuRadioGroup`. */
export const ContextMenuRadioItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    data-slot="context-menu-radio-item"
    ref={ref}
    className={cn(baseItem, "pl-7", className)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <span className="h-2 w-2 rounded-full bg-foreground" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

/** Título de un grupo. No se puede elegir ni recibe foco. */
export const ContextMenuLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.Label>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    data-slot="context-menu-label"
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

/** La línea que separa dos grupos de opciones. */
export const ContextMenuSeparator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.Separator>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    data-slot="context-menu-separator"
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

/** La opción que abre el submenú, con la flecha a la derecha. */
export const ContextMenuSubTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    data-slot="context-menu-sub-trigger"
    ref={ref}
    className={cn(baseItem, className)}
    {...props}
  >
    {children}
    <svg viewBox="0 0 16 16" className="ml-auto h-3.5 w-3.5" aria-hidden="true" focusable="false">
      <path
        d="M6 3l4 5-4 5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

/** El panel del submenú. */
export const ContextMenuSubContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>> &
    React.RefAttributes<React.ComponentRef<typeof ContextMenuPrimitive.SubContent>>
> = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    data-slot="context-menu-sub-content"
    ref={ref}
    className={cn(
      "z-popover min-w-[180px] rounded-xl border border-border bg-popover p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      canaletaIndicador,
      className,
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;
