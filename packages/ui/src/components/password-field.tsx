/**
 * Campo de contraseña con el botón que la muestra y la oculta.
 *
 * @module
 */

import * as React from "react";

import { CAMPO_INVALIDO } from "./input";

import { cn } from "@/lib/cn";
import { useElLabel } from "@/lib/i18n";

/** Props de {@link PasswordField}. */
export type PasswordFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  toggleAriaLabel?: string;
};

/** Campo de contraseña con el botón que la muestra y la oculta. */
export const PasswordField: React.ForwardRefExoticComponent<
  React.PropsWithoutRef<PasswordFieldProps> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, toggleAriaLabel, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const defaultToggleLabel = useElLabel("ui", "togglePassword", "Mostrar u ocultar contraseña");
    return (
      <div data-slot="password-field" className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base text-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            CAMPO_INVALIDO,
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={toggleAriaLabel ?? defaultToggleLabel}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-[background-color,border-color,box-shadow,color] duration-(--duration-fast) ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {visible ? (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" focusable="false">
              <path
                d="M4.5 4.5 19.5 19.5M9.88 9.88a3 3 0 0 1 4.24 4.24M12 6.5c4.35 0 7.5 3.5 9 5.5-.69.91-1.53 1.82-2.49 2.63m-2.41 1.72C14.73 17.71 13.4 18 12 18c-4.35 0-7.5-3.5-9-5.5.68-.9 1.5-1.8 2.45-2.6"
                stroke="currentColor"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" focusable="false">
              <path
                d="M2.5 12.5S5.5 6.5 12 6.5s9.5 6 9.5 6-3 6-9.5 6-9.5-6-9.5-6Z"
                stroke="currentColor"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.7" fill="none" />
            </svg>
          )}
        </button>
      </div>
    );
  },
);

PasswordField.displayName = "PasswordField";
