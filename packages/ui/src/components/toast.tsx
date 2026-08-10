/**
 * Un aviso.
 *
 * @module
 */

import { X } from "@calumet/elise-icons";
import * as ToastPrimitive from "@radix-ui/react-toast";
import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link Toast}. */
export type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>;
/** El tipo del elemento que se pasa como acción de un toast. */
export type ToastActionElement = React.ReactElement<typeof ToastPrimitive.Action>;

/** Reparte a los toasts de abajo la duración y el comportamiento del foco. */
export const ToastProvider = ToastPrimitive.Provider;

/** La esquina donde se apilan los toasts. */
export const ToastViewport: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>> &
    React.RefAttributes<React.ComponentRef<typeof ToastPrimitive.Viewport>>
> = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    data-slot="toast-viewport"
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-toast flex max-h-screen w-[380px] flex-col gap-2 outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

/** Un aviso. */
export const Toast: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ToastProps> &
    React.RefAttributes<React.ComponentRef<typeof ToastPrimitive.Root>>
> = React.forwardRef<React.ComponentRef<typeof ToastPrimitive.Root>, ToastProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Root
      data-slot="toast"
      ref={ref}
      className={cn(
        "group relative flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-4 pr-12 text-foreground shadow-lg transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:duration-200 data-[swipe=end]:animate-swipe-out",
        className,
      )}
      {...props}
    />
  ),
);
Toast.displayName = ToastPrimitive.Root.displayName;

/** El título del aviso. */
export const ToastTitle: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>> &
    React.RefAttributes<React.ComponentRef<typeof ToastPrimitive.Title>>
> = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    data-slot="toast-title"
    ref={ref}
    className={cn("text-base font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

/** El detalle del aviso. */
export const ToastDescription: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>> &
    React.RefAttributes<React.ComponentRef<typeof ToastPrimitive.Description>>
> = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    data-slot="toast-description"
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

/** El botón que lo descarta. */
export const ToastClose: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>> &
    React.RefAttributes<React.ComponentRef<typeof ToastPrimitive.Close>>
> = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => {
  const closeLabel = useElLabel("ui", "close", "Cerrar");
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      ref={ref}
      className={cn(
        "absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        className,
      )}
      {...props}
    >
      <X className="size-4" aria-hidden />
      <span className="sr-only">{closeLabel}</span>
    </ToastPrimitive.Close>
  );
});
ToastClose.displayName = ToastPrimitive.Close.displayName;

/** La acción del aviso, por ejemplo deshacer. */
export const ToastAction: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>> &
    React.RefAttributes<React.ComponentRef<typeof ToastPrimitive.Action>>
> = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    data-slot="toast-action"
    ref={ref}
    className={cn(
      "mt-2 inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-base font-semibold text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;
