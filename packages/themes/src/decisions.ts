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

import { at, contrast, format, lighten, parse, readableOn, step, type Oklch } from "./color";
import type { EliseTheme } from "./theme";
import { darkTheme, FONT_FAMILIES, lightTheme, type EliseVar } from "./tokens.generated";

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
  shape?: "swatch" | "page" | "rail" | "corner" | "rows" | "card" | "type" | "lines";
  /** Las variables que toca, para saber si está cambiada y para deshacerla. */
  writes: readonly (keyof EliseTheme)[];
  apply: (value: string, theme: EliseTheme) => EliseTheme;
  read: (theme: EliseTheme) => string;
};

/** Una decisión de color suelto. */
export type ColorDecision = Common & {
  kind: "color";
  /** Las variables con las que el control se dibuja: el relleno, la tinta de encima y el acento. */
  preview: readonly [keyof EliseTheme, keyof EliseTheme, keyof EliseTheme];
  /** Lo que sale del color elegido, para enseñarlo al lado de la muestra. */
  ramp: readonly (keyof EliseTheme)[];
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

/* El tema guardado es la diferencia, no una copia: lo que nadie tocó hereda lo que la hoja cambie. */
const onlyChanges = (vars: Vars): EliseTheme => {
  const changed: Vars = {};
  for (const [name, value] of Object.entries(vars) as [EliseVar, string][]) {
    if (value !== lightTheme[name]) changed[name] = value;
  }
  return changed;
};

/* Referencia y no valor: el tinte sigue vivo cuando cambian la marca o el papel. */
const tint = (over: EliseVar, amount: number, on: EliseVar = "--background") =>
  `color-mix(in oklab, var(${over}) ${amount}%, var(${on}))`;

const ink = (over: EliseVar, amount: number) =>
  `color-mix(in oklab, var(${over}) ${amount}%, var(--foreground))`;

/* El 12% es el compromiso entre el 8% que usa la hoja en claro y el 16% en oscuro. */
const borderVars = (scale: number): Vars => ({
  "--border-subtle": tint("--foreground", 9 * scale),
  "--border": tint("--foreground", 12 * scale),
  "--border-strong": tint("--foreground", 20 * scale),
  "--input": tint("--foreground", 18 * scale),
});

const HARD_BORDERS: Vars = {
  "--border-subtle": "var(--foreground)",
  "--border": "var(--foreground)",
  "--border-strong": "var(--foreground)",
  "--input": "var(--foreground)",
};

const subtleVars = (prefix: string): Vars =>
  ({
    [`--${prefix}-subtle`]: tint(`--${prefix}` as EliseVar, 14),
    [`--${prefix}-subtle-foreground`]: ink(`--${prefix}` as EliseVar, 65),
  }) as Vars;

const SIDE_VARS = (Object.keys(darkTheme) as EliseVar[]).filter(
  (name) => darkTheme[name] !== lightTheme[name],
);

const NEUTRAL_CHROMA = 0.02;
const OKLCH_IN_VALUE = /oklch\(([\d.]+) ([\d.]+) ([\d.]+)([^)]*)\)/g;

/* La hoja de su lado movida lo que el papel se aparta de su fondo; los grises toman además su tono. */
const sideSheet = (paper: Oklch): Record<EliseVar, string> => {
  const sheet = paper.l < 0.5 ? darkTheme : lightTheme;
  const from = parse(sheet["--background"]) as Oklch;
  const moved = { ...sheet };
  if (format(paper) === sheet["--background"]) return moved;
  for (const name of SIDE_VARS) {
    moved[name] = sheet[name].replace(OKLCH_IN_VALUE, (whole, l, c, h, alpha: string) => {
      const value: Oklch = { l: Number(l), c: Number(c), h: Number(h) };
      if (value.c === 0 && (value.l === 0 || value.l === 1)) return whole;
      const neutral = value.c <= NEUTRAL_CHROMA;
      const text = format({
        l: lighten(value, paper.l - from.l).l,
        c: neutral ? Math.max(0, value.c + paper.c - from.c) : value.c,
        h: neutral ? (value.h + paper.h - from.h + 360) % 360 : value.h,
      });
      return alpha ? `${text.slice(0, -1)}${alpha})` : text;
    });
  }
  moved["--background"] = format(paper);
  return moved;
};

const paperOf = (theme: EliseTheme): Oklch | null => parse(theme["--background"] ?? "");

