import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { cn } from "@/lib/cn";

export const Label: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>> &
    React.RefAttributes<React.ComponentRef<typeof LabelPrimitive.Root>>
> = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    data-slot="label"
    ref={ref}
    className={cn("text-base font-medium text-foreground", className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
