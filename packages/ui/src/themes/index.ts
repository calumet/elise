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
  successForeground: string;
  warning: string;
  warningForeground: string;

  /* Tokens agregados después de la v0.2. Son opcionales para no romper los
     temas que ya se construyen como literal completo. Un tema que no los define
     deja en pie el valor del CSS. `defaultLightTheme` y `defaultDarkTheme` los
     traen, así que extenderlos con spread los incluye automáticamente. */
  borderStrong?: string;
  info?: string;
  infoForeground?: string;
  primaryHover?: string;
  primaryActive?: string;
  destructiveHover?: string;
  destructiveActive?: string;
  successHover?: string;
  successActive?: string;
  warningHover?: string;
  warningActive?: string;
  infoHover?: string;
  infoActive?: string;
  successSubtle?: string;
  successSubtleForeground?: string;
  warningSubtle?: string;
  warningSubtleForeground?: string;
  destructiveSubtle?: string;
  destructiveSubtleForeground?: string;
  infoSubtle?: string;
  infoSubtleForeground?: string;
};

export const defaultLightTheme: EliseTheme = {
  background: "oklch(0.984 0.002 265)",
  foreground: "oklch(0.21 0.012 265)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.21 0.012 265)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.21 0.012 265)",
  primary: "oklch(0.55 0.19 262)",
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.968 0.004 265)",
  secondaryForeground: "oklch(0.37 0.02 265)",
  muted: "oklch(0.965 0.004 265)",
  mutedForeground: "oklch(0.525 0.016 265)",
  accent: "oklch(0.955 0.025 250)",
  accentForeground: "oklch(0.38 0.14 262)",
  destructive: "oklch(0.577 0.225 27)",
  destructiveForeground: "oklch(1 0 0)",
  border: "oklch(0.922 0.005 265)",
  input: "oklch(0.878 0.007 265)",
  ring: "oklch(0.55 0.19 262)",
  success: "oklch(0.52 0.15 152)",
  successForeground: "oklch(1 0 0)",
  warning: "oklch(0.75 0.15 75)",
  warningForeground: "oklch(0.25 0 0)",

  borderStrong: "oklch(0.865 0.008 265)",
  info: "oklch(0.55 0.15 240)",
  infoForeground: "oklch(1 0 0)",
  primaryHover: "oklch(0.5 0.19 262)",
  primaryActive: "oklch(0.455 0.18 262)",
  destructiveHover: "oklch(0.53 0.22 27)",
  destructiveActive: "oklch(0.485 0.205 27)",
  successHover: "oklch(0.475 0.145 152)",
  successActive: "oklch(0.43 0.135 152)",
  warningHover: "oklch(0.71 0.15 75)",
  warningActive: "oklch(0.67 0.145 75)",
  infoHover: "oklch(0.5 0.15 240)",
  infoActive: "oklch(0.455 0.145 240)",
  successSubtle: "oklch(0.962 0.032 152)",
  successSubtleForeground: "oklch(0.4 0.11 152)",
  warningSubtle: "oklch(0.965 0.045 85)",
  warningSubtleForeground: "oklch(0.45 0.1 70)",
  destructiveSubtle: "oklch(0.962 0.03 25)",
  destructiveSubtleForeground: "oklch(0.45 0.17 27)",
  infoSubtle: "oklch(0.962 0.028 240)",
  infoSubtleForeground: "oklch(0.42 0.12 245)",
};

