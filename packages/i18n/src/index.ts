/**
 * Traducciones y formateo localizado para las apps de Calumet.
 *
 * Este entrypoint trae el provider, los hooks y los constructores del
 * diccionario, y reexporta el formateo de fechas y de números.
 *
 * ```tsx
 * import { I18nProvider, useTranslation } from "@calumet/elise-i18n";
 * ```
 *
 * @module
 */

export { I18nProvider } from "./provider";
export { I18nContext } from "./context";
export { useTranslation, useLocale } from "./hooks";
export type { UseTranslationReturn, UseLocaleReturn } from "./hooks";
export { buildMessages, buildLazyLoader } from "./build";
export type { EagerGlobModules, LazyGlobModules, BuildOptions, LazyLoader } from "./build";
export type {
  Locale,
  Messages,
  LocaleMessages,
  NamespaceMessages,
  TranslateFn,
  TranslateOptions,
  InterpolationVars,
  I18nContextValue,
} from "./types";

export * from "./dates";
export * from "./numbers";
