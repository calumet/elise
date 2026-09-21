/* Generado por scripts/generate-tokens.mjs desde la hoja de @calumet/elise-ui.
   No editar a mano: el próximo build lo sobrescribe. */

/** Una variable de tema de Elise. */
export type EliseVar =
  | "--background"
  | "--foreground"
  | "--card"
  | "--card-foreground"
  | "--canvas"
  | "--inverse"
  | "--inverse-foreground"
  | "--inverse-muted-foreground"
  | "--inverse-info"
  | "--inverse-success"
  | "--inverse-warning"
  | "--inverse-danger"
  | "--inverse-border-subtle"
  | "--inverse-border"
  | "--inverse-input"
  | "--inverse-border-strong"
  | "--popover"
  | "--popover-foreground"
  | "--primary"
  | "--primary-foreground"
  | "--secondary"
  | "--secondary-foreground"
  | "--muted"
  | "--muted-foreground"
  | "--fill-tertiary"
  | "--fill-tertiary-hover"
  | "--fill-tertiary-active"
  | "--state-hover"
  | "--state-active"
  | "--track"
  | "--accent"
  | "--accent-foreground"
  | "--destructive"
  | "--destructive-foreground"
  | "--border-subtle"
  | "--border"
  | "--border-strong"
  | "--input"
  | "--ring"
  | "--link"
  | "--link-hover"
  | "--link-active"
  | "--chart-1"
  | "--chart-2"
  | "--chart-3"
  | "--chart-4"
  | "--chart-5"
  | "--sidebar"
  | "--sidebar-foreground"
  | "--sidebar-muted-foreground"
  | "--sidebar-primary"
  | "--sidebar-primary-foreground"
  | "--sidebar-hover"
  | "--sidebar-accent"
  | "--sidebar-accent-foreground"
  | "--sidebar-border"
  | "--sidebar-guide"
  | "--sidebar-guide-hover"
  | "--sidebar-ring"
  | "--success"
  | "--success-foreground"
  | "--warning"
  | "--warning-foreground"
  | "--info"
  | "--info-foreground"
  | "--primary-hover"
  | "--primary-active"
  | "--destructive-hover"
  | "--destructive-active"
  | "--success-hover"
  | "--success-active"
  | "--warning-hover"
  | "--warning-active"
  | "--info-hover"
  | "--info-active"
  | "--success-subtle"
  | "--success-subtle-foreground"
  | "--warning-subtle"
  | "--warning-subtle-foreground"
  | "--destructive-subtle"
  | "--destructive-subtle-foreground"
  | "--info-subtle"
  | "--info-subtle-foreground"
  | "--font-sans"
  | "--font-serif"
  | "--font-display"
  | "--font-mono"
  | "--radius"
  | "--duration-fast"
  | "--duration-base"
  | "--duration-slow"
  | "--z-sticky"
  | "--z-overlay"
  | "--z-modal"
  | "--z-popover"
  | "--z-tooltip"
  | "--z-toast"
  | "--shadow-2xs"
  | "--shadow-xs"
  | "--shadow-sm"
  | "--shadow"
  | "--shadow-md"
  | "--shadow-lg"
  | "--shadow-xl"
  | "--shadow-2xl"
  | "--shadow-bevel"
  | "--shadow-bevel-inset"
  | "--shadow-surface"
  | "--shadow-surface-bevel"
  | "--spacing";

/** Qué clase de valor lleva una variable, para pintarle su control en un editor. */
export type TokenKind = "color" | "size" | "shadow" | "other";

