import type { Locale } from "../types";

/** Las opciones de `Intl.NumberFormat` más el locale con el que formatear. */
export type NumberFormatOptions = Intl.NumberFormatOptions & { locale?: Locale | Locale[] };

/** Formatea un número con `Intl.NumberFormat`. */
export const formatNumber = (value: number, options?: NumberFormatOptions): string => {
  const { locale, ...fmt } = options ?? {};
  return new Intl.NumberFormat(locale, fmt).format(value);
};

/**
 * Formatea un importe como moneda.
 *
 * @param currency Código ISO de la moneda, por ejemplo `"COP"`.
 */
export const formatCurrency = (
  value: number,
  currency: string,
  options?: NumberFormatOptions,
): string => {
  const { locale, ...fmt } = options ?? {};
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...fmt,
  }).format(value);
};

/** Formatea una fracción como porcentaje: `0.42` sale `"42 %"`. */
export const formatPercent = (value: number, options?: NumberFormatOptions): string => {
  const { locale, ...fmt } = options ?? {};
  return new Intl.NumberFormat(locale, {
    style: "percent",
    ...fmt,
  }).format(value);
};
