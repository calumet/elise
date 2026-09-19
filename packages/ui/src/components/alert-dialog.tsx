/**
 * Raíz de la alerta modal. A diferencia de `Dialog`, no se cierra con Escape ni al pulsar fuera: exige una respuesta.
 *
 * @module
 */

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";

import { cn } from "@/lib/cn";

import { buttonVariants, type ButtonProps } from "./button";
import {
  DIALOG_WIDTHS,
  DIALOG_HEADER,
  DIALOG_BODY,
  DIALOG_DESCRIPTION,
  DIALOG_PANEL,
  DIALOG_FOOTER,
  DIALOG_TITLE,
  DIALOG_OVERLAY,
} from "./dialog";
import { useThemeScope } from "./theme-scope";

/** Raíz de la alerta modal. A diferencia de `Dialog`, no se cierra con Escape ni al pulsar fuera: exige una respuesta. */
export const AlertDialog: typeof AlertDialogPrimitive.Root = AlertDialogPrimitive.Root;
/** El control que abre la alerta. */
export const AlertDialogTrigger: typeof AlertDialogPrimitive.Trigger = AlertDialogPrimitive.Trigger;
/** Monta la alerta al final del `body`. */
export const AlertDialogPortal: typeof AlertDialogPrimitive.Portal = AlertDialogPrimitive.Portal;
/** Props de {@link AlertDialogAction}. */
export type AlertDialogActionProps = React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<ButtonProps, "variant" | "size" | "tone">;

/** Props de {@link AlertDialogCancel}. */
export type AlertDialogCancelProps = React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<ButtonProps, "variant" | "size" | "tone">;

/** El botón que confirma y cierra. Sale con el aspecto de `Button` sólido; `variant`, `size` y `tone` lo cambian. */
export const AlertDialogAction = ({
  className,
  variant = "solid",
  size,
  tone,
  ...props
}: AlertDialogActionProps): React.JSX.Element => (
  <AlertDialogPrimitive.Action
    data-slot="alert-dialog-action"
    /* Con `asChild` no se ponen: sumadas a las del hijo, `twMerge` resolvería a favor de estas. */
    className={props.asChild ? className : cn(buttonVariants({ variant, size, tone }), className)}
    {...props}
  />
);

/** El botón que descarta y cierra. Sale con el aspecto de `Button` `outline`; `variant`, `size` y `tone` lo cambian. */
export const AlertDialogCancel = ({
  className,
  variant = "outline",
  size,
  tone,
  ...props
}: AlertDialogCancelProps): React.JSX.Element => (
  <AlertDialogPrimitive.Cancel
    data-slot="alert-dialog-cancel"
    className={props.asChild ? className : cn(buttonVariants({ variant, size, tone }), className)}
    {...props}
  />
);

/** El velo que tapa la página detrás de la alerta. */
export const AlertDialogOverlay: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>> &
    React.RefAttributes<React.ComponentRef<typeof AlertDialogPrimitive.Overlay>>
> = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, style, ...props }, ref) => {
  const theme = useThemeScope();
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      style={{ ...theme.variables, ...style }}
      ref={ref}
      className={cn(theme.classes, DIALOG_OVERLAY, className)}
      {...props}
    />
  );
});
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

/**
 * El panel de un diálogo que hay que responder.
 *
 * Lleva el mismo marco que `Dialog` y no uno propio: cabecera y pie sobre banda
 * tenue, cuerpo en blanco y el mismo relleno de 16 en las tres zonas. Un modal
 * es un modal, y que el de confirmar tuviera su caja aparte solo servía para
 * que dos ventanas seguidas se vieran distintas sin motivo.
 *
 * Lo que sí cambia es el ancho por defecto, que es el estrecho: aquí caben un
 * título, una frase y dos botones, y los 620px del normal dejan la frase
 * perdida a lo ancho.
 *
 * No hay aspa. Es lo que separa a este de `Dialog`: no se descarta mirando
 * hacia otro lado, se responde.
 */
export const AlertDialogContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
      size?: keyof typeof DIALOG_WIDTHS;
    }
  > &
    React.RefAttributes<React.ComponentRef<typeof AlertDialogPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    size?: keyof typeof DIALOG_WIDTHS;
  }
>(({ className, style, size = "sm", ...props }, ref) => {
  const theme = useThemeScope();
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        style={{ ...theme.variables, ...style }}
        ref={ref}
        className={cn(theme.classes, DIALOG_PANEL, DIALOG_WIDTHS[size], className)}
        {...props}
      />
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/** La cabecera: el título y la descripción. */
export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div data-slot="alert-dialog-header" className={cn(DIALOG_HEADER, className)} {...props} />
);

/**
 * El cuerpo: la pregunta y lo que haga falta para responderla.
 *
 * Es lo único que se desplaza, igual que en `Dialog`, así que una confirmación
 * con una lista larga de lo que se va a borrar no empuja los botones fuera de
 * la pantalla.
 */
export const AlertDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div data-slot="alert-dialog-body" className={cn(DIALOG_BODY, className)} {...props} />
);

/** El título, que es lo que anuncia el lector de pantalla al abrir. */
export const AlertDialogTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>> &
    React.RefAttributes<React.ComponentRef<typeof AlertDialogPrimitive.Title>>
> = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    data-slot="alert-dialog-title"
    ref={ref}
    className={cn(DIALOG_TITLE, className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

/** Qué va a pasar si se confirma. Es lo que vuelve informada a la respuesta. */
export const AlertDialogDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>> &
    React.RefAttributes<React.ComponentRef<typeof AlertDialogPrimitive.Description>>
> = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    data-slot="alert-dialog-description"
    ref={ref}
    className={cn(DIALOG_DESCRIPTION, className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

/** El pie con los dos botones, apilados en pantallas angostas. */
export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div data-slot="alert-dialog-footer" className={cn(DIALOG_FOOTER, className)} {...props} />
);