/** El tema claro, tal como lo define la hoja. */
export const lightTheme: Record<EliseVar, string> = {
  "--background": "oklch(0.984 0.002 265)",
  "--foreground": "oklch(0.21 0.012 265)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.21 0.012 265)",
  "--canvas": "oklch(0.958 0.002 265)",
  "--inverse": "var(--foreground)",
  "--inverse-foreground": "var(--background)",
  "--inverse-muted-foreground": "oklch(0.65 0.014 265)",
  "--inverse-info": "oklch(0.85 0.1 240)",
  "--inverse-success": "oklch(0.86 0.095 155)",
  "--inverse-warning": "oklch(0.86 0.085 62)",
  "--inverse-danger": "oklch(0.85 0.09 27)",
  "--inverse-border-subtle": "oklch(0.282 0.013 265)",
  "--inverse-border": "oklch(0.3 0.013 265)",
  "--inverse-input": "oklch(0.344 0.013 265)",
  "--inverse-border-strong": "oklch(0.357 0.013 265)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.21 0.012 265)",
  "--primary": "oklch(0.252 0.156 265)",
  "--primary-foreground": "oklch(1 0 0)",
  "--secondary": "oklch(0.958 0.002 265)",
  "--secondary-foreground": "oklch(0.37 0.02 265)",
  "--muted": "oklch(0.976 0.004 265)",
  "--muted-foreground": "oklch(0.525 0.016 265)",
  "--fill-tertiary": "oklch(0.94 0.004 265)",
  "--fill-tertiary-hover": "oklch(0.87 0.006 265)",
  "--fill-tertiary-active": "oklch(0.845 0.007 265)",
  "--state-hover": "rgb(0 0 0 / 3%)",
  "--state-active": "rgb(0 0 0 / 6%)",
  "--track": "oklch(0.66 0.008 265)",
  "--accent": "oklch(0.95 0.024 265)",
  "--accent-foreground": "oklch(0.3 0.14 265)",
  "--destructive": "oklch(0.479 0.175 27)",
  "--destructive-foreground": "oklch(1 0 0)",
  "--border-subtle": "oklch(0.94 0.004 265)",
  "--border": "oklch(0.922 0.005 265)",
  "--border-strong": "oklch(0.865 0.008 265)",
  "--input": "oklch(0.878 0.007 265)",
  "--ring": "oklch(0.252 0.156 265)",
  "--link": "oklch(0.38 0.155 265)",
  "--link-hover": "oklch(0.32 0.152 265)",
  "--link-active": "oklch(0.27 0.15 265)",
  "--chart-1": "oklch(0.62 0.14 265)",
  "--chart-2": "oklch(0.52 0.15 265)",
  "--chart-3": "oklch(0.42 0.155 265)",
  "--chart-4": "oklch(0.34 0.15 265)",
  "--chart-5": "oklch(0.252 0.156 265)",
  "--sidebar": "oklch(0.94 0.003 265)",
  "--sidebar-foreground": "oklch(0.21 0.012 265)",
  "--sidebar-muted-foreground": "oklch(0.49 0.016 265)",
  "--sidebar-primary": "oklch(0.252 0.156 265)",
  "--sidebar-primary-foreground": "oklch(1 0 0)",
  "--sidebar-hover": "oklch(0.958 0.002 265)",
  "--sidebar-accent": "oklch(0.985 0.001 265)",
  "--sidebar-accent-foreground": "oklch(0.21 0.012 265)",
  "--sidebar-border": "oklch(0.894 0.003 265)",
  "--sidebar-guide": "oklch(0.773 0 0)",
  "--sidebar-guide-hover": "oklch(0.845 0 0)",
  "--sidebar-ring": "oklch(0.252 0.156 265)",
  "--success": "oklch(0.52 0.115 155)",
  "--success-foreground": "oklch(1 0 0)",
  "--warning": "oklch(0.532 0.112 56)",
  "--warning-foreground": "oklch(1 0 0)",
  "--info": "oklch(0.55 0.15 240)",
  "--info-foreground": "oklch(1 0 0)",
  "--primary-hover": "oklch(0.3 0.152 265)",
  "--primary-active": "oklch(0.34 0.15 265)",
  "--destructive-hover": "oklch(0.44 0.17 27)",
  "--destructive-active": "oklch(0.4 0.162 27)",
  "--success-hover": "oklch(0.48 0.112 155)",
  "--success-active": "oklch(0.44 0.105 155)",
  "--warning-hover": "oklch(0.492 0.11 56)",
  "--warning-active": "oklch(0.452 0.105 56)",
  "--info-hover": "oklch(0.5 0.15 240)",
  "--info-active": "oklch(0.455 0.145 240)",
  "--success-subtle": "oklch(0.962 0.026 155)",
  "--success-subtle-foreground": "oklch(0.4 0.09 155)",
  "--warning-subtle": "oklch(0.958 0.035 62)",
  "--warning-subtle-foreground": "oklch(0.44 0.095 56)",
  "--destructive-subtle": "oklch(0.962 0.028 27)",
  "--destructive-subtle-foreground": "oklch(0.43 0.145 27)",
  "--info-subtle": "oklch(0.962 0.028 240)",
  "--info-subtle-foreground": "oklch(0.42 0.12 245)",
  "--font-sans":
    '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  "--font-serif": '"Source Serif 4 Variable", "Source Serif 4", ui-serif, Georgia, serif',
  "--font-display": "var(--font-sans)",
  "--font-mono":
    '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  "--radius": "0.5rem",
  "--duration-fast": "140ms",
  "--duration-base": "200ms",
  "--duration-slow": "320ms",
  "--z-sticky": "10",
  "--z-overlay": "40",
  "--z-modal": "50",
  "--z-popover": "60",
  "--z-tooltip": "70",
  "--z-toast": "80",
  "--shadow-2xs": "0 1px 1px -0.5px oklch(0.21 0.02 265 / 0.04)",
  "--shadow-xs": "0 1px 2px -1px oklch(0.21 0.02 265 / 0.06)",
  "--shadow-sm":
    "0 1px 2px -1px oklch(0.21 0.02 265 / 0.1), 0 2px 6px -2px oklch(0.21 0.02 265 / 0.09)",
  "--shadow":
    "0 2px 4px -2px oklch(0.21 0.02 265 / 0.1), 0 4px 8px -2px oklch(0.21 0.02 265 / 0.1)",
  "--shadow-md":
    "0 2px 4px -2px oklch(0.21 0.02 265 / 0.1), 0 6px 12px -3px oklch(0.21 0.02 265 / 0.12)",
  "--shadow-lg":
    "0 4px 8px -3px oklch(0.21 0.02 265 / 0.12), 0 14px 28px -8px oklch(0.21 0.02 265 / 0.16)",
  "--shadow-xl":
    "0 8px 16px -4px oklch(0.21 0.02 265 / 0.14), 0 24px 44px -12px oklch(0.21 0.02 265 / 0.2)",
  "--shadow-2xl":
    "0 12px 24px -6px oklch(0.21 0.02 265 / 0.16), 0 36px 64px -16px oklch(0.21 0.02 265 / 0.26)",
  "--shadow-bevel": "inset 0 1px 0 oklch(1 0 0 / 0.2), inset 0 -1px 0 oklch(0 0 0 / 0.16)",
  "--shadow-bevel-inset": "inset 0 2px 3px oklch(0 0 0 / 0.22), inset 0 1px 0 oklch(0 0 0 / 0.14)",
  "--shadow-surface": "0 1px 0 0 oklch(0.21 0.02 265 / 0.07)",
  "--shadow-surface-bevel":
    "inset 1px 0 0 0 oklch(0 0 0 / 0.13), inset -1px 0 0 0 oklch(0 0 0 / 0.13), inset 0 -1px 0 0 oklch(0 0 0 / 0.17), inset 0 1px 0 0 oklch(0.845 0 0 / 0.5)",
  "--spacing": "0.25rem",
};

