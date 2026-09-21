/**
 * El control de una decisión de apariencia: su rótulo, su línea de ayuda y la
 * muestra con la que se elige.
 *
 * Las opciones se dibujan solas con lo que ellas mismas escriben: la miniatura
 * de «esquinas redondas» sale redonda porque su valor es el radio, no porque
 * alguien la haya dibujado aparte. Por eso el control no sabe de tokens y aun
 * así enseña lo que hace cada opción.
 *
 * @module
 */

import { ColorPicker } from "@calumet/elise-ui/color-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui/popover";
import * as React from "react";

import { format, parse, toHex } from "./color";
import { set, type ChoiceDecision, type ColorDecision, type Decision } from "./decisions";
import type { EliseTheme } from "./theme";
import { lightTheme, type EliseVar } from "./tokens.generated";

/** Props de {@link DecisionControl}. */
export type DecisionControlProps = {
  decision: Decision;
  /** El tema en curso, del que sale lo que está elegido. */
  value: EliseTheme;
  onChange: (theme: EliseTheme) => void;
};

/* La forma con la que se dibuja cada decisión de escoger. Es lo único que el
   control sabe de cada una, y solo porque un radio y una sombra no se enseñan
   con el mismo dibujo. */
const SHAPES: Record<string, "corner" | "rows" | "card" | "page" | "rail" | "type"> = {
  corners: "corner",
  density: "rows",
  depth: "card",
  paper: "page",
  sidebar: "rail",
  headings: "type",
};

const LABEL = "text-sm font-semibold text-foreground";
const HELP = "text-xs leading-snug text-muted-foreground";
const SAMPLE = "rounded-md border border-border-subtle bg-muted p-4";

const REFERENCE = /^var\((--[a-z0-9-]+)\)$/;

/* Del fragmento de la opción, y si no de la hoja: nunca del tema en curso, que
   si no la miniatura de «redondas» saldría con el radio que ya está puesto.
   Lo que la opción escribe como referencia sí se sigue hasta el tema, que es
   como el menú con color enseña el color que hay y no el de la hoja. */
const varOf = (fragment: EliseTheme, theme: EliseTheme, name: EliseVar): string => {
  const value = fragment[name] ?? lightTheme[name];
  const reference = REFERENCE.exec(value);
  if (!reference) return value;
  const target = reference[1] as EliseVar;
  return theme[target] ?? lightTheme[target] ?? value;
};

const Preview = ({
  shape,
  vars,
  theme,
}: {
  shape: string;
  vars: EliseTheme;
  theme: EliseTheme;
}): React.JSX.Element => {
  const of = (name: EliseVar) => varOf(vars, theme, name);

  if (shape === "corner") {
    return (
      <span className="flex h-11 items-center justify-center rounded-md bg-muted">
        <span
          className="h-6 w-10 border border-border-strong bg-card"
          style={{ borderRadius: of("--radius") }}
        />
      </span>
    );
  }

  if (shape === "rows") {
    return (
      <span
        className="flex h-11 flex-col justify-center rounded-md bg-muted px-2"
        style={{ gap: `calc(${of("--spacing")} * 2)` }}
      >
        <span className="h-1 rounded-xs bg-border-strong" />
        <span className="h-1 w-3/4 rounded-xs bg-border-strong" />
        <span className="h-1 w-3/5 rounded-xs bg-border-strong" />
      </span>
    );
  }

  if (shape === "card") {
    return (
      <span className="flex h-11 items-center justify-center rounded-md bg-muted px-2">
        <span
          className="h-7 w-full rounded-md border border-border bg-card"
          style={{ boxShadow: of("--shadow-sm") }}
        />
      </span>
    );
  }

  if (shape === "page") {
    return (
      <span
        className="flex h-13 flex-col gap-1 rounded-md p-1.5"
        style={{ background: of("--canvas") }}
      >
        <span
          className="h-3 rounded-xs border"
          style={{ background: of("--card"), borderColor: of("--border") }}
        />
        <span
          className="flex-1 rounded-xs border"
          style={{ background: of("--card"), borderColor: of("--border") }}
        />
      </span>
    );
  }

  if (shape === "rail") {
    return (
      <span className="flex h-13 gap-1 rounded-md p-1.5" style={{ background: of("--canvas") }}>
        <span
          className="flex w-9 flex-col gap-1 rounded-xs p-1"
          style={{ background: of("--sidebar") }}
        >
          <span className="h-1 rounded-xs" style={{ background: of("--sidebar-foreground") }} />
          <span
            className="h-1 w-3/4 rounded-xs"
            style={{ background: of("--sidebar-muted-foreground") }}
          />
          <span
            className="h-1 w-4/5 rounded-xs"
            style={{ background: of("--sidebar-muted-foreground") }}
          />
        </span>
        <span
          className="flex-1 rounded-xs border"
          style={{ background: of("--card"), borderColor: of("--border") }}
        />
      </span>
    );
  }

  return (
    <span className="flex h-11 items-center justify-center rounded-md bg-muted">
      <span
        className="text-xl font-semibold text-foreground"
        style={{ fontFamily: of("--font-display") }}
      >
        Aa
      </span>
    </span>
  );
};

