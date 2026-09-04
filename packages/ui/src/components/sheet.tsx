/**
 * Raíz del panel lateral. Guarda si está abierto.
 *
 * @module
 */

import { X } from "@calumet/elise-icons";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import {
  CABECERA_DIALOGO,
  CUERPO_DIALOGO,
  DESCRIPCION_DIALOGO,
  PIE_DIALOGO,
  TITULO_DIALOGO,
} from "./dialog";
import { useThemeScope } from "./theme-scope";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Raíz del panel lateral. Guarda si está abierto. */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>): React.JSX.Element {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/** El control que abre el panel. */
function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>): React.JSX.Element {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

/** Cierra el panel. */
function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>): React.JSX.Element {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  style,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  const tema = useThemeScope();

  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      style={{ ...tema.variables, ...style }}
      className={cn(
        tema.clases,
        "fixed inset-0 z-overlay bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
        className,
      )}
      {...props}
    />
  );
}

/** El panel, anclado al borde que diga `side`. */
function SheetContent({
  className,
  style,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}): React.JSX.Element {
  const tema = useThemeScope();

  const closeLabel = useElLabel("ui", "close", "Cerrar");
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        style={{ ...tema.variables, ...style }}
        className={cn(
          tema.clases,
          /* Sin hueco entre las zonas y sobre la superficie de tarjeta, que es
             lo que hace el panel del diálogo: los filetes de la cabecera y del
             pie son lo que las separa, y el cuerpo no trae fondo propio. */
          "fixed z-modal flex flex-col overflow-hidden bg-card text-card-foreground shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-300",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-2.5 right-2.5 inline-flex size-7 cursor-pointer items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">{closeLabel}</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

/** La cabecera fija del panel. */
function SheetHeader({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  /* El `pe-12` es el hueco del aspa, que va posicionada encima, igual que en
     `DialogHeader`. */
  return (
    <div data-slot="sheet-header" className={cn(CABECERA_DIALOGO, "pe-12", className)} {...props} />
  );
}

/**
 * El cuerpo del panel. Es lo único que se desplaza: la cabecera y el pie se
 * quedan fijos, así que con un formulario largo las acciones no hay que ir a
 * buscarlas al final.
 */
function SheetBody({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return <div data-slot="sheet-body" className={cn(CUERPO_DIALOGO, className)} {...props} />;
}

/** El pie fijo, donde van las acciones. */
function SheetFooter({ className, ...props }: React.ComponentProps<"div">): React.JSX.Element {
  return <div data-slot="sheet-footer" className={cn(PIE_DIALOGO, className)} {...props} />;
}

/** El título del panel, que anuncia el lector de pantalla al abrirlo. */
function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>): React.JSX.Element {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(TITULO_DIALOGO, "text-foreground", className)}
      {...props}
    />
  );
}

/** La bajada del título. */
function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>): React.JSX.Element {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(DESCRIPCION_DIALOGO, className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
