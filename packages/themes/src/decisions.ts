/**
 * Las decisiones de apariencia, que no son las variables.
 *
 * De las 110 variables de la hoja, 9 son estructura que nadie debe tocar (las
 * capas y las duraciones) y 11 son la franja oscura de los avisos. El resto se
 * agrupa aquí en decisiones con nombre, porque nadie elige doce sombras: elige
 * una. Cada decisión sabe qué escribe y qué está elegido hoy.
 *
 * Los rótulos viven en inglés y pasan por `elise-i18n`, así que un portal en
 * español traduce una vez en su catálogo en vez de rehacer la lista.
 *
 * @module
 */

import { at, format, parse, readableOn, step, type Oklch } from "./color";
import type { EliseTheme } from "./theme";
import { darkTheme, lightTheme, type EliseVar } from "./tokens.generated";

/** Dónde se agrupa la decisión dentro del editor. */
export type DecisionGroup = "colors" | "shape" | "text";

/** Una de las opciones dibujadas de una decisión de escoger. */
export type ChoiceOption = { id: string; label: string };

type Common = {
  id: string;
  /** En inglés: es la cadena de origen, y la que se traduce. */
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
  /** Con qué se dibuja la muestra. */
  shape?: "swatch" | "page" | "rail" | "corner" | "rows" | "card" | "type";
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
export type ChoiceDecision = Common & {
  kind: "choice";
  options: readonly ChoiceOption[];
  /** Cuántas caben por fila. Por defecto, todas. */
  columns?: number;
};

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

/* Una relación entre variables se escribe como referencia y no como valor, y
   así queda viva: el acento sigue al color de la escuela y al del papel sin que
   nadie vuelva a aplicar esas decisiones, y con un papel oscuro se oscurece
   solo. Es lo que el navegador ya sabe hacer. */
const tint = (over: EliseVar, amount: number, on: EliseVar = "--background") =>
  `color-mix(in oklab, var(${over}) ${amount}%, var(${on}))`;

const ink = (over: EliseVar, amount: number) =>
  `color-mix(in oklab, var(${over}) ${amount}%, var(--foreground))`;

/** Los planos de la página, medidos desde su fondo en los dos temas de la hoja. */
const SURFACES = [
  "--card",
  "--canvas",
  "--popover",
  "--secondary",
  "--muted",
  "--fill-tertiary",
  "--track",
  "--border-subtle",
  "--border",
  "--border-strong",
  "--input",
] as const satisfies readonly EliseVar[];

/** La tinta y sus grados, medidos desde el texto general. */
const INKS = [
  "--card-foreground",
  "--popover-foreground",
  "--secondary-foreground",
  "--muted-foreground",
] as const satisfies readonly EliseVar[];

/* Los escalones salen de los dos temas de la hoja y no de una tabla a mano: en
   claro la tarjeta sube 0.016 sobre el fondo y en oscuro sube 0.044, y esa
   diferencia es justo la que hace que un papel oscuro dé un tema oscuro. */
const offsets = (theme: Record<EliseVar, string>, from: EliseVar, names: readonly EliseVar[]) => {
  const anchor = parse(theme[from]);
  const table = new Map<EliseVar, number>();
  if (!anchor) return table;
  for (const name of names) {
    const value = parse(theme[name]);
    if (value) table.set(name, value.l - anchor.l);
  }
  return table;
};

const SURFACE_STEPS = {
  light: offsets(lightTheme, "--background", SURFACES),
  dark: offsets(darkTheme, "--background", SURFACES),
};

const INK_STEPS = {
  light: offsets(lightTheme, "--foreground", INKS),
  dark: offsets(darkTheme, "--foreground", INKS),
};

/* Un tinte sobre el papel no es de quien elige el color sino del papel: el
   acento y los suaves de los avisos son el color de arriba mezclado con el
   fondo, así que los escribe esta decisión y nadie más. Si los escribieran
   también las otras, borrar una dejaría al papel oscuro con una banda clara. */
const LINKED: Vars = {
  "--accent": tint("--primary", 18),
  "--accent-foreground": ink("--primary", 70),
  "--success-subtle": tint("--success", 14),
  "--success-subtle-foreground": ink("--success", 65),
  "--warning-subtle": tint("--warning", 14),
  "--warning-subtle-foreground": ink("--warning", 65),
  "--destructive-subtle": tint("--destructive", 14),
  "--destructive-subtle-foreground": ink("--destructive", 65),
  "--info-subtle": tint("--info", 14),
  "--info-subtle-foreground": ink("--info", 65),
};

const paperVars = (paper: Oklch): Vars => {
  const side = paper.l < 0.5 ? "dark" : "light";
  const text = readableOn(paper);
  const vars: Vars = { ...LINKED, "--background": format(paper), "--foreground": format(text) };

  for (const [name, offset] of SURFACE_STEPS[side]) {
    vars[name] = format({ ...paper, l: paper.l + offset });
  }
  for (const [name, offset] of INK_STEPS[side]) {
    vars[name] = format({ ...text, l: text.l + offset });
  }
  return vars;
};

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
  "--sidebar-primary": format(base),
  "--sidebar-primary-foreground": format(readableOn(base)),
  "--sidebar-ring": format(base),
  "--chart-1": format(at(base, 0.62, 0.14)),
  "--chart-2": format(at(base, 0.52, 0.15)),
  "--chart-3": format(at(base, 0.42, 0.155)),
  "--chart-4": format(at(base, 0.34, 0.15)),
  "--chart-5": format(at(base, 0.252, 0.156)),
});