/** El tema oscuro, con las 87 variables que redefine ya aplicadas sobre el claro. */
export const darkTheme: Record<EliseVar, string> = {
  "--background": "oklch(0.172 0.008 265)",
  "--foreground": "oklch(0.962 0.003 265)",
  "--card": "oklch(0.216 0.011 265)",
  "--card-foreground": "oklch(0.962 0.003 265)",
  "--canvas": "oklch(0.206 0.011 265)",
  "--inverse": "oklch(0.262 0.012 265)",
  "--inverse-foreground": "oklch(0.962 0.003 265)",
  "--inverse-muted-foreground": "var(--muted-foreground)",
  "--inverse-info": "oklch(0.85 0.1 240)",
  "--inverse-success": "oklch(0.86 0.095 155)",
  "--inverse-warning": "oklch(0.86 0.085 62)",
  "--inverse-danger": "oklch(0.85 0.09 27)",
  "--inverse-border-subtle": "oklch(0.282 0.013 265)",
  "--inverse-border": "oklch(0.3 0.013 265)",
  "--inverse-input": "oklch(0.344 0.013 265)",
  "--inverse-border-strong": "oklch(0.357 0.013 265)",
  "--popover": "oklch(0.235 0.012 265)",
  "--popover-foreground": "oklch(0.962 0.003 265)",
  "--primary": "oklch(0.42 0.156 265)",
  "--primary-foreground": "oklch(1 0 0)",
  "--secondary": "oklch(0.206 0.011 265)",
  "--secondary-foreground": "oklch(0.93 0.005 265)",
  "--muted": "oklch(0.262 0.012 265)",
  "--muted-foreground": "oklch(0.685 0.014 265)",
  "--fill-tertiary": "oklch(0.29 0.013 265)",
  "--fill-tertiary-hover": "oklch(0.355 0.015 265)",
  "--fill-tertiary-active": "oklch(0.39 0.016 265)",
  "--state-hover": "rgb(255 255 255 / 5%)",
  "--state-active": "rgb(255 255 255 / 9%)",
  "--track": "oklch(0.55 0.014 265)",
  "--accent": "oklch(0.3 0.085 265)",
  "--accent-foreground": "oklch(0.88 0.06 262)",
  "--destructive": "oklch(0.55 0.172 27)",
  "--destructive-foreground": "oklch(1 0 0)",
  "--border-subtle": "oklch(0.26 0.012 265)",
  "--border": "oklch(0.302 0.013 265)",
  "--border-strong": "oklch(0.38 0.016 265)",
  "--input": "oklch(0.36 0.015 265)",
  "--ring": "oklch(0.65 0.15 265)",
  "--link": "oklch(0.72 0.13 265)",
  "--link-hover": "oklch(0.78 0.12 265)",
  "--link-active": "oklch(0.83 0.1 265)",
  "--chart-1": "oklch(0.72 0.125 265)",
  "--chart-2": "oklch(0.63 0.14 265)",
  "--chart-3": "oklch(0.54 0.15 265)",
  "--chart-4": "oklch(0.45 0.155 265)",
  "--chart-5": "oklch(0.36 0.15 265)",
  "--sidebar": "oklch(0.196 0.01 265)",
  "--sidebar-foreground": "oklch(0.945 0.004 265)",
  "--sidebar-muted-foreground": "var(--muted-foreground)",
  "--sidebar-primary": "oklch(0.42 0.156 265)",
  "--sidebar-primary-foreground": "oklch(1 0 0)",
  "--sidebar-hover": "oklch(0.235 0.012 265)",
  "--sidebar-accent": "oklch(0.268 0.013 265)",
  "--sidebar-accent-foreground": "oklch(0.945 0.004 265)",
  "--sidebar-border": "oklch(0.302 0.013 265)",
  "--sidebar-guide": "oklch(0.44 0.014 265)",
  "--sidebar-guide-hover": "oklch(0.355 0.013 265)",
  "--sidebar-ring": "oklch(0.65 0.15 265)",
  "--success": "oklch(0.52 0.115 155)",
  "--success-foreground": "oklch(1 0 0)",
  "--warning": "oklch(0.532 0.112 56)",
  "--warning-foreground": "oklch(1 0 0)",
  "--info": "oklch(0.68 0.14 240)",
  "--info-foreground": "oklch(0.16 0.03 240)",
  "--primary-hover": "oklch(0.47 0.152 265)",
  "--primary-active": "oklch(0.52 0.148 265)",
  "--destructive-hover": "oklch(0.595 0.17 27)",
  "--destructive-active": "oklch(0.64 0.16 27)",
  "--success-hover": "oklch(0.565 0.115 155)",
  "--success-active": "oklch(0.61 0.112 155)",
  "--warning-hover": "oklch(0.577 0.112 56)",
  "--warning-active": "oklch(0.62 0.11 56)",
  "--info-hover": "oklch(0.73 0.135 240)",
  "--info-active": "oklch(0.775 0.125 240)",
  "--success-subtle": "oklch(0.28 0.04 155)",
  "--success-subtle-foreground": "oklch(0.86 0.095 155)",
  "--warning-subtle": "oklch(0.3 0.042 56)",
  "--warning-subtle-foreground": "oklch(0.86 0.085 62)",
  "--destructive-subtle": "oklch(0.285 0.05 27)",
  "--destructive-subtle-foreground": "oklch(0.85 0.09 27)",
  "--info-subtle": "oklch(0.285 0.055 240)",
  "--info-subtle-foreground": "oklch(0.85 0.1 240)",
  "--font-sans":
    '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  "--font-serif": '"Source Serif 4 Variable", "Source Serif 4", ui-serif, Georgia, serif',
  "--font-display": "var(--font-sans)",
  "--font-mono":
    '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  "--radius": "0.5rem",
  "--duration-fast": "140ms",
  "--duration-base": "200ms",
  "--duration-slow": "320ms",
  "--z-sticky": "10",
  "--z-overlay": "40",
  "--z-modal": "50",
  "--z-popover": "60",
  "--z-tooltip": "70",
  "--z-toast": "80",
  "--shadow-2xs": "0 1px 1px -0.5px oklch(0 0 0 / 0.3)",
  "--shadow-xs": "0 1px 2px -1px oklch(0 0 0 / 0.4)",
  "--shadow-sm": "0 1px 2px -1px oklch(0 0 0 / 0.5), 0 2px 6px -2px oklch(0 0 0 / 0.45)",
  "--shadow": "0 2px 4px -2px oklch(0 0 0 / 0.5), 0 4px 10px -3px oklch(0 0 0 / 0.5)",
  "--shadow-md": "0 2px 4px -2px oklch(0 0 0 / 0.5), 0 6px 14px -3px oklch(0 0 0 / 0.55)",
  "--shadow-lg": "0 4px 10px -3px oklch(0 0 0 / 0.55), 0 14px 30px -8px oklch(0 0 0 / 0.6)",
  "--shadow-xl": "0 8px 18px -4px oklch(0 0 0 / 0.6), 0 24px 48px -12px oklch(0 0 0 / 0.65)",
  "--shadow-2xl": "0 12px 26px -6px oklch(0 0 0 / 0.65), 0 36px 68px -16px oklch(0 0 0 / 0.72)",
  "--shadow-bevel": "inset 0 1px 0 oklch(1 0 0 / 0.16), inset 0 -1px 0 oklch(0 0 0 / 0.3)",
  "--shadow-bevel-inset": "inset 0 2px 4px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(0 0 0 / 0.25)",
  "--shadow-surface": "0 1px 0 0 oklch(0 0 0 / 0.4)",
  "--shadow-surface-bevel":
    "inset 1px 0 0 0 oklch(0.845 0 0 / 0.08), inset -1px 0 0 0 oklch(0.845 0 0 / 0.08), inset 0 -1px 0 0 oklch(0.845 0 0 / 0.08), inset 0 1px 0 0 oklch(0.845 0 0 / 0.16)",
  "--spacing": "0.25rem",
};