const Head = ({ decision }: { decision: Decision }) => (
  <span className="flex flex-col gap-0.5">
    <span className={LABEL}>{decision.label}</span>
    {decision.description ? <span className={HELP}>{decision.description}</span> : null}
  </span>
);

const Choice = ({
  decision,
  value,
  onChange,
}: DecisionControlProps & { decision: ChoiceDecision }) => {
  const chosen = decision.read(value);
  const shape = SHAPES[decision.id] ?? "card";

  return (
    <div className="flex flex-col gap-3">
      <Head decision={decision} />
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${decision.options.length}, minmax(0, 1fr))` }}
      >
        {decision.options.map((option) => {
          const selected = option.id === chosen;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(set(decision, value, option.id))}
              className={`flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-2 text-left transition-[box-shadow,border-color] duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
                selected
                  ? "border-primary ring-2 ring-primary"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <Preview shape={shape} vars={decision.apply(option.id, value)} theme={value} />
              <span
                className={`text-2xs ${selected ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Swatch = ({
  decision,
  value,
  onChange,
  children,
}: DecisionControlProps & { decision: ColorDecision; children: React.ReactNode }) => {
  const current = decision.read(value);
  const hex = React.useMemo(() => {
    const parsed = parse(current);
    return parsed ? toHex(parsed) : "#000000";
  }, [current]);

  const commit = (next: string) => {
    const parsed = parse(next);
    if (parsed) onChange(set(decision, value, format(parsed)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <ColorPicker value={hex} onValueCommit={commit} />
      </PopoverContent>
    </Popover>
  );
};

const Color = ({
  decision,
  value,
  onChange,
}: DecisionControlProps & { decision: ColorDecision }) => {
  const [fill, ink, accent] = decision.preview;
  const of = (name: EliseVar) => value[name] ?? lightTheme[name];

  if (decision.compact) {
    return (
      <Swatch decision={decision} value={value} onChange={onChange}>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          style={{ background: of(fill), color: of(ink), borderColor: of(ink) + "33" }}
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: of(accent) }}
            aria-hidden="true"
          />
          {decision.label}
        </button>
      </Swatch>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Head decision={decision} />
      <div className={`flex items-center gap-3.5 ${SAMPLE}`}>
        <span
          className="inline-flex h-8 items-center rounded-md px-3.5 text-sm font-medium"
          style={{ background: of(fill), color: of(ink) }}
        >
          Inscribirme
        </span>
        <span className="text-sm" style={{ color: of(accent) }}>
          Ver el reglamento
        </span>
      </div>
      <Swatch decision={decision} value={value} onChange={onChange}>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-input bg-card p-1.5 text-left transition-[border-color] duration-(--duration-fast) hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span
            className="size-7 shrink-0 rounded-sm border border-border-strong"
            style={{ background: of(fill) }}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground uppercase">
            {hexOf(decision.read(value))}
          </span>
          <span className="shrink-0 pr-1.5 text-xs font-medium text-foreground">Cambiar</span>
        </button>
      </Swatch>
    </div>
  );
};

const hexOf = (value: string) => {
  const parsed = parse(value);
  return parsed ? toHex(parsed) : value;
};

/**
 * El control de una sola decisión, sin caja alrededor.
 *
 * Va suelto cuando la aplicación quiere armar su propia pantalla; si no,
 * `ThemeEditor` los acomoda todos.
 */
export const DecisionControl = ({
  decision,
  value,
  onChange,
}: DecisionControlProps): React.JSX.Element =>
  decision.kind === "color" ? (
    <Color decision={decision} value={value} onChange={onChange} />
  ) : (
    <Choice decision={decision} value={value} onChange={onChange} />
  );
