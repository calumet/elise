import {
  amber,
  amberDark,
  grass,
  grassDark,
  slate,
  slateDark,
  tomato,
  tomatoDark
} from '@radix-ui/colors';

type ColorScale = Record<string, string>;

type ColorTokens = {
  surface: string;
  surfaceRaised: string;
  surfaceHover: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentActive: string;
  accentContrast: string;
  success: string;
  warning: string;
  danger: string;
  focus: string;
  overlay: string;
};

type RadiiTokens = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  pill: string;
};

type ShadowTokens = {
  soft: string;
  floating: string;
};

type FontTokens = {
  sans: string;
  mono: string;
};

export type EliseThemeTokens = {
  colors: ColorTokens;
  radii: RadiiTokens;
  shadows: ShadowTokens;
  fonts: FontTokens;
};

const hexToRgbValues = (hex: string) => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized.length === 3 ? normalized.repeat(2) : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
};

const colorStep = (scale: ColorScale, step: number) => {
  const [firstKey] = Object.keys(scale);
  const prefix = firstKey.replace(/\d+$/, '');
  const value = scale[`${prefix}${step}`];
  return hexToRgbValues(value);
};

const colorsFromScale = (
  neutral: ColorScale,
  accent: ColorScale,
  successScale: ColorScale,
  warningScale: ColorScale,
  dangerScale: ColorScale
): ColorTokens => ({
  surface: colorStep(neutral, 1),
  surfaceRaised: colorStep(neutral, 3),
  surfaceHover: colorStep(neutral, 4),
  border: colorStep(neutral, 6),
  borderStrong: colorStep(neutral, 8),
  text: colorStep(neutral, 12),
  textMuted: colorStep(neutral, 11),
  accent: colorStep(accent, 9),
  accentHover: colorStep(accent, 10),
  accentActive: colorStep(accent, 11),
  accentContrast: colorStep(neutral, 1),
  success: colorStep(successScale, 10),
  warning: colorStep(warningScale, 10),
  danger: colorStep(dangerScale, 10),
  focus: '124 167 255',
  overlay: '15 23 42'
});

export const lightThemeTokens: EliseThemeTokens = {
  colors: colorsFromScale(slate, grass, grass, amber, tomato),
  radii: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '18px',
    pill: '999px'
  },
  shadows: {
    soft: '0 10px 30px -18px rgba(15, 23, 42, 0.45)',
    floating: '0 18px 60px -22px rgba(15, 23, 42, 0.55)'
  },
  fonts: {
    sans: "'Space Grotesk', 'Satoshi', 'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace"
  }
};

export const darkThemeTokens: EliseThemeTokens = {
  colors: colorsFromScale(slateDark, grassDark, grassDark, amberDark, tomatoDark),
  radii: lightThemeTokens.radii,
  shadows: {
    soft: '0 10px 30px -18px rgba(0, 0, 0, 0.55)',
    floating: '0 18px 60px -22px rgba(0, 0, 0, 0.65)'
  },
  fonts: lightThemeTokens.fonts
};

export const buildCssVariables = (tokens: EliseThemeTokens) => ({
  '--elise-surface': tokens.colors.surface,
  '--elise-surface-raised': tokens.colors.surfaceRaised,
  '--elise-surface-hover': tokens.colors.surfaceHover,
  '--elise-border': tokens.colors.border,
  '--elise-border-strong': tokens.colors.borderStrong,
  '--elise-text': tokens.colors.text,
  '--elise-text-muted': tokens.colors.textMuted,
  '--elise-accent': tokens.colors.accent,
  '--elise-accent-hover': tokens.colors.accentHover,
  '--elise-accent-active': tokens.colors.accentActive,
  '--elise-accent-contrast': tokens.colors.accentContrast,
  '--elise-success': tokens.colors.success,
  '--elise-warning': tokens.colors.warning,
  '--elise-danger': tokens.colors.danger,
  '--elise-focus': tokens.colors.focus,
  '--elise-overlay': tokens.colors.overlay,
  '--elise-radius-xs': tokens.radii.xs,
  '--elise-radius-sm': tokens.radii.sm,
  '--elise-radius-md': tokens.radii.md,
  '--elise-radius-lg': tokens.radii.lg,
  '--elise-radius-pill': tokens.radii.pill,
  '--elise-shadow-soft': tokens.shadows.soft,
  '--elise-shadow-floating': tokens.shadows.floating,
  '--elise-font-sans': tokens.fonts.sans,
  '--elise-font-mono': tokens.fonts.mono
});
