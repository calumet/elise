import * as React from 'react';

import { cn } from '@/lib/cn';

export type OTPFieldProps = {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  inputClassName?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'maxLength'>;

export const OTPField = React.forwardRef<HTMLDivElement, OTPFieldProps>(
  ({ length = 6, value: valueProp, defaultValue, onChange, onComplete, className, inputClassName, disabled, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

    const isControlled = valueProp !== undefined;
    const value = (isControlled ? valueProp : internalValue)?.slice(0, length) ?? '';

    React.useEffect(() => {
      if (!valueProp && defaultValue) {
        setInternalValue(defaultValue.slice(0, length));
      }
    }, [defaultValue, valueProp, length]);

    const setValue = (next: string) => {
      const normalized = next.slice(0, length);
      if (!isControlled) {
        setInternalValue(normalized);
      }
      onChange?.(normalized);
      if (normalized.length === length) {
        onComplete?.(normalized);
      }
    };

    const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value.replace(/\D/g, '');
      if (!input) {
        const arr = value.split('');
        arr[index] = '';
        setValue(arr.join(''));
        return;
      }

      const chars = input.split('');
      const arr = value.padEnd(length, ' ').split('');
      arr[index] = chars[0];
      const nextValue = arr.join('').trimEnd();
      setValue(nextValue);

      const nextIndex = Math.min(index + 1, length - 1);
      inputsRef.current[nextIndex]?.focus();
    };

    const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && !value[index]) {
        const prev = Math.max(index - 1, 0);
        inputsRef.current[prev]?.focus();
      }
      if (event.key === 'ArrowLeft') {
        inputsRef.current[Math.max(index - 1, 0)]?.focus();
      }
      if (event.key === 'ArrowRight') {
        inputsRef.current[Math.min(index + 1, length - 1)]?.focus();
      }
    };

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            value={value[index] ?? ''}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background text-center text-lg font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
              inputClassName
            )}
          />
        ))}
      </div>
    );
  }
);

OTPField.displayName = 'OTPField';
