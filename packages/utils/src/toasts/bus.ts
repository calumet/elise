export type ToastVariant = 'info' | 'alert' | 'error' | 'success';

export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  action?: () => void;
  duration?: number;
  variant?: ToastVariant;
};

export type ToastEvent = ToastOptions & { id: string; variant: ToastVariant };

type ToastListener = (toast: ToastEvent) => void;
type DismissListener = (id?: string) => void;

const toastListeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36);

export const toast = (options: ToastOptions) => {
  const id = options.id ?? genId();
  const payload: ToastEvent = { duration: 4000, variant: 'info', ...options, id };
  toastListeners.forEach((listener) => listener(payload));
  return id;
};

export const dismiss = (id?: string) => {
  dismissListeners.forEach((listener) => listener(id));
};

export const onToast = (listener: ToastListener) => {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
};

export const onDismiss = (listener: DismissListener) => {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
};
