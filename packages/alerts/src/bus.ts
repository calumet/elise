export type AlertVariant = "alert" | "info" | "error" | "confirm" | "success";

export type AlertOptions = {
  id?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: AlertVariant;
};

export type AlertEvent = AlertOptions & { id: string; variant: AlertVariant };

type AlertListener = (alert: AlertEvent) => void;
type CloseListener = (id?: string) => void;

const alertListeners = new Set<AlertListener>();
const closeListeners = new Set<CloseListener>();

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36);

export const openAlert = (options: AlertOptions) => {
  const id = options.id ?? genId();
  const payload: AlertEvent = {
    variant: "alert",
    confirmLabel: "Aceptar",
    cancelLabel: "Cancelar",
    ...options,
    id,
  };
  alertListeners.forEach((listener) => listener(payload));
  return id;
};

export const closeAlert = (id?: string) => {
  closeListeners.forEach((listener) => listener(id));
};

export const onAlert = (listener: AlertListener) => {
  alertListeners.add(listener);
  return () => alertListeners.delete(listener);
};

export const onCloseAlert = (listener: CloseListener) => {
  closeListeners.add(listener);
  return () => closeListeners.delete(listener);
};
