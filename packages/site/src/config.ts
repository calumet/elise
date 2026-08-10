export const REPO_URL = "https://github.com/calumet/elise";
export const DOCS_URL = "https://github.com/calumet/elise/tree/master/docs";
export const START_URL = "https://github.com/calumet/elise/tree/master/docs/guia-inicio.md";
export const INSTALL_CMD = "pnpm add @calumet/elise-ui";
export const COPYRIGHT_YEAR = "2026";

/* El español es el idioma de origen, así que también hace de respaldo: una key
   que falte en inglés cae ahí en vez de mostrar la key cruda. */
export const i18nConfig = {
  defaultLocale: "es-CO",
  fallbackLocale: "es-CO",
  locales: ["es-CO", "en-US"],
} as const;

/** Rótulo corto de cada idioma en el selector. */
export const LOCALE_LABELS: Record<string, string> = {
  "es-CO": "ES",
  "en-US": "EN",
};
