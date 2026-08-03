import { X } from "@calumet/elise-icons";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    data-slot="dialog-overlay"
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/* Los tres anchos de Polaris. `md` es el de por defecto y el que sirve para casi
   todo; `sm` es para confirmar algo de una frase, donde 620px de ancho para dos
   botones se lee como si faltara contenido; `lg` para lo que lleva una tabla o
   un formulario de varias columnas dentro. */
const anchos = {
  sm: "w-[min(90vw,380px)]",
  md: "w-[min(90vw,620px)]",
  lg: "w-[min(90vw,980px)]",
} as const;

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    size?: keyof typeof anchos;
  }
>(({ className, children, showCloseButton = true, size = "md", ...props }, ref) => {
  const closeLabel = useElLabel("ui", "close", "Cerrar");
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 flex max-h-[min(90vh,40rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          anchos[size],
          className,
        )}
        {...props}
      >
        {showCloseButton ? (
          <DialogClose className="absolute right-3 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
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
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-header"
    className={cn(
      "flex shrink-0 flex-col gap-1 border-b border-border bg-muted px-5 py-4 pe-12 text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

/**
 * El cuerpo del diálogo. Es lo único que se desplaza: la cabecera y el pie se
 * quedan fijos, así que con un formulario largo las acciones no hay que ir a
 * buscarlas al final.
 */
export const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-body"
    className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4", className)}
    {...props}
  />
);
DialogBody.displayName = "DialogBody";

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    ref={ref}
    className={cn("text-base text-muted-foreground leading-relaxed", className)}
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
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      "flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted px-5 py-4 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";
