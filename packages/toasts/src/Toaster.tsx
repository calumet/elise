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

import { dismiss, onDismiss, onToast, type ToastEvent } from "./bus";
import { useElLabel } from "./i18n";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type ToasterProps = {
  position?: Position;
};

const iconColor = {
  info: "var(--primary)",
  alert: "var(--warning)",
  error: "var(--destructive)",
  success: "var(--success)",
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
      {toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          duration={toastItem.duration}
          onOpenChange={(open: boolean) => {
            if (!open) dismiss(toastItem.id);
          }}
          /* Invertido: el aviso llega encima de una pantalla llena de tarjetas,
             y otra tarjeta blanca más se confunde con ellas.
             Invertirlo lo despega sin recurrir a un color de estado, que aquí
             significaría otra cosa. Radio de 8px y 12 de relleno. */
          className="group relative flex w-full max-w-md flex-col gap-2 rounded-md bg-inverse p-3 pr-12 text-inverse-foreground shadow-lg transition data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:duration-200 data-[swipe=end]:animate-swipe-out"
        >
          <div className="flex items-start gap-2 pr-2">
            <ToastIcon variant={toastItem.variant} />
            <div className="flex-1 space-y-1">
              {toastItem.title ? (
                <ToastTitle className="text-sm font-semibold">{toastItem.title}</ToastTitle>
              ) : null}
              {toastItem.description ? (
                <ToastDescription className="text-sm text-inverse-foreground/75">
                  {toastItem.description}
                </ToastDescription>
              ) : null}
              {toastItem.actionLabel && toastItem.action ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 text-inverse-foreground underline-offset-2 hover:underline hover:bg-transparent"
                  onClick={toastItem.action}
                >
                  {toastItem.actionLabel}
                </Button>
              ) : null}
            </div>
            <ToastClose
              className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-inverse-foreground/70 transition hover:text-inverse-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
              aria-label={closeLabel}
            >
              <X className="h-4 w-4" aria-hidden />
            </ToastClose>
          </div>
        </Toast>
      ))}
      <ToastViewport
        className={`fixed z-toast flex max-h-screen flex-col gap-2 outline-none ${viewportPosition(position)}`}
      />
    </ToastProvider>
  );
};

function ToastIcon({ variant }: { variant: ToastEvent["variant"] }) {
  const color = iconColor[variant] ?? iconColor.info;
  const Icon =
    variant === "error"
      ? CircleX
      : variant === "alert"
        ? TriangleAlert
        : variant === "success"
          ? CircleCheck
          : Info;
  return (
    <div
      className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full"
      style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
      aria-hidden
    >
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
  );
}
