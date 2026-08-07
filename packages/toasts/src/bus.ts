/** Tono del toast. Elige el icono y el color de la barra. */
export type ToastVariant = "info" | "alert" | "error" | "success";

/** Lo que recibe {@link toast} para armar un aviso. */
export type ToastOptions = {
  /** Identificador propio. Sin esto se genera uno. */
  id?: string;
  title?: string;
  description?: string;
  /** Rótulo del botón de acción. Sin él no se dibuja el botón. */
  actionLabel?: string;
  action?: () => void;
  /** Milisegundos en pantalla. Por defecto 4000. */
  duration?: number;
  /** Por defecto `"info"`. */
  variant?: ToastVariant;
};

/** Lo que llega a los suscriptores de {@link onToast}, ya con id, duración y variante resueltos. */
export type ToastEvent = ToastOptions & { id: string; variant: ToastVariant };

type ToastListener = (toast: ToastEvent) => void;
type DismissListener = (id?: string) => void;

const toastListeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36);

/**
 * Lanza un toast y devuelve su id, con el que después se lo puede cerrar antes
 * de tiempo. Publica en el bus, así que sirve desde código que no está en el
 * árbol de React, siempre que haya un `Toaster` montado escuchando.
 *
 * ```ts
 * toast({ variant: "success", title: "Guardado" });
 * ```
 */
export const toast = (options: ToastOptions): string => {
  const id = options.id ?? genId();
  const payload: ToastEvent = { duration: 4000, variant: "info", ...options, id };
  toastListeners.forEach((listener) => listener(payload));
  return id;
};

/** Cierra el toast con ese id. Sin argumento cierra el más viejo de la cola. */
export const dismiss = (id?: string): void => {
  dismissListeners.forEach((listener) => listener(id));
};

/**
 * Suscribe al bus de avisos. Devuelve la función que desuscribe, para llamarla
 * en la limpieza del efecto.
 */
export const onToast = (listener: ToastListener): (() => boolean) => {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
};

/** Suscribe al bus de cierre. Devuelve la función que desuscribe. */
export const onDismiss = (listener: DismissListener): (() => boolean) => {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
};
