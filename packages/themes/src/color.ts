/**
 * Lo mínimo de color para derivar un tema: leer un valor, moverlo en
 * luminosidad y elegir la tinta que se lee encima.
 *
 * Todo pasa por oklch porque es lo que usa la hoja de Elise y porque su
 * luminosidad es perceptual: subir 0.05 se ve igual de lejos en un azul que en
 * un amarillo, cosa que en hsl no pasa.
 *
 * @module
 */

/** Un color en oklch: luminosidad 0-1, croma 0-0.4 y tono 0-360. */
export type Oklch = { l: number; c: number; h: number };

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

const toLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const toGamma = (channel: number) =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

const linearToOklch = (r: number, g: number, b: number): Oklch => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const hue = (Math.atan2(bb, a) * 180) / Math.PI;
  return { l: lightness, c: Math.hypot(a, bb), h: hue < 0 ? hue + 360 : hue };
};

const oklchToLinear = ({ l, c, h }: Oklch) => {
  const radians = (h * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);

  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    r: 4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
    g: -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
    b: -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
  };
};

const OKLCH = /^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i;
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Lee un `oklch(…)` o un hex. Da `null` con cualquier otra cosa. */
export const parse = (value: string): Oklch | null => {
  const oklch = OKLCH.exec(value.trim());
  if (oklch) {
    const lightness = Number(oklch[1]);
    return {
      /* `oklch(62% …)` y `oklch(0.62 …)` son el mismo color. */
      l: value.includes("%") ? lightness / 100 : lightness,
      c: Number(oklch[2]),
      h: Number(oklch[3]),
    };
  }

  const hex = HEX.exec(value.trim());
  if (!hex) return null;
  const digits =
    hex[1].length === 3
      ? [...hex[1]].map((digit) => digit + digit)
      : [hex[1].slice(0, 2), hex[1].slice(2, 4), hex[1].slice(4, 6)];
  const [r, g, b] = digits.map((pair) => toLinear(Number.parseInt(pair, 16) / 255));
  return linearToOklch(r, g, b);
};

const round = (value: number, places: number) => Number(value.toFixed(places));

/** Lo escribe como lo escribe la hoja. */
export const format = ({ l, c, h }: Oklch): string =>
  `oklch(${round(l, 3)} ${round(c, 3)} ${round(h, 1)})`;

/** Hex de seis dígitos, que es lo único que entiende el selector de color. */
export const toHex = (color: Oklch): string => {
  const { r, g, b } = oklchToLinear(color);
  const digits = [r, g, b].map((channel) =>
    Math.round(clamp(toGamma(channel), 0, 1) * 255)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${digits.join("")}`;
};

/** Luminancia relativa de la WCAG, que es la que entra en la razón de contraste. */
const luminance = (color: Oklch) => {
  const { r, g, b } = oklchToLinear(color);
  return 0.2126 * clamp(r, 0, 1) + 0.7152 * clamp(g, 0, 1) + 0.0722 * clamp(b, 0, 1);
};

/** La razón de contraste entre dos colores, de 1 a 21. */
export const contrast = (one: Oklch, other: Oklch): number => {
  const a = luminance(one);
  const b = luminance(other);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const WHITE: Oklch = { l: 1, c: 0, h: 0 };

/**
 * La tinta que se lee encima de un fondo: blanca o casi negra, la que más
 * contraste dé. La oscura sale del propio tono, que un gris neutro sobre un
 * color saturado se ve sucio.
 */
export const readableOn = (background: Oklch): Oklch => {
  const ink: Oklch = { l: 0.22, c: Math.min(background.c, 0.05), h: background.h };
  return contrast(background, WHITE) >= contrast(background, ink) ? WHITE : ink;
};

/**
 * Mueve la luminosidad para que el color gane contraste contra el papel:
 * oscurece, salvo que oscurecer lo dejara casi negro, y entonces aclara.
 *
 * El corte está en 0.3 porque es donde cambia de lado la hoja de Elise: su
 * navy de 0.252 aclara a 0.3 al pasar el ratón y su rojo de 0.479 oscurece a
 * 0.44. Con el corte en la mitad de la escala, el rojo se iba para el lado
 * contrario.
 */
export const step = (color: Oklch, amount: number): Oklch => {
  const darker = color.l - amount;
  return { ...color, l: clamp(darker < 0.3 ? color.l + amount : darker, 0.05, 0.98) };
};

/** El mismo tono llevado a una luminosidad y un croma dados. */
export const at = (color: Oklch, l: number, c: number): Oklch => ({
  l: clamp(l, 0, 1),
  c,
  h: color.h,
});

/** Suma a la luminosidad sin salirse de la escala, que `oklch(1.016 …)` no es un color. */
export const lighten = (color: Oklch, amount: number): Oklch => ({
  ...color,
  l: clamp(color.l + amount, 0, 1),
});
