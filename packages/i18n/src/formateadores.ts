/* Construir un `Intl` es caro y estos se llaman por celda de tabla. La clave
   ordena las opciones para que dos objetos equivalentes den el mismo formateador. */
const clave = (locale: Intl.LocalesArgument, opciones: object): string =>
  JSON.stringify([
    locale,
    Object.entries(opciones)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : 1)),
  ]);

const fechas = new Map<string, Intl.DateTimeFormat>();
const numeros = new Map<string, Intl.NumberFormat>();

export const formateadorDeFecha = (
  locale: Intl.LocalesArgument,
  opciones: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  const k = clave(locale, opciones);
  let f = fechas.get(k);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, opciones);
    fechas.set(k, f);
  }
  return f;
};

export const formateadorDeNumero = (
  locale: Intl.LocalesArgument,
  opciones: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  const k = clave(locale, opciones);
  let f = numeros.get(k);
  if (!f) {
    f = new Intl.NumberFormat(locale, opciones);
    numeros.set(k, f);
  }
  return f;
};
