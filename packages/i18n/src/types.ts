/** Etiqueta BCP 47 del idioma, por ejemplo `"es-CO"`. */
export type Locale = string;

/** Valores que reemplazan a los `{marcadores}` de una traducción. */
export type InterpolationVars = Record<string, string | number>;

/** Las traducciones de un namespace, indexadas por key. */
export type NamespaceMessages = Record<string, string>;

/** Los namespaces de un locale. */
export type LocaleMessages = Record<string, NamespaceMessages>;

/** El diccionario completo: locale, namespace y key. */
export type Messages = Record<Locale, LocaleMessages>;

/** Lo que recibe {@link TranslateFn} además de la key. */
export type TranslateOptions = InterpolationVars & {
  /** Texto a usar cuando la key no existe en ningún locale. */
  fallback?: string;
};

/** La función `t` que devuelve `useTranslation`, ya atada a un namespace. */
export type TranslateFn = (key: string, options?: TranslateOptions) => string;

/** Lo que el provider pone en contexto. */
export type I18nContextValue = {
  locale: Locale;
  /** Locale al que se recurre cuando una key falta en el activo. */
  fallbackLocale: Locale;
  /** Los locales presentes en el diccionario. */
  locales: Locale[];
  messages: Messages;
  setLocale: (locale: Locale) => void;
  translate: (namespace: string, key: string, options?: TranslateOptions) => string;
};
