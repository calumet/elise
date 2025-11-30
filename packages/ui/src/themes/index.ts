export type EliseTheme = {
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

export const defaultLightTheme: EliseTheme = {
  surface: '#fcfcfd',
  surfaceRaised: '#f0f0f3',
  surfaceHover: '#e8e8ec',
  border: '#d9d9e0',
  borderStrong: '#b9bbc6',
  text: '#1e1f24',
  textMuted: '#62636c',
  accent: '#46a758',
  accentHover: '#3d9a50',
  accentActive: '#297c3b',
  accentContrast: '#fcfcfd',
  success: '#3d9a50',
  warning: '#f5a623',
  danger: '#e5484d',
  focus: '#7ca7ff',
  overlay: '#0f172a'
};

export const defaultDarkTheme: EliseTheme = {
  surface: '#111113',
  surfaceRaised: '#212225',
  surfaceHover: '#272a2d',
  border: '#363a3f',
  borderStrong: '#5a6169',
  text: '#edeef0',
  textMuted: '#b0b4ba',
  accent: '#46a758',
  accentHover: '#53b365',
  accentActive: '#71c083',
  accentContrast: '#edeef0',
  success: '#53b365',
  warning: '#f5a623',
  danger: '#f2555a',
  focus: '#7ca7ff',
  overlay: '#0f172a'
};

export const applyTheme = (theme: EliseTheme, element: HTMLElement = document.documentElement) => {
  element.style.setProperty('--elise-surface', theme.surface);
  element.style.setProperty('--elise-surface-raised', theme.surfaceRaised);
  element.style.setProperty('--elise-surface-hover', theme.surfaceHover);
  element.style.setProperty('--elise-border', theme.border);
  element.style.setProperty('--elise-border-strong', theme.borderStrong);
  element.style.setProperty('--elise-text', theme.text);
  element.style.setProperty('--elise-text-muted', theme.textMuted);
  element.style.setProperty('--elise-accent', theme.accent);
  element.style.setProperty('--elise-accent-hover', theme.accentHover);
  element.style.setProperty('--elise-accent-active', theme.accentActive);
  element.style.setProperty('--elise-accent-contrast', theme.accentContrast);
  element.style.setProperty('--elise-success', theme.success);
  element.style.setProperty('--elise-warning', theme.warning);
  element.style.setProperty('--elise-danger', theme.danger);
  element.style.setProperty('--elise-focus', theme.focus);
  element.style.setProperty('--elise-overlay', theme.overlay);
};
