/**
 * Leer y escribir los valores que no son un color, para poder darles un control
 * en vez de un campo de texto.
 *
 * Nadie debería tener que escribir `0 4px 8px -3px oklch(…)` a mano para bajar
 * una sombra, así que aquí se descompone en números y se vuelve a armar.
 *
 * @module
 */

/** Un número con su unidad, como `0.5rem` o `180ms`. */
export type Sized = { value: number; unit: string };

const SIZED = /^(-?[\d.]+)([a-z%]*)$/i;

/** Lee `0.5rem`. Da `null` con cualquier otra cosa. */
export const parseSize = (text: string): Sized | null => {
  const match = SIZED.exec(text.trim());
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? { value, unit: match[2] || "" } : null;
};

const round = (value: number, places: number) => Number(value.toFixed(places));

/** Lo escribe de vuelta sin arrastrar decimales de más. */
export const formatSize = ({ value, unit }: Sized): string => `${round(value, 4)}${unit}`;

/** Una sombra descompuesta: dónde cae, cuánto se difumina y lo oscura que es. */
export type Shadow = {
  x: number;
  y: number;
  blur: number;
  alpha: number;
  /** El bisel de una superficie se dibuja por dentro, y tiene que seguir así. */
  inset?: boolean;
  /** Lo que la sombra crece o encoge antes de difuminarse. */
  spread?: number;
};

/** Corta en la coma de primer nivel, que un `oklch(… / 0.1)` lleva las suyas dentro. */
const firstLayer = (text: string) => {
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") depth -= 1;
    else if (text[i] === "," && depth === 0) return text.slice(0, i);
  }
  return text;
};

/* Un cero va sin unidad, así que `0 1px 1px -0.5px` lleva cuatro longitudes y solo tres con `px`. */
const LENGTH = "(-?[\\d.]+)(?:px)?";
const LENGTHS = new RegExp(`${LENGTH}\\s+${LENGTH}\\s+${LENGTH}(?:\\s+${LENGTH})?`);
const ALPHA = /\/\s*([\d.]+)\s*\)/;

/** Lee la primera capa de una sombra. `none` es una sombra apagada. */
export const parseShadow = (text: string): Shadow | null => {
  const trimmed = text.trim();
  if (trimmed === "none" || trimmed === "") return { x: 0, y: 0, blur: 0, alpha: 0 };

  const layer = firstLayer(trimmed);
  const lengths = LENGTHS.exec(layer);
  if (!lengths) return null;

  const alpha = ALPHA.exec(layer);
  return {
    x: Number(lengths[1]),
    y: Number(lengths[2]),
    blur: Number(lengths[3]),
    spread: lengths[4] === undefined ? undefined : Number(lengths[4]),
    alpha: alpha ? Number(alpha[1]) : 1,
    inset: /^\s*inset\b/.test(layer) || undefined,
  };
};

/* La tinta de la hoja, para que una sombra editada no cambie de gris. */
const SHADOW_INK = "oklch(0.21 0.02 265";

/** Una sola capa, que es lo que sale de mover los controles. */
export const formatShadow = ({ x, y, blur, alpha, spread, inset }: Shadow): string => {
  if (alpha === 0) return "none";
  const parts = [
    inset ? "inset" : "",
    `${round(x, 2)}px`,
    `${round(y, 2)}px`,
    `${round(blur, 2)}px`,
    `${round(spread ?? 0, 2)}px`,
    `${SHADOW_INK} / ${round(alpha, 3)})`,
  ];
  return parts.filter(Boolean).join(" ");
};

/** Si el valor apunta a otra variable o la mezcla, en vez de ser un color suelto. */
export const linkedTo = (value: string): string | null => {
  const reference = /var\((--[a-z0-9-]+)\)/.exec(value);
  return reference ? reference[1] : null;
};
