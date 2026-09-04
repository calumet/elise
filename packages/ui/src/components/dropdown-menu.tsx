/**
 * Raíz de el menú desplegable. Guarda qué está abierto; no dibuja nada por sí sola.
 *
 * @module
 */

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { useThemeScope } from "./theme-scope";

import { cn } from "@/lib/cn";

/* Los iconos se miden aquí y no en cada sitio que los pase: sin esto, un icono
   suelto en una fila salía a su tamaño natural, que en la mayoría de los juegos
   son 24px, y estiraba la fila. El `:not([class*=size-])` deja pasar al que sí
   trae medida propia. */
const baseItem =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-3 py-2 text-base text-foreground outline-none transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-state-hover data-highlighted:text-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

/* Las filas con indicador lo pintan en absoluto sobre una canaleta izquierda, de
   modo que su texto arranca en pl-7 mientras el de una fila plana arranca en
   px-3. Sin reservar la canaleta, mezcladas en el mismo menú cada fila
   arrancaría en una x distinta.

   La canaleta se reserva solo cuando el menú de verdad trae una fila con
   indicador, que es para lo que sirve data-slot. Un menú de puras acciones se
   queda sin sangría y no gana un hueco vacío a la izquierda. */
const canaletaIndicador =
  "[&:has([data-slot=dropdown-menu-checkbox-item],[data-slot=dropdown-menu-radio-item])_[data-slot=dropdown-menu-item]]:pl-7 [&:has([data-slot=dropdown-menu-checkbox-item],[data-slot=dropdown-menu-radio-item])_[data-slot=dropdown-menu-sub-trigger]]:pl-7";

/** Raíz de el menú desplegable. Guarda qué está abierto; no dibuja nada por sí sola. */
export const DropdownMenu = DropdownMenuPrimitive.Root;
/** El control que abre el menú desplegable. */
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
/** Agrupa opciones afines. Con `DropdownMenuLabel` encima, les pone título. */
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
/** Monta el panel al final del `body`, para que no lo recorte ningún ancestro. */
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
/** Un submenú. Guarda si está abierto. */
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
/** Agrupa opciones excluyentes y guarda cuál está elegida. */
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/** El panel con las opciones. */
export const DropdownMenuContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, align = "start", ...props }, ref) => {
  const tema = useThemeScope();
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          tema,
          "z-popover min-w-[200px] rounded-xl border border-border bg-popover p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
          canaletaIndicador,
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

/** Una opción. `inset` la alinea con las que llevan casilla. */
export const DropdownMenuItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.Item>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    data-slot="dropdown-menu-item"
    ref={ref}
    className={cn(baseItem, className)}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

/** Opción con casilla, para un ajuste que se prende y se apaga. */
export const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    data-slot="dropdown-menu-checkbox-item"
    ref={ref}
    className={cn(baseItem, "pl-7", className)}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
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
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

/** Una opción excluyente dentro de un `DropdownMenuRadioGroup`. */
export const DropdownMenuRadioItem: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    data-slot="dropdown-menu-radio-item"
    ref={ref}
    className={cn(baseItem, "pl-7", className)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <span className="h-2 w-2 rounded-full bg-foreground" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

/** Título de un grupo. No se puede elegir ni recibe foco. */
export const DropdownMenuLabel: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.Label>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    data-slot="dropdown-menu-label"
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

/** La línea que separa dos grupos de opciones. */
export const DropdownMenuSeparator: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.Separator>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    data-slot="dropdown-menu-separator"
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

/** La opción que abre el submenú, con la flecha a la derecha. */
export const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    data-slot="dropdown-menu-sub-trigger"
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
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

/** El panel del submenú. */
export const DropdownMenuSubContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>> &
    React.RefAttributes<React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>>
> = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    data-slot="dropdown-menu-sub-content"
    ref={ref}
    className={cn(
      "z-popover min-w-[180px] rounded-xl border border-border bg-popover p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      canaletaIndicador,
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
