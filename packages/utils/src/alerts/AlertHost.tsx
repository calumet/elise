import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  CheckCircledIcon,
} from "@elise/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@elise/ui/alert-dialog";
import { Button } from "@elise/ui/button";
import * as React from "react";

import { closeAlert, onAlert, onCloseAlert, type AlertEvent } from "./bus";

const variantIcon = {
  alert: ExclamationTriangleIcon,
  info: InfoCircledIcon,
  error: CrossCircledIcon,
  confirm: QuestionMarkCircledIcon,
  success: CheckCircledIcon,
};

const iconColor = {
  alert: "var(--elise-warning)",
  info: "var(--elise-primary)",
  error: "var(--elise-danger)",
  confirm: "var(--elise-primary)",
  success: "var(--elise-success)",
};

export const AlertHost: React.FC = () => {
  const [queue, setQueue] = React.useState<AlertEvent[]>([]);
  const current = queue[0];

  React.useEffect(() => {
    const offAlert = onAlert((alert) => setQueue((curr) => [...curr, alert]));
    const offClose = onCloseAlert((id) => {
      setQueue((curr) => (id ? curr.filter((a) => a.id !== id) : curr.slice(1)));
    });
    return () => {
      offAlert();
      offClose();
    };
  }, []);

  const handleClose = React.useCallback(
    (id?: string) => {
      setQueue((curr) => (id ? curr.filter((a) => a.id !== id) : curr.slice(1)));
    },
    [setQueue],
  );

  if (!current) return null;

  const showCancel =
    current.variant === "confirm" ||
    (current.variant === "alert" && (!!current.onCancel || !!current.cancelLabel));

  return (
    <AlertDialog open onOpenChange={(open) => !open && handleClose(current.id)}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 aspect-square items-center justify-center">
            {React.createElement(variantIcon[current.variant], {
              className: "h-6 w-6",
              style: { color: iconColor[current.variant] },
              "aria-hidden": true,
            })}
          </div>
          <div className="space-y-1">
            {current.title ? <AlertDialogTitle>{current.title}</AlertDialogTitle> : null}
            {current.description ? (
              <AlertDialogDescription>{current.description}</AlertDialogDescription>
            ) : null}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel ? (
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                onClick={() => {
                  current.onCancel?.();
                  closeAlert(current.id);
                }}
                className="font-semibold"
              >
                {current.cancelLabel ?? "Cancelar"}
              </Button>
            </AlertDialogCancel>
          ) : null}
          <AlertDialogAction asChild>
            <Button
              onClick={() => {
                current.onConfirm?.();
                closeAlert(current.id);
              }}
            >
              {current.confirmLabel ?? (current.variant === "confirm" ? "Confirmar" : "Aceptar")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
