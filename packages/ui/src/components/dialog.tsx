/**
 * Raíz del modal. Guarda si está abierto, y admite `open` con `onOpenChange` para controlarlo desde afuera.
 *
 * @module
 */

import { X } from "@calumet/elise-icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Raíz del modal. Guarda si está abierto, y admite `open` con `onOpenChange` para controlarlo desde afuera. */
export const Dialog = DialogPrimitive.Root;
/** El control que abre el modal. */
export const DialogTrigger = DialogPrimitive.Trigger;
/** Monta el modal al final del `body`, fuera del recorte de cualquier ancestro. */
export const DialogPortal = DialogPrimitive.Portal;
/** Cierra el modal. Envolvé con él cualquier botón del pie. */
export const DialogClose = DialogPrimitive.Close;

/* El marco entero vive en constantes porque `AlertDialog` cuelga de otro
   primitivo de Radix: no puede reutilizar estos componentes, solo sus clases.
   Sin esto los dos se separan a la primera corrección, que es exactamente lo
   que había pasado: este acabó con tres bandas y relleno de 16 y el otro con
   una caja suelta de 24 y otro radio. */

/** Las clases del velo. Están sueltas para que Sheet y AlertDialog usen exactamente el mismo. */
export const VELO_DIALOGO =
  "fixed inset-0 z-overlay bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in";

/** Las clases del panel centrado, con su animación de entrada y de salida. */
export const PANEL_DIALOGO =
  "fixed left-1/2 top-1/2 z-modal flex max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

/* Las tres zonas llevan el mismo relleno de 16 en los cuatro lados. Antes eran
   20 a los costados y 16 arriba y abajo, y esos 4px de más eran los únicos de
   todo el diálogo que no salían de la escala. */
/** Las clases de la cabecera, con el relleno común a las tres zonas. */
export const CABECERA_DIALOGO =
  "flex shrink-0 flex-col gap-1 border-b border-border bg-muted p-4 text-left";
/** Las clases del cuerpo, que es la única zona que desplaza. */
export const CUERPO_DIALOGO = "min-h-0 flex-1 overflow-y-auto p-4";
/** Las clases del pie, donde van las acciones. */
export const PIE_DIALOGO =
  "flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted p-4 sm:flex-row sm:justify-end";

/** Las clases del título. */
export const TITULO_DIALOGO = "text-lg font-semibold tracking-tight";
/** Las clases de la descripción. */
export const DESCRIPCION_DIALOGO = "text-base text-muted-foreground leading-relaxed";

/* Tres anchos y no más, para que dos diálogos seguidos no midan cada uno lo
   suyo. `md` es el de por defecto y el que sirve para casi
   todo; `sm` es para confirmar algo de una frase, donde 620px de ancho para dos
   botones se lee como si faltara contenido; `lg` para lo que lleva una tabla o
   un formulario de varias columnas dentro. */
/** Los tres anchos del panel, cada uno acotado al 90% del viewport. */
export const ANCHOS_DIALOGO = {
  sm: "w-[min(90vw,380px)]",
  md: "w-[min(90vw,620px)]",
  lg: "w-[min(90vw,980px)]",
} as const;

/** El velo que tapa la página detrás del modal. */
export const DialogOverlay: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>> &
    React.RefAttributes<React.ComponentRef<typeof DialogPrimitive.Overlay>>
> = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    data-slot="dialog-overlay"
    ref={ref}
    className={cn(VELO_DIALOGO, className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/** El panel del modal, con su cabecera, su cuerpo y su pie. `size` elige el ancho. */
export const DialogContent: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
      showCloseButton?: boolean;
      size?: keyof typeof ANCHOS_DIALOGO;
    }
  > &
    React.RefAttributes<React.ComponentRef<typeof DialogPrimitive.Content>>
> = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    size?: keyof typeof ANCHOS_DIALOGO;
  }
>(({ className, children, showCloseButton = true, size = "md", ...props }, ref) => {
  const closeLabel = useElLabel("ui", "close", "Cerrar");
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        ref={ref}
        className={cn(PANEL_DIALOGO, ANCHOS_DIALOGO[size], className)}
        {...props}
      >
        {showCloseButton ? (
          <DialogClose className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:bg-state-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <X className="size-4" aria-hidden />
            <span className="sr-only">{closeLabel}</span>
          </DialogClose>
        ) : null}
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

/* Cabecera y pie van sobre una banda tenue y el cuerpo en blanco. Es lo que
   separa las tres zonas sin una regla por cada una, y hace que al desplazar un
   cuerpo largo el título y las acciones sigan leyéndose como marco y no como
   contenido que se fue quedando arriba. */
/** La cabecera fija: el título, la descripción y el botón de cerrar. */
export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  /* El `pe-12` es el hueco del aspa, que va posicionada encima. `AlertDialog`
     no lo lleva porque no tiene aspa: hay que responderlo. */
  <div data-slot="dialog-header" className={cn(CABECERA_DIALOGO, "pe-12", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

/**
 * El cuerpo del diálogo. Es lo único que se desplaza: la cabecera y el pie se
 * quedan fijos, así que con un formulario largo las acciones no hay que ir a
 * buscarlas al final.
 */
export const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div data-slot="dialog-body" className={cn(CUERPO_DIALOGO, className)} {...props} />
);
DialogBody.displayName = "DialogBody";

/** El título del modal. Es lo que anuncia el lector de pantalla al abrirlo. */
export const DialogTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>> &
    React.RefAttributes<React.ComponentRef<typeof DialogPrimitive.Title>>
> = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    ref={ref}
    className={cn(TITULO_DIALOGO, className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/** La bajada del título, enlazada al panel por `aria-describedby`. */
export const DialogDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>> &
    React.RefAttributes<React.ComponentRef<typeof DialogPrimitive.Description>>
> = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    ref={ref}
    className={cn(DESCRIPCION_DIALOGO, className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * Pie con las acciones. La primaria va a la derecha del todo y las secundarias a
 * su izquierda, que es el orden en el que se lee una salida: primero las salidas
 * alternativas y al final la que continúa.
 *
 * En pantallas estrechas se apilan y la primaria queda arriba, porque ahí la
 * lectura es de arriba abajo y el final de la fila deja de significar «último».
 */
export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div data-slot="dialog-footer" className={cn(PIE_DIALOGO, className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";
