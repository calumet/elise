import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-tight rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed';

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  solid:
    'bg-accent text-[rgb(var(--elise-accent-contrast))] hover:bg-accentHover active:bg-accentActive shadow-soft',
  outline:
    'border-2 border-border text-foreground hover:border-borderStrong hover:bg-muted active:border-borderStrong active:bg-muted',
  ghost: 'text-foreground hover:bg-muted active:bg-muted'
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} {...props} />
    );
  }
);

Button.displayName = 'Button';
