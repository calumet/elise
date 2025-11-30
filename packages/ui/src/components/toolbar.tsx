import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';

import { cn } from '@/lib/cn';

export const Toolbar = React.forwardRef<React.ElementRef<typeof ToolbarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <ToolbarPrimitive.Root
      ref={ref}
      className={cn('flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2', className)}
      {...props}
    />
  )
);
Toolbar.displayName = ToolbarPrimitive.Root.displayName;

export const ToolbarButton = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Button>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-base font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=on]:bg-primary data-[state=on]:text-[rgb(var(--elise-primary-contrast))]',
      className
    )}
    {...props}
  />
));
ToolbarButton.displayName = ToolbarPrimitive.Button.displayName;

export const ToolbarToggleGroup = ToolbarPrimitive.ToggleGroup;
export const ToolbarToggleItem = ToolbarPrimitive.ToggleItem;
export const ToolbarSeparator = React.forwardRef<
  React.ElementRef<typeof ToolbarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Separator ref={ref} className={cn('mx-1 h-6 w-px bg-border', className)} {...props} />
));
ToolbarSeparator.displayName = ToolbarPrimitive.Separator.displayName;
