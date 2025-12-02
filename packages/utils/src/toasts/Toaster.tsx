import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CrossCircledIcon,
  Cross2Icon,
  CheckCircledIcon,
} from "@elise/icons";
import { Button } from "@elise/ui/button";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@elise/ui/toast";
import * as React from "react";

import { dismiss, onDismiss, onToast, type ToastEvent } from "./bus";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type ToasterProps = {
  position?: Position;
};

const iconColor = {
  info: "var(--elise-primary)",
  alert: "var(--elise-warning)",
  error: "var(--elise-danger)",
  success: "var(--elise-success)",
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
          open
          onOpenChange={(open: any) => {
            if (!open) dismiss(toastItem.id);
          }}
          className="group relative flex w-full max-w-sm flex-col gap-2 rounded-sm border border-border bg-surface p-4 pr-12 text-foreground shadow-floating transition data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:duration-200 data-[swipe=end]:animate-swipe-out"
        >
          <div className="flex items-start gap-2 pr-2">
            <ToastIcon variant={toastItem.variant} />
            <div className="flex-1 space-y-1">
              {toastItem.title ? (
                <ToastTitle className="text-sm font-semibold">{toastItem.title}</ToastTitle>
              ) : null}
              {toastItem.description ? (
                <ToastDescription className="text-sm text-muted-foreground">
                  {toastItem.description}
                </ToastDescription>
              ) : null}
              {toastItem.actionLabel && toastItem.action ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-0 text-primary hover:underline"
                  onClick={toastItem.action}
                >
                  {toastItem.actionLabel}
                </Button>
              ) : null}
            </div>
            <ToastClose
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Cerrar"
            >
              <Cross2Icon className="h-4 w-4" aria-hidden />
            </ToastClose>
          </div>
        </Toast>
      ))}
      <ToastViewport
        className={`fixed z-(--elise-z-toast,50) flex max-h-screen flex-col gap-2 outline-none ${viewportPosition(position)}`}
      />
    </ToastProvider>
  );
};

function ToastIcon({ variant }: { variant: ToastEvent["variant"] }) {
  const color = iconColor[variant] ?? iconColor.info;
  const Icon =
    variant === "error"
      ? CrossCircledIcon
      : variant === "alert"
        ? ExclamationTriangleIcon
        : variant === "success"
          ? CheckCircledIcon
          : InfoCircledIcon;
  return (
    <div
      className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted-foreground"
      aria-hidden
    >
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
  );
}
