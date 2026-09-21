/**
 * Alterna entre claro y oscuro. Según `attribute` usa la clase `dark` o
 * `data-theme="dark"`, y guarda la preferencia en `localStorage`.
 *
 * @module
 */

import * as React from "react";

/** Los dos temas entre los que se alterna. */
export type Theme = "light" | "dark";

/** Dónde se marca el tema oscuro. */
export type ThemeAttribute = "class" | "data-theme";

/** Props de {@link ThemeProvider}. */
export type ThemeProviderProps = {
  children: React.ReactNode;
  /** `class` alterna la clase `dark` en el `<html>`; `data-theme` alterna `data-theme="dark"`. */
  attribute?: ThemeAttribute;
  /** Clave para persistir la preferencia en `localStorage`. */
  storageKey?: string;
  /** Tema inicial en ausencia de preferencia guardada. */
  defaultTheme?: Theme;
  /** Tema forzado/controlado desde fuera. */
  forcedTheme?: Theme;
  /** Para una política de contenido que exige firmar los scripts en línea. */
  nonce?: string;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const isBrowser = typeof window !== "undefined";

const applyThemeToDocument = (theme: Theme, attribute: ThemeAttribute) => {
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

/* Vive una sola vez porque la leen el provider y el script, y tienen que coincidir. */
const THEMES: readonly Theme[] = ["light", "dark"];

const readStoredTheme = (storageKey?: string): Theme | null => {
  if (!isBrowser || !storageKey) return null;
  const stored = window.localStorage.getItem(storageKey);
  return THEMES.find((theme) => theme === stored) ?? null;
};

/* Lo mismo que `applyThemeToDocument`, en JS plano, para correr al parsear y no al hidratar. */
const markOnParse = (storageKey: string, attribute: ThemeAttribute, defaultTheme: Theme) => {
  const text = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003C");
  const mark =
    attribute === "class" ? `d.classList.add("dark")` : `d.setAttribute("data-theme","dark")`;
  return `(function(){var d=document.documentElement,t=null;try{t=localStorage.getItem(${text(storageKey)})}catch(e){}if(${text(THEMES)}.indexOf(t)<0)t=${text(defaultTheme)};if(t==="dark")${mark}})();`;
};

/**
 * Alterna entre claro y oscuro, y marca el `<html>` antes del primer pintado.
 *
 * Monta el script que lee la preferencia al parsear el HTML, así que una app
 * con render en servidor no parpadea en claro en cada carga. Por eso conviene
 * que envuelva lo más alto posible del árbol.
 *
 * El script y el provider deciden con la misma regla sobre lo mismo, así que
 * React hidrata con el tema que ya está puesto. Solo hace falta
 * `suppressHydrationWarning` donde el `<html>` lo renderiza React, como en el
 * App Router de Next: si la app monta en un nodo de dentro, no hay nada que
 * comparar.
 */
export const ThemeProvider = ({
  children,
  attribute = "class",
  storageKey = "elise-theme",
  defaultTheme = "light",
  forcedTheme,
  nonce,
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

  /* Un tema forzado no depende de lo guardado, así que no hay nada que leer antes de pintar. */
  const script = forcedTheme ? null : markOnParse(storageKey, attribute, defaultTheme);

  return (
    <ThemeContext.Provider value={value}>
      {/* Lo que crea React no se ejecuta. */}
      {script && <script nonce={nonce} dangerouslySetInnerHTML={{ __html: script }} />}
      {children}
    </ThemeContext.Provider>
  );
};

/** Da el tema activo y `setTheme`. Tira error fuera de `ThemeProvider`. */
export const useTheme = (): ThemeContextValue => {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return ctx;
};
