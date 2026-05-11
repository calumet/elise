export const i18nConfig = {
  defaultLocale: "es-CO",
  fallbackLocale: "en-US",
  locales: ["es-CO", "en-US"] as const,
} as const;

export type AppLocale = (typeof i18nConfig.locales)[number];