export const defaultDarkTheme: EliseTheme = {
  background: "oklch(0.172 0.008 265)",
  foreground: "oklch(0.962 0.003 265)",
  card: "oklch(0.216 0.011 265)",
  cardForeground: "oklch(0.962 0.003 265)",
  popover: "oklch(0.235 0.012 265)",
  popoverForeground: "oklch(0.962 0.003 265)",
  primary: "oklch(0.655 0.17 262)",
  primaryForeground: "oklch(0.17 0.03 262)",
  secondary: "oklch(0.262 0.012 265)",
  secondaryForeground: "oklch(0.93 0.005 265)",
  muted: "oklch(0.262 0.012 265)",
  mutedForeground: "oklch(0.685 0.014 265)",
  accent: "oklch(0.33 0.09 262)",
  accentForeground: "oklch(0.89 0.06 255)",
  destructive: "oklch(0.577 0.225 27)",
  destructiveForeground: "oklch(1 0 0)",
  border: "oklch(0.302 0.013 265)",
  input: "oklch(0.36 0.015 265)",
  ring: "oklch(0.655 0.17 262)",
  success: "oklch(0.68 0.15 152)",
  successForeground: "oklch(0.16 0.03 152)",
  warning: "oklch(0.8 0.14 75)",
  warningForeground: "oklch(0.22 0.04 75)",

  borderStrong: "oklch(0.38 0.016 265)",
  info: "oklch(0.68 0.14 240)",
  infoForeground: "oklch(0.16 0.03 240)",
  primaryHover: "oklch(0.705 0.165 262)",
  primaryActive: "oklch(0.75 0.15 262)",
  destructiveHover: "oklch(0.53 0.22 27)",
  destructiveActive: "oklch(0.485 0.205 27)",
  successHover: "oklch(0.73 0.145 152)",
  successActive: "oklch(0.775 0.135 152)",
  warningHover: "oklch(0.845 0.135 75)",
  warningActive: "oklch(0.885 0.12 75)",
  infoHover: "oklch(0.73 0.135 240)",
  infoActive: "oklch(0.775 0.125 240)",
  successSubtle: "oklch(0.28 0.05 152)",
  successSubtleForeground: "oklch(0.86 0.12 152)",
  warningSubtle: "oklch(0.3 0.05 75)",
  warningSubtleForeground: "oklch(0.88 0.11 82)",
  destructiveSubtle: "oklch(0.285 0.06 27)",
  destructiveSubtleForeground: "oklch(0.85 0.11 27)",
  infoSubtle: "oklch(0.285 0.055 240)",
  infoSubtleForeground: "oklch(0.85 0.1 240)",
};

export const applyTheme = (
  theme: EliseTheme,
  element: HTMLElement = document.documentElement,
): void => {
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
  element.style.setProperty("--success-foreground", theme.successForeground);
  element.style.setProperty("--warning", theme.warning);
  element.style.setProperty("--warning-foreground", theme.warningForeground);

  /* Los opcionales solo se escriben si el tema los define, de modo que un tema
     parcial no borra los valores que ya vienen del CSS. */
  const optional: Array<[string, string | undefined]> = [
    ["--border-strong", theme.borderStrong],
    ["--info", theme.info],
    ["--info-foreground", theme.infoForeground],
    ["--primary-hover", theme.primaryHover],
    ["--primary-active", theme.primaryActive],
    ["--destructive-hover", theme.destructiveHover],
    ["--destructive-active", theme.destructiveActive],
    ["--success-hover", theme.successHover],
    ["--success-active", theme.successActive],
    ["--warning-hover", theme.warningHover],
    ["--warning-active", theme.warningActive],
    ["--info-hover", theme.infoHover],
    ["--info-active", theme.infoActive],
    ["--success-subtle", theme.successSubtle],
    ["--success-subtle-foreground", theme.successSubtleForeground],
    ["--warning-subtle", theme.warningSubtle],
    ["--warning-subtle-foreground", theme.warningSubtleForeground],
    ["--destructive-subtle", theme.destructiveSubtle],
    ["--destructive-subtle-foreground", theme.destructiveSubtleForeground],
    ["--info-subtle", theme.infoSubtle],
    ["--info-subtle-foreground", theme.infoSubtleForeground],
  ];

  for (const [property, value] of optional) {
    if (value !== undefined) element.style.setProperty(property, value);
  }
};
