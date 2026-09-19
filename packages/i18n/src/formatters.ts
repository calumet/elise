/* Construir un `Intl` es caro y estos se llaman por celda de tabla. La clave
   ordena las opciones para que dos objetos equivalentes den el mismo formateador. */
const key = (locale: Intl.LocalesArgument, options: object): string =>
  JSON.stringify([
    locale,
    Object.entries(options)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : 1)),
  ]);

const dateCache = new Map<string, Intl.DateTimeFormat>();
const numberCache = new Map<string, Intl.NumberFormat>();

export const dateFormatter = (
  locale: Intl.LocalesArgument,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const k = key(locale, options);
  let cached = dateCache.get(k);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    dateCache.set(k, cached);
  }
  return cached;
};

export const numberFormatter = (
  locale: Intl.LocalesArgument,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const k = key(locale, options);
  let cached = numberCache.get(k);
  if (!cached) {
    cached = new Intl.NumberFormat(locale, options);
    numberCache.set(k, cached);
  }
  return cached;
};
