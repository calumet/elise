/**
 * Raíz de la alerta modal. A diferencia de `Dialog`, no se cierra con Escape ni al pulsar fuera: exige una respuesta.
 *
 * @module
 */

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";

import {
  ANCHOS_DIALOGO,
  CABECERA_DIALOGO,
  CUERPO_DIALOGO,
  DESCRIPCION_DIALOGO,
  PANEL_DIALOGO,
  PIE_DIALOGO,
  TITULO_DIALOGO,
  VELO_DIALOGO,
} from "./dialog";

import { cn } from "@/lib/cn";

/** Raíz de la alerta modal. A diferencia de `Dialog`, no se cierra con Escape ni al pulsar fuera: exige una respuesta. */
export const AlertDialog = AlertDialogPrimitive.Root;
/** El control que abre la alerta. */
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
/** Monta la alerta al final del `body`. */
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
/** El botón que confirma y cierra. */
export const AlertDialogAction = AlertDialogPrimitive.Action;
/** El botón que descarta y cierra. */
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;

/** El velo que tapa la página detrás de la alerta. */
export const AlertDialogOverlay: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>> &
    React.RefAttributes<React.ComponentRef<typeof AlertDialogPrimitive.Overlay>>
> = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    data-slot="alert-dialog-overlay"
    ref={ref}
    className={cn(VELO_DIALOGO, className)}
    {...props}
  />
));
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
      size?: keyof typeof ANCHOS_DIALOGO;
    }
  > &
    React.RefAttributes<React.ComponentRef<typeof AlertDialogPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    size?: keyof typeof ANCHOS_DIALOGO;
  }
>(({ className, size = "sm", ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      data-slot="alert-dialog-content"
      ref={ref}
      className={cn(PANEL_DIALOGO, ANCHOS_DIALOGO[size], className)}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/** La cabecera: el título y la descripción. */
export const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div data-slot="alert-dialog-header" className={cn(CABECERA_DIALOGO, className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

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
  <div data-slot="alert-dialog-body" className={cn(CUERPO_DIALOGO, className)} {...props} />
);
AlertDialogBody.displayName = "AlertDialogBody";

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
    className={cn(TITULO_DIALOGO, className)}
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
    className={cn(DESCRIPCION_DIALOGO, className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

/** El pie con los dos botones, apilados en pantallas angostas. */
export const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div data-slot="alert-dialog-footer" className={cn(PIE_DIALOGO, className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";
