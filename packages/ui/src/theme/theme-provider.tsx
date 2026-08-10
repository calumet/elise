/**
 * Alterna entre claro y oscuro. Según `attribute` usa la clase `.elise-dark` o `data-theme="dark"`, y guarda la preferencia en `localStorage`.
 *
 * @module
 */

import * as React from "react";

/** Los dos temas entre los que se alterna. */
type Theme = "light" | "dark";

/** Props de {@link ThemeProvider}. */
type ThemeProviderProps = {
  children: React.ReactNode;
  /**
   * Usa 'class' para alternar la clase .elise-dark en el html/body
   * o 'data-theme' para alternar el atributo data-theme="dark".
   */
  attribute?: "class" | "data-theme";
  /** Clave para persistir la preferencia en localStorage. */
  storageKey?: string;
  /** Tema inicial en ausencia de preferencia guardada. */
  defaultTheme?: Theme;
  /** Tema forzado/controlado desde fuera. */
  forcedTheme?: Theme;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const isBrowser = typeof window !== "undefined";

const applyThemeToDocument = (theme: Theme, attribute: "class" | "data-theme") => {
  if (!isBrowser) return;
  const root = document.documentElement;

  if (attribute === "class") {
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.removeAttribute("data-theme");
  } else {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    root.classList.remove("dark");
  }
};

const readStoredTheme = (storageKey?: string): Theme | null => {
  if (!isBrowser || !storageKey) return null;
  const stored = window.localStorage.getItem(storageKey);
  return stored === "dark" || stored === "light" ? stored : null;
};

/** Alterna entre claro y oscuro. Según `attribute` usa la clase `.elise-dark` o `data-theme="dark"`, y guarda la preferencia en `localStorage`. */
export const ThemeProvider = ({
  children,
  attribute = "class",
  storageKey = "elise-theme",
  defaultTheme = "light",
  forcedTheme,
}: ThemeProviderProps): React.JSX.Element => {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const initial = forcedTheme ?? readStoredTheme(storageKey) ?? defaultTheme;
    if (isBrowser) {
      applyThemeToDocument(initial, attribute);
    }
    return initial;
  });

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next);
      if (isBrowser && storageKey) {
        window.localStorage.setItem(storageKey, next);
      }
    },
    [storageKey],
  );

  React.useLayoutEffect(() => {
    const currentTheme = forcedTheme ?? theme;
    applyThemeToDocument(currentTheme, attribute);
    if (!forcedTheme && isBrowser && storageKey) {
      window.localStorage.setItem(storageKey, currentTheme);
    }
  }, [theme, forcedTheme, attribute, storageKey]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme: forcedTheme ?? theme, setTheme }),
    [theme, forcedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/** Da el tema activo y `setTheme`. Tira error fuera de `ThemeProvider`. */
export const useTheme = (): ThemeContextValue => {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
};

export type { Theme, ThemeProviderProps };
