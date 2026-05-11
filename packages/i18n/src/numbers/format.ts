import type { Locale } from "../types";

export type NumberFormatOptions = Intl.NumberFormatOptions & { locale?: Locale | Locale[] };

export const formatNumber = (value: number, options?: NumberFormatOptions): string => {
  const { locale, ...fmt } = options ?? {};
  return new Intl.NumberFormat(locale, fmt).format(value);
};

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

export const formatPercent = (value: number, options?: NumberFormatOptions): string => {
  const { locale, ...fmt } = options ?? {};
  return new Intl.NumberFormat(locale, {
    style: "percent",
    ...fmt,
  }).format(value);
};