const underlay = (theme: EliseTheme): EliseTheme => {
  const paper = paperOf(theme);
  if (!paper) return {};
  const { "--background": _paper, ...under } = onlyChanges(sideSheet(paper));
  return under;
};

const SHEET_PAPER = parse(lightTheme["--background"]) as Oklch;

const liftUntil = (color: Oklch, paper: Oklch, ratio: number): Oklch => {
  let lifted = color;
  while (lifted.l < 0.98 && contrast(lifted, paper) < ratio) lifted = lighten(lifted, 0.01);
  return lifted;
};

const stateStep = (sheet: Record<EliseVar, string>, base: Oklch, state: EliseVar, from: EliseVar) =>
  lighten(base, (parse(sheet[state]) as Oklch).l - (parse(sheet[from]) as Oklch).l);

const chart = (sheet: Record<EliseVar, string>, base: Oklch, name: EliseVar) => {
  const { l, c } = parse(sheet[name]) as Oklch;
  return format(at(base, l, c));
};

const brandVars = (base: Oklch, paper: Oklch): Vars => {
  const dark = paper.l < 0.5;
  const sheet = sideSheet(paper);
  /* El enlace es texto sobre el papel, así que necesita su propia luminosidad. */
  const link = dark ? liftUntil(base, paper, 4.5) : step(base, 0.128);
  const ring = dark ? liftUntil(base, paper, 3) : base;
  return {
    "--primary": format(base),
    "--primary-hover": format(
      dark ? stateStep(sheet, base, "--primary-hover", "--primary") : step(base, 0.048),
    ),
    "--primary-active": format(
      dark ? stateStep(sheet, base, "--primary-active", "--primary") : step(base, 0.088),
    ),
    "--accent": tint("--primary", 18),
    "--accent-foreground": ink("--primary", 70),
    "--primary-foreground": format(readableOn(base)),
    "--ring": format(ring),
    "--link": format(link),
    "--link-hover": format(dark ? lighten(link, 0.06) : step(base, 0.068)),
    "--link-active": format(dark ? lighten(link, 0.11) : step(base, 0.028)),
    "--sidebar-primary": format(base),
    "--sidebar-primary-foreground": format(readableOn(base)),
    "--sidebar-ring": format(ring),
    "--inverse-accent": format(at(base, 0.3, 0.085)),
    "--inverse-accent-foreground": format(at(base, 0.88, 0.06)),
    "--chart-1": chart(sheet, base, "--chart-1"),
    "--chart-2": chart(sheet, base, "--chart-2"),
    "--chart-3": chart(sheet, base, "--chart-3"),
    "--chart-4": chart(sheet, base, "--chart-4"),
    "--chart-5": chart(sheet, base, "--chart-5"),
  };
};

const statusVars = (prefix: string, base: Oklch, paper: Oklch): Vars => {
  const dark = paper.l < 0.5;
  const sheet = sideSheet(paper);
  const name = (suffix: string) => `--${prefix}${suffix}` as EliseVar;
  return {
    [name("")]: format(base),
    [name("-foreground")]: format(readableOn(base)),
    [name("-hover")]: format(
      dark ? stateStep(sheet, base, name("-hover"), name("")) : step(base, 0.045),
    ),
    [name("-active")]: format(
      dark ? stateStep(sheet, base, name("-active"), name("")) : step(base, 0.085),
    ),
    ...subtleVars(prefix),
  } as Vars;
};

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

const alphas = (shadow: string) =>
  [...shadow.matchAll(/\/ ([\d.]+)\)/g)].map((match) => Number(match[1]));