/** La clase de valor de cada variable. */
export const tokenKinds: Record<EliseVar, TokenKind> = {
  "--background": "color",
  "--foreground": "color",
  "--card": "color",
  "--card-foreground": "color",
  "--canvas": "color",
  "--inverse": "color",
  "--inverse-foreground": "color",
  "--inverse-muted-foreground": "color",
  "--inverse-info": "color",
  "--inverse-success": "color",
  "--inverse-warning": "color",
  "--inverse-danger": "color",
  "--inverse-border-subtle": "color",
  "--inverse-border": "color",
  "--inverse-input": "color",
  "--inverse-border-strong": "color",
  "--popover": "color",
  "--popover-foreground": "color",
  "--primary": "color",
  "--primary-foreground": "color",
  "--secondary": "color",
  "--secondary-foreground": "color",
  "--muted": "color",
  "--muted-foreground": "color",
  "--fill-tertiary": "color",
  "--fill-tertiary-hover": "color",
  "--fill-tertiary-active": "color",
  "--state-hover": "color",
  "--state-active": "color",
  "--track": "color",
  "--accent": "color",
  "--accent-foreground": "color",
  "--destructive": "color",
  "--destructive-foreground": "color",
  "--border-subtle": "color",
  "--border": "color",
  "--border-strong": "color",
  "--input": "color",
  "--ring": "color",
  "--link": "color",
  "--link-hover": "color",
  "--link-active": "color",
  "--chart-1": "color",
  "--chart-2": "color",
  "--chart-3": "color",
  "--chart-4": "color",
  "--chart-5": "color",
  "--sidebar": "color",
  "--sidebar-foreground": "color",
  "--sidebar-muted-foreground": "color",
  "--sidebar-primary": "color",
  "--sidebar-primary-foreground": "color",
  "--sidebar-hover": "color",
  "--sidebar-accent": "color",
  "--sidebar-accent-foreground": "color",
  "--sidebar-border": "color",
  "--sidebar-guide": "color",
  "--sidebar-guide-hover": "color",
  "--sidebar-ring": "color",
  "--success": "color",
  "--success-foreground": "color",
  "--warning": "color",
  "--warning-foreground": "color",
  "--info": "color",
  "--info-foreground": "color",
  "--primary-hover": "color",
  "--primary-active": "color",
  "--destructive-hover": "color",
  "--destructive-active": "color",
  "--success-hover": "color",
  "--success-active": "color",
  "--warning-hover": "color",
  "--warning-active": "color",
  "--info-hover": "color",
  "--info-active": "color",
  "--success-subtle": "color",
  "--success-subtle-foreground": "color",
  "--warning-subtle": "color",
  "--warning-subtle-foreground": "color",
  "--destructive-subtle": "color",
  "--destructive-subtle-foreground": "color",
  "--info-subtle": "color",
  "--info-subtle-foreground": "color",
  "--font-sans": "other",
  "--font-serif": "other",
  "--font-display": "other",
  "--font-mono": "other",
  "--radius": "size",
  "--duration-fast": "other",
  "--duration-base": "other",
  "--duration-slow": "other",
  "--z-sticky": "other",
  "--z-overlay": "other",
  "--z-modal": "other",
  "--z-popover": "other",
  "--z-tooltip": "other",
  "--z-toast": "other",
  "--shadow-2xs": "shadow",
  "--shadow-xs": "shadow",
  "--shadow-sm": "shadow",
  "--shadow": "shadow",
  "--shadow-md": "shadow",
  "--shadow-lg": "shadow",
  "--shadow-xl": "shadow",
  "--shadow-2xl": "shadow",
  "--shadow-bevel": "shadow",
  "--shadow-bevel-inset": "shadow",
  "--shadow-surface": "shadow",
  "--shadow-surface-bevel": "shadow",
  "--spacing": "size",
};

