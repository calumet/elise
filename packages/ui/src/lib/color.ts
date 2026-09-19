/**
 * Lo justo de aritmética de color para el selector.
 *
 * El modelo interno es HSV y no HSL, porque el área de dos ejes del selector es
 * literalmente saturación por brillo: eso es HSV. HSL entra y sale, pero por
 * dentro se convierte.
 *
 * El tono se guarda aparte y no se deduce del color: en negro puro y en blanco
 * puro el tono no existe, así que arrastrar hasta una esquina y volver lo
 * perdería y el selector saltaría al rojo solo.
 */

export type Rgb = { r: number; g: number; b: number };

/** Tono 0-360, saturación y brillo 0-100. */
export type Hsv = { h: number; s: number; v: number };

export type Color = { hsv: Hsv; alpha: number };

export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

const toSegment = (text: string, scale: number) => {
  const n = parseFloat(text);
  if (Number.isNaN(n)) return null;
  return text.trim().endsWith("%") ? (n / 100) * scale : n;
};

export const rgbToHsv = ({ r, g, b }: Rgb): Hsv => {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 };
};

export const hsvToRgb = ({ h, s, v }: Hsv): Rgb => {
  const ss = s / 100;
  const vv = v / 100;
  const c = vv * ss;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vv - c;

  const segment = Math.floor(((h % 360) + 360) / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][segment];

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
};

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  const segment = Math.floor(((h % 360) + 360) / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][segment];

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNCTION = /^(rgba?|hsla?)\(([^)]*)\)$/i;

/**
 * Lee hex de 3, 4, 6 y 8 dígitos, `rgb()`, `rgba()`, `hsl()` y `hsla()`, con
 * coma o con espacio y con la barra del alfa moderno. Es lo que se copia de una
 * hoja de estilos o de una guía de marca sin tener que convertirlo antes.
 *
 * Devuelve `null` si no lo entiende, para que quien llame decida: el campo hex
 * lo usa para no pisar lo que se está escribiendo a medias.
 */
export const parse = (entry: string): Color | null => {
  const text = entry.trim();

  const hex = text.match(HEX);
  if (hex) {
    const d = hex[1];
    const short = d.length <= 4;
    const pair = (i: number) =>
      short ? parseInt(d[i] + d[i], 16) : parseInt(d.slice(i * 2, i * 2 + 2), 16);
    const withAlpha = d.length === 4 || d.length === 8;
    return {
      hsv: rgbToHsv({ r: pair(0), g: pair(1), b: pair(2) }),
      alpha: withAlpha ? pair(3) / 255 : 1,
    };
  }

  const fn = text.match(FUNCTION);
  if (!fn) return null;

  /* La barra del alfa moderno y las comas del clásico dan lo mismo una vez
     separados los trozos, así que se normalizan a un solo separador. */
  const parts = fn[2]
    .replace(/\//g, " ")
    .split(/[\s,]+/)
    .filter(Boolean);
  if (parts.length < 3) return null;

  const esHsl = fn[1].toLowerCase().startsWith("hsl");
  const alpha = parts[3] === undefined ? 1 : (toSegment(parts[3], 1) ?? 1);

  if (esHsl) {
    const h = parseFloat(parts[0]);
    const s = toSegment(parts[1], 1);
    const l = toSegment(parts[2], 1);
    if (Number.isNaN(h) || s === null || l === null) return null;
    return {
      hsv: rgbToHsv(hslToRgb(h, clamp(s, 0, 1), clamp(l, 0, 1))),
      alpha: clamp(alpha, 0, 1),
    };
  }

  const [r, g, b] = [parts[0], parts[1], parts[2]].map((t) => toSegment(t, 255));
  if (r === null || g === null || b === null) return null;
  return {
    hsv: rgbToHsv({ r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) }),
    alpha: clamp(alpha, 0, 1),
  };
};

const twoDigits = (n: number) =>
  Math.round(clamp(n, 0, 255))
    .toString(16)
    .padStart(2, "0");

/** Siempre hex: de 6, o de 8 cuando el selector admite alfa. */
export const toHex = ({ hsv, alpha }: Color, withAlpha: boolean): string => {
  const { r, g, b } = hsvToRgb(hsv);
  const base = `#${twoDigits(r)}${twoDigits(g)}${twoDigits(b)}`;
  return withAlpha ? `${base}${twoDigits(alpha * 255)}` : base;
};

/** Para pintar: el color en CSS, con su alfa. */
export const toCss = ({ hsv, alpha }: Color): string => {
  const { r, g, b } = hsvToRgb(hsv);
  const e = (n: number) => Math.round(clamp(n, 0, 255));
  return `rgb(${e(r)} ${e(g)} ${e(b)} / ${alpha})`;
};

/** El tono puro, que es el fondo del área de saturación y brillo. */
export const pureTone = (h: number): string => {
  const { r, g, b } = hsvToRgb({ h, s: 100, v: 100 });
  const e = (n: number) => Math.round(clamp(n, 0, 255));
  return `rgb(${e(r)} ${e(g)} ${e(b)})`;
};
