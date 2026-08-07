/** Etiqueta BCP 47, o una lista en orden de preferencia. */
export type Locale = string | string[];

/** Las opciones de `Intl.DateTimeFormat` más el locale con el que formatear. */
export type DateFormatOptions = Intl.DateTimeFormatOptions & { locale?: Locale };

/** Rango de fechas con los dos extremos opcionales. */
export type DateRange = { from?: Date; to?: Date };

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

/**
 * Formatea una fecha con `Intl.DateTimeFormat`. Sin opciones sale como
 * `"5 ago 2026"`, y cualquier opción de `Intl` pisa ese formato.
 */
export const formatDate = (date: Date, options?: DateFormatOptions): string => {
  const { locale, ...fmt } = options || {};
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...fmt }).format(date);
};

/**
 * Formatea un rango como `"desde – hasta"`. Con solo `from` devuelve esa
 * fecha sola, y sin ninguna de las dos devuelve cadena vacía.
 */
export const formatDateRange = (range: DateRange, options?: DateFormatOptions): string => {
  if (range.from && range.to) {
    return `${formatDate(range.from, options)} – ${formatDate(range.to, options)}`;
  }
  if (range.from) return formatDate(range.from, options);
  return "";
};
