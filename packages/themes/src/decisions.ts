/**
 * Las decisiones de apariencia, que no son las variables.
 *
 * De las 110 variables de la hoja, 42 se derivan de otra, 9 son estructura que
 * nadie debe tocar y 11 son la franja oscura de los avisos. Las que quedan se
 * agrupan aquí en decisiones con nombre, porque nadie elige doce sombras: elige
 * una. Cada decisión sabe qué escribe y qué está elegido hoy.
 *
 * @module
 */

import { at, format, parse, readableOn, step, type Oklch } from "./color";
import type { EliseTheme } from "./theme";
import { lightTheme, type EliseVar } from "./tokens.generated";

/** Dónde se agrupa la decisión dentro del editor. */
export type DecisionGroup = "colors" | "shape" | "text";

/** Una de las opciones dibujadas de una decisión de escoger. */
export type ChoiceOption = { id: string; label: string };

type Common = {
  id: string;
  label: string;
  description: string;
  group: DecisionGroup;
  /** Las decisiones que comparten tarjeta se dibujan juntas. */
  card: string;
  /** Se dibuja como una ficha suelta, para las que comparten tarjeta. */
  compact?: boolean;
  /** El título de la tarjeta, cuando no es el de la decisión. */
  cardLabel?: string;
  /** La descripción de la tarjeta, cuando no es la de la decisión. */
  cardDescription?: string;
  /** Las variables que toca, para saber si está cambiada y para deshacerla. */
  writes: readonly EliseVar[];
  apply: (value: string, theme: EliseTheme) => EliseTheme;
  read: (theme: EliseTheme) => string;
};

/** Una decisión de color suelto. */
export type ColorDecision = Common & {
  kind: "color";
  /** Las variables con las que el control se dibuja: el relleno, la tinta de encima y el acento. */
  preview: readonly [EliseVar, EliseVar, EliseVar];
};

/** Una decisión de escoger entre opciones dibujadas. */
export type ChoiceDecision = Common & { kind: "choice"; options: readonly ChoiceOption[] };

/** Una decisión de apariencia. */
export type Decision = ColorDecision | ChoiceDecision;

type Vars = Partial<Record<EliseVar, string>>;

/* Lo que ya vale lo que dice la hoja no se escribe: así el tema guardado es la
   diferencia y no una copia, y una escuela que no tocó el relieve hereda el que
   Elise cambie mañana. */
const onlyChanges = (vars: Vars): EliseTheme => {
  const changed: Vars = {};
  for (const [name, value] of Object.entries(vars) as [EliseVar, string][]) {
    if (value !== lightTheme[name]) changed[name] = value;
  }
  return changed;
};

/* Los cuatro colores de estado se derivan igual: el de encima por contraste,
   los de paso moviéndose del fondo y el suave como un tinte del mismo tono. */
const statusVars = (prefix: string, base: Oklch): Vars =>
  ({
    [`--${prefix}`]: format(base),
    [`--${prefix}-foreground`]: format(readableOn(base)),
    [`--${prefix}-hover`]: format(step(base, 0.045)),
    [`--${prefix}-active`]: format(step(base, 0.085)),
    [`--${prefix}-subtle`]: format(at(base, 0.962, 0.026)),
    [`--${prefix}-subtle-foreground`]: format(at(base, 0.4, 0.09)),
  }) as Vars;

const brandVars = (base: Oklch): Vars => ({
  "--primary": format(base),
  "--primary-hover": format(step(base, 0.048)),
  "--primary-active": format(step(base, 0.088)),
  "--primary-foreground": format(readableOn(base)),
  "--ring": format(base),
  /* El enlace se separa del relleno: es texto sobre el papel y necesita su
     propia luminosidad, que es lo que hace la hoja con su navy. */
  "--link": format(step(base, 0.128)),
  "--link-hover": format(step(base, 0.068)),
  "--link-active": format(step(base, 0.028)),
  "--accent": format(at(base, 0.95, 0.024)),
  "--accent-foreground": format(at(base, 0.3, 0.14)),
  "--sidebar-primary": format(base),
  "--sidebar-primary-foreground": format(readableOn(base)),
  "--sidebar-ring": format(base),
  "--chart-1": format(at(base, 0.62, 0.14)),
  "--chart-2": format(at(base, 0.52, 0.15)),
  "--chart-3": format(at(base, 0.42, 0.155)),
  "--chart-4": format(at(base, 0.34, 0.15)),
  "--chart-5": format(at(base, 0.252, 0.156)),
});

/* Las superficies neutras, que es lo que tiñe el tono del papel. Conservan su
   luminosidad, que es la que ordena los planos, y cambian de tono. */
const SURFACES = [
  "--background",
  "--card",
  "--canvas",
  "--popover",
  "--secondary",
  "--muted",
  "--fill-tertiary",
  "--border-subtle",
  "--border",
  "--border-strong",
  "--input",
] as const satisfies readonly EliseVar[];

