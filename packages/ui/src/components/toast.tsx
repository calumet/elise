import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { Cross2Icon } from '@elise/icons';

import { cn } from '@/lib/cn';

export type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>;
export type ToastActionElement = React.ReactElement<typeof ToastPrimitive.Action>;

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-4 right-4 z-(--elise-z-toast,50)] flex max-h-screen w-[380px flex-col gap-2 outline-none',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        'group relative flex w-full flex-col gap-2 rounded-sm border border-border bg-surface p-4 pr-12 text-foreground shadow-floating transition data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:duration-200 data-[swipe=end:animate-swipe-out',
        className
      )}
      {...props}
    />
  )
);
Toast.displayName = ToastPrimitive.Root.displayName;

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-base font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
      className
    )}
    {...props}
  >
    <Cross2Icon aria-hidden />
    <span className="sr-only">Cerrar</span>
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'mt-2 inline-flex items-center justify-center rounded-sm border border-border px-3 py-1.5 text-base font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;