/* Cada nivel guarda con la sombra de su lado la proporción que tiene con la clara. */
const strongShadows = (theme: EliseTheme): string[] => {
  const paper = paperOf(theme);
  const sheet = paper ? sideSheet(paper) : lightTheme;
  return ELEVATION.map((name, index) => {
    const factor = Math.max(...alphas(sheet[name])) / Math.max(...alphas(lightTheme[name]));
    const shadowInk = (/oklch\([^/]+/.exec(sheet[name])?.[0] ?? SHADOW_INK).trimEnd();
    return STRONG_SHADOWS[index].replace(
      /oklch\([^/]+\/ ([\d.]+)\)/g,
      (_shadow, alpha: string) =>
        `${shadowInk} / ${Number(Math.min(1, Number(alpha) * factor).toFixed(3))})`,
    );
  });
};

const depthVars = (shadows: readonly string[] | null): Vars => {
  const vars: Vars = {};
  ELEVATION.forEach((name, index) => {
    vars[name] = shadows ? shadows[index] : "none";
  });
  return vars;
};

const fontOptions = (name: EliseVar) =>
  FONT_FAMILIES.map(({ id, label, stack }) => ({ id, label, vars: { [name]: stack } as Vars }));

/** Escoge entre opciones que escriben cada una lo suyo. */
const choice = (
  common: Omit<Common, "writes" | "apply" | "read"> & {
    columns?: number;
    options: readonly (ChoiceOption & { vars: Vars | ((theme: EliseTheme) => Vars) })[];
    /** La opción que hace de hoja cuando ninguna escribe lo mismo que ella. */
    sheet?: string;
  },
): ChoiceDecision => {
  const { options, sheet, ...rest } = common;
  const fragment = (id: string, theme: EliseTheme): EliseTheme => {
    const vars = options.find((option) => option.id === id)?.vars ?? {};
    return onlyChanges(typeof vars === "function" ? vars(theme) : vars);
  };
  const writes = [...new Set(options.flatMap((option) => Object.keys(fragment(option.id, {}))))];

  return {
    ...rest,
    kind: "choice",
    options: options.map(({ id, label }) => ({ id, label })),
    writes: writes as EliseVar[],
    apply: fragment,
    /* La que no escribe nada es la de la hoja, y esa es la respuesta si ninguna otra encaja. */
    read: (theme) => {
      for (const option of options) {
        const written = fragment(option.id, theme);
        const names = Object.keys(written) as (keyof EliseTheme)[];
        if (names.length > 0 && names.every((name) => theme[name] === written[name])) {
          return option.id;
        }
      }
      return (
        options.find((option) => Object.keys(fragment(option.id, {})).length === 0)?.id ??
        sheet ??
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
    ramp: readonly EliseVar[];
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
      /* Volver al color de la hoja no escribe nada: lo pone el papel, o la hoja si no hay papel. */
      if (format(base) === lightTheme[source]) return {};
      return onlyChanges(derive(base, theme));
    },
    read: (theme) => {
      const value = theme[source];
      return value === undefined || value === underlay(theme)[source] ? lightTheme[source] : value;
    },
  };
};

const status = (
  id: string,
  prefix: string,
  label: string,
  source: EliseVar,
  preview: readonly [EliseVar, EliseVar, EliseVar],
  ramp: readonly EliseVar[],
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
    ramp,
    derive: (base, theme) => statusVars(prefix, base, paperOf(theme) ?? SHEET_PAPER),
  });

/** Las decisiones que Elise considera de diseño. El consumidor recorta. */
export const DECISIONS: readonly Decision[] = [
  color({
    id: "brand",
    label: "Brand colour",
    description: "Buttons, links and anything selected.",
    group: "colors",
    card: "brand",
    source: "--primary",
    preview: ["--primary", "--primary-foreground", "--link"],
    ramp: ["--primary", "--primary-hover", "--primary-active", "--primary-foreground", "--link"],
    derive: (base, theme) => brandVars(base, paperOf(theme) ?? SHEET_PAPER),
  }),

  color({
    id: "paper",
    label: "Page colour",
    description: "What everything sits on. A dark colour turns the whole app dark.",
    group: "colors",
    card: "paper",
    source: "--background",
    preview: ["--background", "--foreground", "--card"],
    ramp: ["--background", "--canvas", "--card", "--border", "--muted-foreground", "--foreground"],
    derive: (base) => {
      const sheet = sideSheet(base);
      return Object.fromEntries(SIDE_VARS.map((name) => [name, sheet[name]]));
    },
  }),

  choice({
    id: "sidebar",
    label: "Side menu",
    description: "The colour of the page, or the brand colour.",
    group: "colors",
    card: "sidebar",
    shape: "rail",
    options: [
      { id: "paper", label: "Like the page", vars: {} },
      { id: "brand", label: "In colour", vars: SIDEBAR_ON_BRAND },
    ],
  }),

  {
    ...status(
      "status-success",
      "success",
      "All good",
      "--success",
      ["--success-subtle", "--success-subtle-foreground", "--success"],
      ["--success", "--success-hover", "--success-foreground"],
    ),
    cardLabel: "Alert colours",
    cardDescription: "Tap any of them to change it.",
  },
  status(
    "status-warning",
    "warning",
    "Careful",
    "--warning",
    ["--warning-subtle", "--warning-subtle-foreground", "--warning"],
    ["--warning", "--warning-hover", "--warning-foreground"],
  ),
  status(
    "status-danger",
    "destructive",
    "Error",
    "--destructive",
    ["--destructive-subtle", "--destructive-subtle-foreground", "--destructive"],
    ["--destructive", "--destructive-hover", "--destructive-foreground"],
  ),
  status(
    "status-info",
    "info",
    "Note",
    "--info",
    ["--info-subtle", "--info-subtle-foreground", "--info"],
    ["--info", "--info-hover", "--info-foreground"],
  ),

  choice({
    id: "borders",
    label: "Lines",
    description: "How visible the lines around things are.",
    group: "shape",
    card: "borders",
    shape: "lines",
    sheet: "normal",
    options: [
      { id: "faint", label: "Faint", vars: borderVars(0.5) },
      { id: "normal", label: "Normal", vars: borderVars(1) },
      { id: "strong", label: "Strong", vars: borderVars(2) },
      { id: "hard", label: "Solid", vars: HARD_BORDERS },
    ],
  }),

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
      { id: "pill", label: "Very round", vars: { "--radius": "1rem" } },
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
      { id: "strong", label: "Strong", vars: (theme) => depthVars(strongShadows(theme)) },
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
    cardDescription: "Only the ones the app loads show their own shape.",
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

const PAPER = DECISIONS.find((decision) => decision.id === "paper") as Decision;

const OWNED = new Set(DECISIONS.flatMap((decision) => decision.writes));

/** Si la decisión está escrita en el tema, aunque sea a medias. Lo que pone el papel no cuenta. */
export const isChanged = (decision: Decision, theme: EliseTheme): boolean => {
  if (decision === PAPER) return theme["--background"] !== undefined;
  const under = underlay(theme);
  return decision.writes.some((name) => theme[name] !== undefined && theme[name] !== under[name]);
};

const matches = (decision: Decision, theme: EliseTheme): boolean => {
  const written = decision.apply(decision.read(theme), theme);
  const names = Object.keys(written) as (keyof EliseTheme)[];
  return names.length > 0 && names.every((name) => theme[name] === written[name]);
};

const relayer = (decision: Decision, theme: EliseTheme, next: EliseTheme): EliseTheme => {
  if (!isChanged(decision, theme)) return {};
  const value = decision.read(theme);
  if (decision.kind === "color" ? value !== decision.read({}) : matches(decision, theme)) {
    return decision.apply(value, next);
  }
  const under = underlay(theme);
  const kept: EliseTheme = {};
  for (const name of decision.writes) {
    if (theme[name] !== undefined && theme[name] !== under[name]) kept[name] = theme[name];
  }
  return kept;
};

const compose = (theme: EliseTheme, target: Decision, value?: string): EliseTheme => {
  const replaced = new Set<keyof EliseTheme>([...OWNED, ...target.writes]);
  let next = Object.fromEntries(
    Object.entries(theme).filter(([name]) => !replaced.has(name as keyof EliseTheme)),
  ) as EliseTheme;
  const paper = target === PAPER ? value : theme["--background"];
  if (paper !== undefined) next = { ...next, ...PAPER.apply(paper, next) };

  const layers = DECISIONS.includes(target) ? DECISIONS : [...DECISIONS, target];
  for (const decision of layers) {
    if (decision === PAPER) continue;
    const own = decision === target && value !== undefined ? decision.apply(value, next) : {};
    next = { ...next, ...(decision === target ? own : relayer(decision, theme, next)) };
  }
  return next;
};

/** Saca la decisión del tema, en vez de escribirle el valor de la hoja. */
export const clear = (decision: Decision, theme: EliseTheme): EliseTheme =>
  compose(theme, decision);

/**
 * Cambia una decisión: borra lo que tenía escrito y escribe lo nuevo.
 *
 * Los dos pasos van juntos porque una decisión puede no escribir nada, como
 * cuando se vuelve al valor de la hoja, y entonces lo anterior tiene que salir
 * igual.
 */
export const set = (decision: Decision, theme: EliseTheme, value: string): EliseTheme =>
  compose(theme, decision, value);