const paperVars = (chroma: number, hue: number): Vars => {
  const vars: Vars = {};
  for (const name of SURFACES) {
    const base = parse(lightTheme[name]);
    if (base) vars[name] = format({ l: base.l, c: chroma, h: hue });
  }
  return vars;
};

/* El menú con color apunta a las variables de la marca en vez de copiar su
   valor, así que sigue vivo: cambiar el color de la escuela lo repinta sin que
   nadie tenga que volver a aplicar esta decisión. Lo que no se puede escribir
   como referencia se mezcla, que también resuelve en el navegador. */
const OVER_BRAND = (amount: number) =>
  `color-mix(in oklab, var(--primary-foreground) ${amount}%, var(--primary))`;

const SIDEBAR_ON_BRAND: Vars = {
  "--sidebar": "var(--primary)",
  "--sidebar-foreground": "var(--primary-foreground)",
  "--sidebar-muted-foreground": OVER_BRAND(70),
  "--sidebar-hover": "var(--primary-hover)",
  "--sidebar-accent": "var(--primary-active)",
  "--sidebar-accent-foreground": "var(--primary-foreground)",
  "--sidebar-border": OVER_BRAND(18),
  "--sidebar-guide": OVER_BRAND(32),
  "--sidebar-guide-hover": OVER_BRAND(48),
};

const ELEVATION = [
  "--shadow-2xs",
  "--shadow-xs",
  "--shadow-sm",
  "--shadow",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-xl",
  "--shadow-2xl",
] as const satisfies readonly EliseVar[];

const INK = "oklch(0.21 0.02 265";

const STRONG_SHADOWS = [
  `0 1px 2px -0.5px ${INK} / 0.07)`,
  `0 2px 4px -1px ${INK} / 0.1)`,
  `0 2px 4px -1px ${INK} / 0.14), 0 4px 10px -2px ${INK} / 0.13)`,
  `0 3px 6px -2px ${INK} / 0.14), 0 8px 16px -4px ${INK} / 0.14)`,
  `0 4px 8px -2px ${INK} / 0.15), 0 10px 20px -4px ${INK} / 0.16)`,
  `0 6px 14px -4px ${INK} / 0.17), 0 22px 42px -10px ${INK} / 0.2)`,
  `0 12px 24px -6px ${INK} / 0.19), 0 36px 64px -14px ${INK} / 0.24)`,
  `0 18px 36px -8px ${INK} / 0.22), 0 52px 92px -20px ${INK} / 0.3)`,
];

const depthVars = (shadows: readonly string[] | null): Vars => {
  const vars: Vars = {};
  ELEVATION.forEach((name, index) => {
    vars[name] = shadows ? shadows[index] : "none";
  });
  return vars;
};

/** Escoge entre opciones que escriben cada una lo suyo. */
const choice = (
  common: Omit<Common, "writes" | "apply" | "read"> & {
    options: readonly (ChoiceOption & { vars: Vars })[];
  },
): ChoiceDecision => {
  const { options, ...rest } = common;
  const fragments = new Map(options.map((option) => [option.id, onlyChanges(option.vars)]));
  const writes = [...new Set(options.flatMap((option) => Object.keys(option.vars)))];

  return {
    ...rest,
    kind: "choice",
    options: options.map(({ id, label }) => ({ id, label })),
    writes: writes as EliseVar[],
    apply: (value) => fragments.get(value) ?? {},
    /* La opción que ya está escrita entera. La que no escribe nada es la de la
       hoja, y esa es la respuesta cuando ninguna otra encaja. */
    read: (theme) => {
      for (const option of options) {
        const fragment = fragments.get(option.id) ?? {};
        const names = Object.keys(fragment) as EliseVar[];
        if (names.length > 0 && names.every((name) => theme[name] === fragment[name])) {
          return option.id;
        }
      }
      return (
        options.find((option) => Object.keys(fragments.get(option.id) ?? {}).length === 0)?.id ??
        options[0].id
      );
    },
  };
};

/** Un color que se elige, y del que salen todos los demás. */
const color = (
  common: Omit<Common, "writes" | "apply" | "read"> & {
    source: EliseVar;
    preview: readonly [EliseVar, EliseVar, EliseVar];
    derive: (base: Oklch, theme: EliseTheme) => Vars;
  },
): ColorDecision => {
  const { source, derive, ...rest } = common;
  return {
    ...rest,
    kind: "color",
    writes: Object.keys(derive({ l: 0.5, c: 0.1, h: 0 }, {})) as EliseVar[],
    apply: (value, theme) => {
      const base = parse(value);
      if (!base) return {};
      /* Volver al color que ya trae la hoja no escribe nada. El tema de Elise
         está afinado a mano familia por familia y ninguna fórmula lo reproduce
         exacto, así que la que manda es la hoja y no la derivación. */
      if (format(base) === lightTheme[source]) return {};
      return onlyChanges(derive(base, theme));
    },
    read: (theme) => theme[source] ?? lightTheme[source],
  };
};