/** Una familia que @calumet/elise-ui lleva autoalojada. */
export type FontFamily = { id: string; label: string; stack: string };

/**
 * Las familias que sirve la hoja, con su entrada en
 * `@calumet/elise-ui/tailwind/fonts/<id>.css`. La app importa las que ofrezca.
 */
export const FONT_FAMILIES: readonly FontFamily[] = [
  { id: "geist", label: "Geist", stack: '"Geist Variable", ui-sans-serif, sans-serif' },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    stack: '"JetBrains Mono Variable", ui-monospace, monospace',
  },
  {
    id: "source-serif-4",
    label: "Source Serif 4",
    stack: '"Source Serif 4 Variable", ui-serif, Georgia, serif',
  },
  { id: "archivo", label: "Archivo", stack: '"Archivo Variable", ui-sans-serif, sans-serif' },
  {
    id: "bricolage-grotesque",
    label: "Bricolage Grotesque",
    stack: '"Bricolage Grotesque Variable", ui-sans-serif, sans-serif',
  },
  {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    stack: '"IBM Plex Sans Variable", ui-sans-serif, sans-serif',
  },
  { id: "manrope", label: "Manrope", stack: '"Manrope Variable", ui-sans-serif, sans-serif' },
  {
    id: "newsreader",
    label: "Newsreader",
    stack: '"Newsreader Variable", ui-serif, Georgia, serif',
  },
  {
    id: "public-sans",
    label: "Public Sans",
    stack: '"Public Sans Variable", ui-sans-serif, sans-serif',
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    stack: '"Space Grotesk Variable", ui-sans-serif, sans-serif',
  },
];