/* Los cuatro colores de estado se derivan igual: el de encima por contraste y
   los de paso moviéndose del fondo. Los suaves no están aquí: son un tinte
   sobre el papel y los escribe esa decisión. */
const statusVars = (prefix: string, base: Oklch): Vars =>
  ({
    [`--${prefix}`]: format(base),
    [`--${prefix}-foreground`]: format(readableOn(base)),
    [`--${prefix}-hover`]: format(step(base, 0.045)),
    [`--${prefix}-active`]: format(step(base, 0.085)),
  }) as Vars;

const SIDEBAR_ON_BRAND: Vars = {
  "--sidebar": "var(--primary)",
  "--sidebar-foreground": "var(--primary-foreground)",
  "--sidebar-muted-foreground":
    "color-mix(in oklab, var(--primary-foreground) 70%, var(--primary))",
  "--sidebar-hover": "var(--primary-hover)",
  "--sidebar-accent": "var(--primary-active)",
  "--sidebar-accent-foreground": "var(--primary-foreground)",
  "--sidebar-border": "color-mix(in oklab, var(--primary-foreground) 18%, var(--primary))",
  "--sidebar-guide": "color-mix(in oklab, var(--primary-foreground) 32%, var(--primary))",
  "--sidebar-guide-hover": "color-mix(in oklab, var(--primary-foreground) 48%, var(--primary))",
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

const SHADOW_INK = "oklch(0.21 0.02 265";

const STRONG_SHADOWS = [
  `0 1px 2px -0.5px ${SHADOW_INK} / 0.07)`,
  `0 2px 4px -1px ${SHADOW_INK} / 0.1)`,
  `0 2px 4px -1px ${SHADOW_INK} / 0.14), 0 4px 10px -2px ${SHADOW_INK} / 0.13)`,
  `0 3px 6px -2px ${SHADOW_INK} / 0.14), 0 8px 16px -4px ${SHADOW_INK} / 0.14)`,
  `0 4px 8px -2px ${SHADOW_INK} / 0.15), 0 10px 20px -4px ${SHADOW_INK} / 0.16)`,
  `0 6px 14px -4px ${SHADOW_INK} / 0.17), 0 22px 42px -10px ${SHADOW_INK} / 0.2)`,
  `0 12px 24px -6px ${SHADOW_INK} / 0.19), 0 36px 64px -14px ${SHADOW_INK} / 0.24)`,
  `0 18px 36px -8px ${SHADOW_INK} / 0.22), 0 52px 92px -20px ${SHADOW_INK} / 0.3)`,
];

const depthVars = (shadows: readonly string[] | null): Vars => {
  const vars: Vars = {};
  ELEVATION.forEach((name, index) => {
    vars[name] = shadows ? shadows[index] : "none";
  });
  return vars;
};

/**
 * Las familias que el paquete lleva autoalojadas, cada una en su entrada.
 *
 * La aplicación importa las que vaya a ofrecer; las que no importe se ven con
 * la fuente del sistema. Las tres primeras entran con `fonts.css`.
 */
export const FONT_FAMILIES: readonly { id: string; label: string; stack: string }[] = [
  { id: "geist", label: "Geist", stack: '"Geist Variable", ui-sans-serif, sans-serif' },
  {
    id: "source-serif-4",
    label: "Source Serif 4",
    stack: '"Source Serif 4 Variable", ui-serif, Georgia, serif',
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    stack: '"JetBrains Mono Variable", ui-monospace, monospace',
  },
  { id: "archivo", label: "Archivo", stack: '"Archivo Variable", ui-sans-serif, sans-serif' },
  {
    id: "bricolage-grotesque",
    label: "Bricolage Grotesque",
    stack: '"Bricolage Grotesque Variable", ui-sans-serif, sans-serif',
  },
  {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    stack: '"IBM Plex Sans Variable", ui-sans-serif, sans-serif',
  },
  { id: "manrope", label: "Manrope", stack: '"Manrope Variable", ui-sans-serif, sans-serif' },
  { id: "newsreader", label: "Newsreader", stack: '"Newsreader Variable", ui-serif, serif' },
  {
    id: "public-sans",
    label: "Public Sans",
    stack: '"Public Sans Variable", ui-sans-serif, sans-serif',
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    stack: '"Space Grotesk Variable", ui-sans-serif, sans-serif',
  },
];

const fontOptions = (name: EliseVar) =>
  FONT_FAMILIES.map(({ id, label, stack }) => ({ id, label, vars: { [name]: stack } as Vars }));

/** Escoge entre opciones que escriben cada una lo suyo. */
const choice = (
  common: Omit<Common, "writes" | "apply" | "read"> & {
    columns?: number;
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
    label: "School colour",
    description: "Buttons, links and anything selected.",
    group: "colors",
    card: "brand",
    source: "--primary",
    preview: ["--primary", "--primary-foreground", "--link"],
    derive: (base) => brandVars(base),
  }),

  color({
    id: "paper",
    label: "Page colour",
    description: "What everything sits on. A dark colour turns the whole portal dark.",
    group: "colors",
    card: "paper",
    shape: "page",
    source: "--background",
    preview: ["--background", "--foreground", "--card"],
    derive: (base) => paperVars(base),
  }),

  choice({
    id: "sidebar",
    label: "Side menu",
    description: "The colour of the page, or the colour of the school.",
    group: "colors",
    card: "sidebar",
    shape: "rail",
    options: [
      { id: "paper", label: "Like the page", vars: {} },
      { id: "brand", label: "In colour", vars: SIDEBAR_ON_BRAND },
    ],
  }),

  {
    ...status("status-success", "success", "All good", "--success", [
      "--success-subtle",
      "--success-subtle-foreground",
      "--success",
    ]),
    cardLabel: "Alert colours",
    cardDescription: "Tap any of them to change it.",
  },
  status("status-warning", "warning", "Careful", "--warning", [
    "--warning-subtle",
    "--warning-subtle-foreground",
    "--warning",
  ]),
  status("status-danger", "destructive", "Error", "--destructive", [
    "--destructive-subtle",
    "--destructive-subtle-foreground",
    "--destructive",
  ]),
  status("status-info", "info", "Note", "--info", [
    "--info-subtle",
    "--info-subtle-foreground",
    "--info",
  ]),

  choice({
    id: "corners",
    label: "Corners",
    description: "From square to very round.",
    group: "shape",
    card: "corners",
    shape: "corner",
    options: [
      { id: "square", label: "Square", vars: { "--radius": "0rem" } },
      { id: "soft", label: "Slightly round", vars: { "--radius": "0.25rem" } },
      { id: "round", label: "Round", vars: { "--radius": "0.5rem" } },
      { id: "pill", label: "Very round", vars: { "--radius": "0.875rem" } },
    ],
  }),

  choice({
    id: "density",
    label: "Spacing",
    description: "How much air there is between things in a list.",
    group: "shape",
    card: "density",
    shape: "rows",
    options: [
      { id: "loose", label: "Roomy", vars: { "--spacing": "0.28rem" } },
      { id: "normal", label: "Normal", vars: { "--spacing": "0.25rem" } },
      { id: "dense", label: "Tight", vars: { "--spacing": "0.1875rem" } },
    ],
  }),

  choice({
    id: "depth",
    label: "Depth",
    description: "How far cards lift off the page.",
    group: "shape",
    card: "depth",
    shape: "card",
    options: [
      { id: "flat", label: "Flat", vars: depthVars(null) },
      { id: "soft", label: "Soft", vars: {} },
      { id: "strong", label: "Strong", vars: depthVars(STRONG_SHADOWS) },
    ],
  }),

  {
    ...choice({
      id: "body-font",
      label: "Text",
      description: "The typeface for everything.",
      group: "text",
      card: "fonts",
      shape: "type",
      columns: 2,
      options: fontOptions("--font-sans"),
    }),
    cardLabel: "Typefaces",
    cardDescription: "Only the ones the portal loads show their own shape.",
  },

  choice({
    id: "heading-font",
    label: "Headings",
    description: "The typeface for titles.",
    group: "text",
    card: "fonts",
    shape: "type",
    columns: 2,
    options: fontOptions("--font-display"),
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