const status = (
  id: string,
  prefix: string,
  label: string,
  source: EliseVar,
  preview: readonly [EliseVar, EliseVar, EliseVar],
): ColorDecision =>
  color({
    id,
    label,
    description: "",
    group: "colors",
    card: "status",
    compact: true,
    source,
    preview,
    derive: (base) => statusVars(prefix, base),
  });

/** Las decisiones que Elise considera de diseño. El consumidor recorta. */
export const DECISIONS: readonly Decision[] = [
  color({
    id: "brand",
    label: "Color de la escuela",
    description: "Los botones, los enlaces y lo que esté seleccionado.",
    group: "colors",
    card: "brand",
    source: "--primary",
    preview: ["--primary", "--primary-foreground", "--link"],
    derive: (base) => brandVars(base),
  }),

  choice({
    id: "paper",
    label: "Tono del papel",
    description: "El fondo sobre el que se apoya todo el portal.",
    group: "colors",
    card: "paper",
    options: [
      { id: "neutral", label: "Neutro", vars: {} },
      { id: "warm", label: "Cálido", vars: paperVars(0.012, 85) },
      { id: "cool", label: "Frío", vars: paperVars(0.01, 250) },
    ],
  }),

  choice({
    id: "sidebar",
    label: "Menú lateral",
    description: "Del tono del papel, o con el color de la escuela.",
    group: "colors",
    card: "sidebar",
    options: [
      { id: "paper", label: "Del papel", vars: {} },
      { id: "brand", label: "Con color", vars: SIDEBAR_ON_BRAND },
    ],
  }),

  {
    ...status("status-success", "success", "Todo bien", "--success", [
      "--success-subtle",
      "--success-subtle-foreground",
      "--success",
    ]),
    cardLabel: "Colores de los avisos",
    cardDescription: "Toca cualquiera para cambiarlo.",
  },
  status("status-warning", "warning", "Cuidado", "--warning", [
    "--warning-subtle",
    "--warning-subtle-foreground",
    "--warning",
  ]),
  status("status-danger", "destructive", "Error", "--destructive", [
    "--destructive-subtle",
    "--destructive-subtle-foreground",
    "--destructive",
  ]),
  status("status-info", "info", "Dato", "--info", [
    "--info-subtle",
    "--info-subtle-foreground",
    "--info",
  ]),

  choice({
    id: "corners",
    label: "Esquinas",
    description: "De cuadradas a muy redondas.",
    group: "shape",
    card: "corners",
    options: [
      { id: "square", label: "Cuadradas", vars: { "--radius": "0rem" } },
      { id: "soft", label: "Poco redondas", vars: { "--radius": "0.25rem" } },
      { id: "round", label: "Redondas", vars: { "--radius": "0.5rem" } },
      { id: "pill", label: "Muy redondas", vars: { "--radius": "0.875rem" } },
    ],
  }),

  choice({
    id: "density",
    label: "Qué tan apretado",
    description: "Cuánto aire hay entre las cosas de una lista.",
    group: "shape",
    card: "density",
    options: [
      { id: "loose", label: "Suelto", vars: { "--spacing": "0.28rem" } },
      { id: "normal", label: "Normal", vars: { "--spacing": "0.25rem" } },
      { id: "dense", label: "Denso", vars: { "--spacing": "0.1875rem" } },
    ],
  }),

  choice({
    id: "depth",
    label: "Relieve",
    description: "Cuánto se levantan las tarjetas del fondo.",
    group: "shape",
    card: "depth",
    options: [
      { id: "flat", label: "Plano", vars: depthVars(null) },
      { id: "soft", label: "Suave", vars: {} },
      { id: "strong", label: "Marcado", vars: depthVars(STRONG_SHADOWS) },
    ],
  }),

  choice({
    id: "headings",
    label: "Títulos",
    description: "Con la misma letra del texto, o con una serif.",
    group: "text",
    card: "headings",
    options: [
      { id: "sans", label: "Igual que el texto", vars: { "--font-display": "var(--font-sans)" } },
      { id: "serif", label: "En serif", vars: { "--font-display": "var(--font-serif)" } },
    ],
  }),
];

/** Si la decisión está escrita en el tema, aunque sea a medias. */
export const isChanged = (decision: Decision, theme: EliseTheme): boolean =>
  decision.writes.some((name) => theme[name] !== undefined);

/** Saca la decisión del tema, en vez de escribirle el valor de la hoja. */
export const clear = (decision: Decision, theme: EliseTheme): EliseTheme => {
  const next = { ...theme };
  for (const name of decision.writes) delete next[name];
  return next;
};

/**
 * Cambia una decisión: borra lo que tenía escrito y escribe lo nuevo.
 *
 * Los dos pasos van juntos porque una decisión puede no escribir nada, como
 * cuando se vuelve al valor de la hoja, y entonces lo anterior tiene que salir
 * igual.
 */
export const set = (decision: Decision, theme: EliseTheme, value: string): EliseTheme => ({
  ...clear(decision, theme),
  ...decision.apply(value, theme),
});
