import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';

  asChild?: boolean;
};

const baseClasses =
  'relative inline-flex items-center justify-center gap-2 text-center font-semibold tracking-tight rounded-sm border border-transparent overflow-hidden transition-colors duration-200 outline-offset-4 hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-focus focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-border';

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  solid:
    'bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-active',
  outline:
    'border border-border text-foreground hover:bg-muted active:border-border-strong active:bg-muted',
  ghost: 'text-foreground hover:bg-muted active:bg-muted'
};

export const buttonVariants = ({ variant }: { variant: ButtonProps['variant'] }) => {
  if (!variant) return baseClasses;
  return cn(baseClasses, variantClasses[variant]);
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-base',
  icon: 'size-9',
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
