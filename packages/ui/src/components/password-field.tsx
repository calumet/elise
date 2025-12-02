import * as React from "react";

import { cn } from "@/lib/cn";

export type PasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  toggleAriaLabel?: string;
};

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, toggleAriaLabel = "Mostrar u ocultar contraseña", ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "flex h-10 w-full rounded-sm border border-border bg-background px-3 py-2 pr-10 text-base text-foreground transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={toggleAriaLabel}
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-2 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {visible ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
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
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
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
