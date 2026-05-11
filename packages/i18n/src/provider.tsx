import * as React from "react";

import { I18nContext } from "./context";
import { interpolate } from "./interpolate";
import type { I18nContextValue, Locale, Messages, TranslateOptions } from "./types";

export { I18nContext };

type I18nProviderProps = {
  children: React.ReactNode;
  /** Locale activo (controlled). Si se omite, el provider mantiene estado interno con `defaultLocale`. */
  locale?: Locale;
  /** Locale inicial cuando el provider es uncontrolled. */
  defaultLocale?: Locale;
  /** Locale usado cuando una key no existe en el locale activo. */
  fallbackLocale?: Locale;
  /** Diccionario de traducciones por locale → namespace → key. */
  messages: Messages;
  /** Callback al cambiar de locale (cuando es controlled). */
  onLocaleChange?: (locale: Locale) => void;
};

const lookup = (
  messages: Messages,
  locale: Locale,
  namespace: string,
  key: string,
): string | undefined => {
  return messages[locale]?.[namespace]?.[key];
};

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  locale: controlledLocale,
  defaultLocale,
  fallbackLocale,
  messages,
  onLocaleChange,
}) => {
  const availableLocales = React.useMemo(() => Object.keys(messages), [messages]);
  const initialLocale = controlledLocale ?? defaultLocale ?? availableLocales[0] ?? "en";
  const resolvedFallback = fallbackLocale ?? availableLocales[0] ?? initialLocale;

  const [internalLocale, setInternalLocale] = React.useState<Locale>(initialLocale);
  const activeLocale = controlledLocale ?? internalLocale;

  const setLocale = React.useCallback(
    (next: Locale) => {
      if (controlledLocale === undefined) {
        setInternalLocale(next);
      }
      onLocaleChange?.(next);
    },
    [controlledLocale, onLocaleChange],
  );

  const translate = React.useCallback(
    (namespace: string, key: string, options?: TranslateOptions): string => {
      const { fallback, ...vars } = options ?? {};
      const found =
        lookup(messages, activeLocale, namespace, key) ??
        lookup(messages, resolvedFallback, namespace, key);
      const template = found ?? fallback ?? key;
      return interpolate(template, vars);
    },
    [messages, activeLocale, resolvedFallback],
  );

  const value = React.useMemo<I18nContextValue>(
    () => ({
      locale: activeLocale,
      fallbackLocale: resolvedFallback,
      locales: availableLocales,
      messages,
      setLocale,
      translate,
    }),
    [activeLocale, resolvedFallback, availableLocales, messages, setLocale, translate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
