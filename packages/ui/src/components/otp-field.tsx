import * as React from "react";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

export type OTPFieldProps = {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  inputClassName?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "type" | "maxLength"
>;

export const OTPField = React.forwardRef<HTMLDivElement, OTPFieldProps>(
  (
    {
      length = 6,
      value: valueProp,
      defaultValue,
      onChange,
      onComplete,
      className,
      inputClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
    const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
    const groupLabel = useElLabel("ui", "otpGroup", "Código de verificación");
    const digitLabel = useElLabel("ui", "otpDigit", "Dígito");

    const isControlled = valueProp !== undefined;
    const value = (isControlled ? valueProp : internalValue)?.slice(0, length) ?? "";

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

    // El valor siempre es contiguo (sin huecos): escribir más allá del último
    // dígito anexa al final, y pegar un código completo rellena hacia adelante.
    const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, "");
      if (!digits) {
        const arr = value.split("");
        arr.splice(index, 1);
        setValue(arr.join(""));
        return;
      }

      const start = Math.min(index, value.length);
      const nextValue = (value.slice(0, start) + digits + value.slice(start + digits.length)).slice(
        0,
        length,
      );
      setValue(nextValue);
      inputsRef.current[Math.min(nextValue.length, length - 1)]?.focus();
    };

    // Redirige el foco a la primera casilla vacía y selecciona el contenido,
    // de modo que escribir sobre una casilla llena la sobrescriba.
    const handleFocus = (index: number) => (event: React.FocusEvent<HTMLInputElement>) => {
      const firstEmpty = Math.min(value.length, length - 1);
      if (index > firstEmpty) {
        // Diferido: re-enfocar dentro del propio evento focus es revertido
        // por el navegador al completar la operación de foco original.
        setTimeout(() => inputsRef.current[firstEmpty]?.focus(), 0);
        return;
      }
      event.target.select();
    };

    const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace" && !value[index]) {
        const prev = Math.max(index - 1, 0);
        inputsRef.current[prev]?.focus();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        inputsRef.current[Math.max(index - 1, 0)]?.focus();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        inputsRef.current[Math.min(index + 1, length - 1)]?.focus();
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={groupLabel}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={`${digitLabel} ${index + 1}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            disabled={disabled}
            value={value[index] ?? ""}
            onChange={handleChange(index)}
            onFocus={handleFocus(index)}
            onKeyDown={handleKeyDown(index)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background text-center text-lg font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
              inputClassName,
            )}
          />
        ))}
      </div>
    );
  },
);

OTPField.displayName = "OTPField";
