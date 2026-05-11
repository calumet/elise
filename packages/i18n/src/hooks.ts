import * as React from "react";

import { I18nContext } from "./context";
import type { Locale, TranslateFn } from "./types";

const DEFAULT_NAMESPACE = "default";

export type UseTranslationReturn = {
  t: TranslateFn;
  locale: Locale;
};

/**
 * Acceso a traducciones del namespace indicado. Si no hay `I18nProvider` montado,
 * `t(key, { fallback })` retorna el fallback (o la key si no se especificó).
 */
export const useTranslation = (namespace: string = DEFAULT_NAMESPACE): UseTranslationReturn => {
  const ctx = React.useContext(I18nContext);

  const t = React.useCallback<TranslateFn>(
    (key, options) => {
      if (ctx) return ctx.translate(namespace, key, options);
      const { fallback, ...vars } = options ?? {};
      const template = fallback ?? key;
      if (Object.keys(vars).length === 0) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = (vars as Record<string, string | number>)[name];
        return value === undefined ? match : String(value);
      });
    },
    [ctx, namespace],
  );

  return {
    t,
    locale: ctx?.locale ?? (typeof navigator !== "undefined" ? navigator.language : "en"),
  };
};

export type UseLocaleReturn = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: Locale[];
};

/** Acceso al locale activo y al setter. Sin Provider, `setLocale` es no-op. */
export const useLocale = (): UseLocaleReturn => {
  const ctx = React.useContext(I18nContext);
  return {
    locale: ctx?.locale ?? (typeof navigator !== "undefined" ? navigator.language : "en"),
    setLocale: ctx?.setLocale ?? (() => undefined),
    locales: ctx?.locales ?? [],
  };
};
