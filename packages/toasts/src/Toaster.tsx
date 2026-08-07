import { TriangleAlert, Info, CircleX, X, CircleCheck } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@calumet/elise-ui/toast";
import * as React from "react";

import { dismiss, onDismiss, onToast, type ToastEvent, type ToastVariant } from "./bus";
import { useElLabel } from "./i18n";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type ToasterProps = {
  position?: Position;
};

const MARCO =
  "group relative flex w-full max-w-md flex-col gap-2 rounded-md p-3 pr-12 shadow-lg transition data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:duration-200 data-[swipe=end]:animate-swipe-out";

/* Invertido: el aviso llega encima de una pantalla llena de tarjetas, y otra
   tarjeta blanca más se confunde con ellas.

   Sobre esa superficie nada se tiñe con un color de estado. Los colores de
   estado están calibrados contra el fondo del tema, y el aviso es justo el
   contrario, así que en claro salen oscuros sobre oscuro y en oscuro claros
   sobre claro. El error, que sí tiene que distinguirse por color, repinta la
   superficie entera con un par de relleno que ya viene emparejado.

   Ese relleno no deja sitio para un segundo escalón de texto: el par da 4.85:1
   y al 75% de opacidad el detalle baja a 3.2. Sobre la superficie invertida hay
   17:1 de recorrido, y ahí atenuar sí separa el título del resto. */
const superficieDe = (variant: ToastVariant) =>
  variant === "error"
    ? {
        marco: "bg-destructive text-destructive-foreground",
        detalle: "text-current",
        cerrar: "text-current",
      }
    : {
        marco: "bg-inverse text-inverse-foreground",
        detalle: "text-current/75",
        cerrar: "text-current/70 hover:text-current",
      };

const viewportPosition = (position: Position) => {
  switch (position) {
    case "top-left":
      return "left-4 top-4";
    case "bottom-left":
      return "left-4 bottom-4";
    case "bottom-right":
      return "right-4 bottom-4";
    case "top-right":
    default:
      return "right-4 top-4";
  }
};

export const Toaster = ({ position = "top-right" }: ToasterProps) => {
  const [toasts, setToasts] = React.useState<ToastEvent[]>([]);
  const closeLabel = useElLabel("toasts", "close", "Cerrar");

  React.useEffect(() => {
    const unsubscribeToast = onToast((toast) => setToasts((current) => [...current, toast]));
    const unsubscribeDismiss = onDismiss((id) =>
      setToasts((current) => (id ? current.filter((t) => t.id !== id) : current.slice(1))),
    );
    return () => {
      unsubscribeToast();
      unsubscribeDismiss();
    };
  }, []);

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((toastItem) => {
        const superficie = superficieDe(toastItem.variant);
        return (
          <Toast
            key={toastItem.id}
            duration={toastItem.duration}
            onOpenChange={(open: boolean) => {
              if (!open) dismiss(toastItem.id);
            }}
            className={`${MARCO} ${superficie.marco}`}
          >
            <div className="flex items-start gap-2 pr-2">
              <ToastIcon variant={toastItem.variant} />
              <div className="flex-1 space-y-1">
                {toastItem.title ? (
                  <ToastTitle className="text-sm font-semibold">{toastItem.title}</ToastTitle>
                ) : null}
                {toastItem.description ? (
                  <ToastDescription className={`text-sm ${superficie.detalle}`}>
                    {toastItem.description}
                  </ToastDescription>
                ) : null}
                {toastItem.actionLabel && toastItem.action ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-0 text-current underline-offset-2 hover:bg-transparent hover:underline"
                    onClick={toastItem.action}
                  >
                    {toastItem.actionLabel}
                  </Button>
                ) : null}
              </div>
              <ToastClose
                className={`absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${superficie.cerrar}`}
                aria-label={closeLabel}
              >
                <X className="h-4 w-4" aria-hidden />
              </ToastClose>
            </div>
          </Toast>
        );
      })}
      <ToastViewport
        className={`fixed z-toast flex max-h-screen flex-col gap-2 outline-none ${viewportPosition(position)}`}
      />
    </ToastProvider>
  );
};

/* Sin margen propio: el icono mide 20px y el renglón del título otros 20, así
   que alineados arriba sus centros coinciden. Cualquier desplazamiento aquí se
   nota cuando el aviso no lleva descripción y el título es lo único al lado. */
function ToastIcon({ variant }: { variant: ToastVariant }) {
  const Icon =
    variant === "error"
      ? CircleX
      : variant === "alert"
        ? TriangleAlert
        : variant === "success"
          ? CircleCheck
          : Info;
  return <Icon className="size-5 shrink-0" aria-hidden />;
}
