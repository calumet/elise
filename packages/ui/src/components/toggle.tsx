import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';

import { cn } from '@/lib/cn';

export const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 text-base font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=on]:bg-primary data-[state=on]:text-primary-contrast',
        className
      )}
      {...props}
    />
  )
);

Toggle.displayName = TogglePrimitive.Root.displayName;
