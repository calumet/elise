export type Locale = string;

export type InterpolationVars = Record<string, string | number>;

export type NamespaceMessages = Record<string, string>;

export type LocaleMessages = Record<string, NamespaceMessages>;

export type Messages = Record<Locale, LocaleMessages>;

export type TranslateOptions = InterpolationVars & {
  fallback?: string;
};

export type TranslateFn = (key: string, options?: TranslateOptions) => string;

export type I18nContextValue = {
  locale: Locale;
  fallbackLocale: Locale;
  locales: Locale[];
  messages: Messages;
  setLocale: (locale: Locale) => void;
  translate: (namespace: string, key: string, options?: TranslateOptions) => string;
};
