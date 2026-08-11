/**
 * Toasts que se disparan desde cualquier parte del código, sin pasar props ni
 * envolver el árbol en un provider. `Toaster` escucha un bus de eventos y
 * `toast()` publica en él.
 *
 * ```tsx
 * import { Toaster, toast } from "@calumet/elise-toasts";
 *
 * <Toaster position="bottom-right" />;
 * toast({ variant: "success", title: "Guardado" });
 * ```
 *
 * @module
 */

export * from "./bus";
export * from "./Toaster";
