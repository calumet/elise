import path from 'path';
import { createRequire } from 'module';
import plugin from 'tailwindcss/plugin';
import type { Config } from 'tailwindcss';

import { buildCssVariables, darkThemeTokens, lightThemeTokens } from '../tokens';

const lightVars = buildCssVariables(lightThemeTokens);
const darkVars = buildCssVariables(darkThemeTokens);

// Glob absoluto del propio paquete para que Tailwind capture las clases sin configuraciones extra.
const require = createRequire(import.meta.url);
const pkgDir = path.dirname(require.resolve('@elise/ui/package.json'));
const distGlob = path.join(pkgDir, 'dist/**/*.{js,mjs,cjs}');

export const elisePreset: Config = {
  content: [distGlob],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--elise-surface) / <alpha-value>)',
        surface: 'rgb(var(--elise-surface-raised) / <alpha-value>)',
        muted: 'rgb(var(--elise-surface-hover) / <alpha-value>)',
        border: 'rgb(var(--elise-border) / <alpha-value>)',
        borderStrong: 'rgb(var(--elise-border-strong) / <alpha-value>)',
        foreground: 'rgb(var(--elise-text) / <alpha-value>)',
        mutedForeground: 'rgb(var(--elise-text-muted) / <alpha-value>)',
        accent: 'rgb(var(--elise-accent) / <alpha-value>)',
        accentHover: 'rgb(var(--elise-accent-hover) / <alpha-value>)',
        accentActive: 'rgb(var(--elise-accent-active) / <alpha-value>)',
        accentContrast: 'rgb(var(--elise-accent-contrast) / <alpha-value>)',
        focus: 'rgb(var(--elise-focus) / <alpha-value>)',
        success: 'rgb(var(--elise-success) / <alpha-value>)',
        warning: 'rgb(var(--elise-warning) / <alpha-value>)',
        danger: 'rgb(var(--elise-danger) / <alpha-value>)',
        overlay: 'rgb(var(--elise-overlay) / <alpha-value>)'
      },
      fontFamily: {
        sans: 'var(--elise-font-sans)',
        mono: 'var(--elise-font-mono)'
      },
      borderRadius: {
        xs: 'var(--elise-radius-xs)',
        sm: 'var(--elise-radius-sm)',
        md: 'var(--elise-radius-md)',
        lg: 'var(--elise-radius-lg)',
        pill: 'var(--elise-radius-pill)'
      },
      boxShadow: {
        soft: 'var(--elise-shadow-soft)',
        floating: 'var(--elise-shadow-floating)'
      },
      transitionProperty: {
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow'
      },
      backgroundImage: {
        'elise-noise':
          'radial-gradient(circle at 20% 20%, rgba(124, 167, 255, 0.08), transparent 32%), radial-gradient(circle at 80% 0%, rgba(90, 210, 169, 0.12), transparent 26%)'
      }
    }
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': lightVars,
        '.elise-dark, [data-theme="dark"]': darkVars,
        '*, *::before, *::after': {
          boxSizing: 'border-box'
        },
        body: {
          backgroundColor: 'rgb(var(--elise-surface))',
          color: 'rgb(var(--elise-text))',
          fontFamily: 'var(--elise-font-sans)',
          WebkitFontSmoothing: 'antialiased'
        },
        '::selection': {
          backgroundColor: 'rgb(var(--elise-accent))',
          color: 'rgb(var(--elise-accent-contrast))'
        }
      });
    })
  ]
};

export const elise = elisePreset;

export default elisePreset;
