import { TriangleAlert, Info, CircleX, CircleHelp, CircleCheck } from "@calumet/elise-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@calumet/elise-ui/alert-dialog";
import { Button } from "@calumet/elise-ui/button";
import * as React from "react";

import { closeAlert, onAlert, onCloseAlert, type AlertEvent } from "./bus";
import { useElLabel } from "./i18n";

const variantIcon = {
  alert: TriangleAlert,
  info: Info,
  error: CircleX,
  confirm: CircleHelp,
  success: CircleCheck,
};

const iconColor = {
  alert: "var(--warning)",
  info: "var(--primary)",
  error: "var(--destructive)",
  confirm: "var(--primary)",
  success: "var(--success)",
};

/**
 * Escucha el bus y dibuja las alertas. Se monta una sola vez, en la raíz de la
 * app; sin él, `openAlert` no muestra nada.
 *
 * Mantiene una cola y muestra de a una: si llegan varias mientras hay una
 * abierta, esperan su turno en lugar de apilarse en pantalla.
 */
export const AlertHost: React.FC = () => {
  const [queue, setQueue] = React.useState<AlertEvent[]>([]);
  const current = queue[0];

  const labelCancel = useElLabel("alerts", "cancel", "Cancelar");
  const labelConfirm = useElLabel("alerts", "confirm", "Confirmar");
  const labelOk = useElLabel("alerts", "ok", "Aceptar");

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
        {/* El título va en la banda de arriba y la pregunta en el cuerpo, que
            es el reparto del diálogo normal. Antes iban los dos juntos con el
            icono al lado, y al pasar el marco a tres zonas la descripción se
            quedaba sobre la banda tenue en vez de sobre el papel. */}
        {current.title ? (
          <AlertDialogHeader>
            <AlertDialogTitle>{current.title}</AlertDialogTitle>
          </AlertDialogHeader>
        ) : null}
        {current.description ? (
          <AlertDialogBody className="flex flex-row items-start gap-3">
            {React.createElement(variantIcon[current.variant], {
              className: "size-5 shrink-0",
              style: { color: iconColor[current.variant] },
              "aria-hidden": true,
            })}
            <AlertDialogDescription className="min-w-0">
              {current.description}
            </AlertDialogDescription>
          </AlertDialogBody>
        ) : null}
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
                {current.cancelLabel ?? labelCancel}
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
              {current.confirmLabel ?? (current.variant === "confirm" ? labelConfirm : labelOk)}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
