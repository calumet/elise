export type EliseTheme = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  warning: string;
};

export const defaultLightTheme: EliseTheme = {
  background: "oklch(1.00 0 0)",
  foreground: "oklch(0.32 0 0)",
  card: "oklch(1.00 0 0)",
  cardForeground: "oklch(0.32 0 0)",
  popover: "oklch(1.00 0 0)",
  popoverForeground: "oklch(0.32 0 0)",
  primary: "oklch(0.62 0.19 259.76)",
  primaryForeground: "oklch(1.00 0 0)",
  secondary: "oklch(0.97 0 0)",
  secondaryForeground: "oklch(0.45 0.03 257.68)",
  muted: "oklch(0.98 0 0)",
  mutedForeground: "oklch(0.55 0.02 264.41)",
  accent: "oklch(0.95 0.03 233.56)",
  accentForeground: "oklch(0.38 0.14 265.59)",
  destructive: "oklch(0.64 0.21 25.39)",
  destructiveForeground: "oklch(1.00 0 0)",
  border: "oklch(0.93 0.01 261.82)",
  input: "oklch(0.93 0.01 261.82)",
  ring: "oklch(0.62 0.19 259.76)",
  success: "oklch(0.60 0.15 145)",
  warning: "oklch(0.75 0.15 75)",
};

export const defaultDarkTheme: EliseTheme = {
  background: "oklch(0.20 0 0)",
  foreground: "oklch(0.92 0 0)",
  card: "oklch(0.27 0 0)",
  cardForeground: "oklch(0.92 0 0)",
  popover: "oklch(0.27 0 0)",
  popoverForeground: "oklch(0.92 0 0)",
  primary: "oklch(0.62 0.19 259.76)",
  primaryForeground: "oklch(1.00 0 0)",
  secondary: "oklch(0.27 0 0)",
  secondaryForeground: "oklch(0.92 0 0)",
  muted: "oklch(0.27 0 0)",
  mutedForeground: "oklch(0.72 0 0)",
  accent: "oklch(0.38 0.14 265.59)",
  accentForeground: "oklch(0.88 0.06 254.63)",
  destructive: "oklch(0.64 0.21 25.39)",
  destructiveForeground: "oklch(1.00 0 0)",
  border: "oklch(0.37 0 0)",
  input: "oklch(0.37 0 0)",
  ring: "oklch(0.62 0.19 259.76)",
  success: "oklch(0.60 0.15 145)",
  warning: "oklch(0.75 0.15 75)",
};

export const applyTheme = (theme: EliseTheme, element: HTMLElement = document.documentElement) => {
  element.style.setProperty("--background", theme.background);
  element.style.setProperty("--foreground", theme.foreground);
  element.style.setProperty("--card", theme.card);
  element.style.setProperty("--card-foreground", theme.cardForeground);
  element.style.setProperty("--popover", theme.popover);
  element.style.setProperty("--popover-foreground", theme.popoverForeground);
  element.style.setProperty("--primary", theme.primary);
  element.style.setProperty("--primary-foreground", theme.primaryForeground);
  element.style.setProperty("--secondary", theme.secondary);
  element.style.setProperty("--secondary-foreground", theme.secondaryForeground);
  element.style.setProperty("--muted", theme.muted);
  element.style.setProperty("--muted-foreground", theme.mutedForeground);
  element.style.setProperty("--accent", theme.accent);
  element.style.setProperty("--accent-foreground", theme.accentForeground);
  element.style.setProperty("--destructive", theme.destructive);
  element.style.setProperty("--destructive-foreground", theme.destructiveForeground);
  element.style.setProperty("--border", theme.border);
  element.style.setProperty("--input", theme.input);
  element.style.setProperty("--ring", theme.ring);
  element.style.setProperty("--success", theme.success);
  element.style.setProperty("--warning", theme.warning);
};
