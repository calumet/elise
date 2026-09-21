/**
 * El catálogo de variables, para el editor avanzado.
 *
 * El nombre sale de la propia variable, que inventarle uno humano a 110 tokens
 * es cómo se termina con rótulos peores que el nombre real. La explicación va
 * por grupo, y solo llevan una propia las que no se entienden por el grupo en
 * el que están.
 *
 * @module
 */

import { DECISIONS } from "./decisions";
import { lightTheme, type EliseVar } from "./tokens.generated";

/** Un grupo de variables del editor avanzado. */
export type TokenGroup = {
  id: string;
  label: string;
  description: string;
  vars: readonly EliseVar[];
};

/* El orden manda: la primera que encaja se lo lleva, así que
   `--success-foreground` cae en estado y no en texto. */
const MATCHERS: readonly {
  id: string;
  label: string;
  description: string;
  match: (name: string) => boolean;
}[] = [
  {
    id: "brand",
    label: "Brand",
    description: "The colour of the product and everything drawn in it.",
    match: (n) => /^--(primary|accent|ring|link)/.test(n),
  },
  {
    id: "status",
    label: "Status",
    description: "Success, warning, error and note, with their grades.",
    match: (n) => /^--(success|warning|destructive|info)/.test(n),
  },
  {
    id: "sidebar",
    label: "Side menu",
    description: "Its own surface, because it does not follow the page.",
    match: (n) => n.startsWith("--sidebar"),
  },
  {
    id: "inverse",
    label: "Dark strip",
    description: "What floats above everything, like a toast. It does not flip with the theme.",
    match: (n) => n.startsWith("--inverse"),
  },
  {
    id: "charts",
    label: "Charts",
    description: "The series data is drawn with.",
    match: (n) => n.startsWith("--chart-"),
  },
  {
    id: "borders",
    label: "Lines",
    description: "Borders and the outline of a field.",
    match: (n) => /^--(border|input)/.test(n),
  },
  {
    id: "shadows",
    label: "Shadows",
    description: "How far each size lifts off the page. Moving one turns it into a single shadow.",
    match: (n) => n.startsWith("--shadow"),
  },
  {
    id: "shape",
    label: "Shape",
    description: "The two numbers the whole layout derives from.",
    match: (n) => n === "--radius" || n === "--spacing",
  },
  {
    id: "type",
    label: "Type",
    description: "The families. The app has to load the ones it names.",
    match: (n) => n.startsWith("--font-"),
  },
  {
    id: "motion",
    label: "Motion",
    description: "How long a transition takes.",
    match: (n) => n.startsWith("--duration-"),
  },
  {
    id: "text",
    label: "Text",
    description: "The ink, and the quieter grades of it.",
    match: (n) => n === "--foreground" || n.endsWith("-foreground"),
  },
  {
    id: "surfaces",
    label: "Surfaces",
    description: "The planes content sits on, from the page up to a popover.",
    match: () => true,
  },
];

/* Las capas quedan fuera hasta del avanzado: cambiar el orden de apilado no es
   una decisión de apariencia, es romper los overlays. */
const OFF_LIMITS = /^--z-/;

/** Lo que la variable no dice de sí misma. El resto se entiende por su grupo. */
const NOTES: Partial<Record<EliseVar, string>> = {
  "--canvas": "The plane between the navigation bar and the cards resting on it.",
  "--secondary": "The surface cards sit on inside an app shell.",
  "--muted": "One step below the page, for quiet blocks.",
  "--fill-tertiary": "The quietest filled control, under buttons and chips.",
  "--track": "The groove a slider or a progress bar runs in.",
  "--ring": "The focus ring around whatever the keyboard is on.",
  "--input": "The line around a field, stronger than a plain border.",
  "--link": "Text that is a link, apart from a filled button.",
  "--radius": "Every rounded thing derives from this.",
  "--spacing": "Every gap and padding is a multiple of this.",
  "--shadow-bevel": "Drawn over the content, not under it, so a header cannot eat it.",
  "--shadow-surface": "The hairline that separates a surface from the page.",
  "--sidebar-guide": "The thread that joins a menu item to its children.",
};

/** El nombre legible de una variable, derivado de ella misma. */
export const nameOf = (name: EliseVar): string => {
  const [first, ...rest] = name.slice(2).split("-");
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(" ");
};

/** Lo que la variable explica de sí misma, si hace falta. */
export const noteOf = (name: EliseVar): string | undefined => NOTES[name];

/** Las variables que alguna decisión escribe, que el avanzado marca como derivadas. */
export const OWNED: ReadonlySet<EliseVar> = new Set(
  DECISIONS.flatMap((decision) => decision.writes),
);

/** Todas las variables agrupadas, en el orden en que se editan. Manda la primera que encaja. */
export const TOKEN_GROUPS: readonly TokenGroup[] = (() => {
  const buckets = new Map<string, EliseVar[]>(MATCHERS.map(({ id }) => [id, []]));

  for (const name of Object.keys(lightTheme) as EliseVar[]) {
    if (OFF_LIMITS.test(name)) continue;
    const group = MATCHERS.find(({ match }) => match(name));
    if (group) buckets.get(group.id)?.push(name);
  }

  return MATCHERS.map(({ id, label, description }) => ({
    id,
    label,
    description,
    vars: buckets.get(id) ?? [],
  })).filter((group) => group.vars.length > 0);
})();
