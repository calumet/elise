/**
 * Tono de la alerta. Elige el icono y el color, y `confirm` es la única que
 * dibuja el botón de cancelar.
 */
export type AlertVariant = "alert" | "info" | "error" | "confirm" | "success";

/** Lo que recibe {@link openAlert} para armar una alerta. */
export type AlertOptions = {
  /** Identificador propio. Sin esto se genera uno. */
  id?: string;
  title?: string;
  description?: string;
  /** Rótulo del botón de confirmar. Por defecto `"Aceptar"`. */
  confirmLabel?: string;
  /** Rótulo del botón de cancelar. Por defecto `"Cancelar"`. */
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Por defecto `"alert"`. */
  variant?: AlertVariant;
};

/** Lo que llega a los suscriptores de {@link onAlert}, ya con id y variante resueltos. */
export type AlertEvent = AlertOptions & { id: string; variant: AlertVariant };

type AlertListener = (alert: AlertEvent) => void;
type CloseListener = (id?: string) => void;

const alertListeners = new Set<AlertListener>();
const closeListeners = new Set<CloseListener>();

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36);

/**
 * Abre una alerta y devuelve su id, con el que después se la puede cerrar.
 * Publica en el bus, así que sirve desde código que no está en el árbol de
 * React, siempre que haya un `AlertHost` montado escuchando.
 *
 * ```ts
 * openAlert({
 *   variant: "confirm",
 *   title: "Eliminar el proyecto",
 *   onConfirm: () => borrar(id),
 * });
 * ```
 */
export const openAlert = (options: AlertOptions): string => {
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

/** Cierra la alerta con ese id. Sin argumento cierra la primera de la cola. */
export const closeAlert = (id?: string): void => {
  closeListeners.forEach((listener) => listener(id));
};

/**
 * Suscribe al bus de apertura. Devuelve la función que desuscribe, para
 * llamarla en la limpieza del efecto.
 */
export const onAlert = (listener: AlertListener): (() => boolean) => {
  alertListeners.add(listener);
  return () => alertListeners.delete(listener);
};

/** Suscribe al bus de cierre. Devuelve la función que desuscribe. */
export const onCloseAlert = (listener: CloseListener): (() => boolean) => {
  closeListeners.add(listener);
  return () => closeListeners.delete(listener);
};
