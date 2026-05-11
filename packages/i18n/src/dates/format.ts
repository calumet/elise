export type Locale = string | string[];

export type DateFormatOptions = Intl.DateTimeFormatOptions & { locale?: Locale };

export type DateRange = { from?: Date; to?: Date };

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export const formatDate = (date: Date, options?: DateFormatOptions) => {
  const { locale, ...fmt } = options || {};
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...fmt }).format(date);
};

export const formatDateRange = (range: DateRange, options?: DateFormatOptions) => {
  if (range.from && range.to) {
    return `${formatDate(range.from, options)} – ${formatDate(range.to, options)}`;
  }
  if (range.from) return formatDate(range.from, options);
  return "";
};
