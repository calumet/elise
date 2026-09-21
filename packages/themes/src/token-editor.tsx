/**
 * El editor avanzado: avanzado porque deja cambiarlo todo, no porque pida saber
 * CSS. No hay nombres de variable en pantalla ni campos donde escribir código:
 * un color se elige, un tamaño se desliza y una sombra se arma con sus números.
 *
 * El otro editor promete que el contraste se arregla solo; este no puede
 * prometerlo, porque su razón de ser es dejar poner lo que sea. Lo que hace es
 * decir en voz alta si el texto se va a leer.
 *
 * @module
 */

import { ColorPicker } from "@calumet/elise-ui/color-picker";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@calumet/elise-ui/combobox";
import { Input } from "@calumet/elise-ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui/popover";
import { Slider } from "@calumet/elise-ui/slider";
import * as React from "react";

import { nameOf, noteOf, OWNED, TOKEN_GROUPS } from "./catalog";
import { contrast, parse, toHex } from "./color";
import { useLabel } from "./i18n";
import type { EliseTheme } from "./theme";
import { FONT_FAMILIES, lightTheme, tokenKinds, type EliseVar } from "./tokens.generated";
import { formatShadow, formatSize, linkedTo, parseShadow, parseSize, type Shadow } from "./values";

/** Props de {@link ThemeTokenEditor}. */
export type ThemeTokenEditorProps = {
  /** El mismo tema que edita `ThemeEditor`: los dos escriben el mismo objeto. */
  value: EliseTheme;
  onChange: (theme: EliseTheme) => void;
  className?: string;
};

type Write = (next: string) => void;

/* Un `-foreground` se lee encima de la variable de la que cuelga. */
const backdropOf = (name: EliseVar): EliseVar | null => {
  if (name === "--foreground") return "--background";
  if (!name.endsWith("-foreground")) return null;
  const base = name.slice(0, -"-foreground".length) as EliseVar;
  return base in lightTheme ? base : null;
};

/* Los umbrales de la WCAG para texto corriente: 4.5 pasa y 7 pasa de sobra. */
const Legibility = ({ name, theme }: { name: EliseVar; theme: EliseTheme }) => {
  const good = useLabel("legible.good", "Easy to read");
  const fair = useLabel("legible.fair", "Readable, but only just");
  const poor = useLabel("legible.poor", "Hard to read");

  const backdrop = backdropOf(name);
  if (!backdrop) return null;

  const ink = parse(theme[name] ?? lightTheme[name]);
  const under = parse(theme[backdrop] ?? lightTheme[backdrop]);
  if (!ink || !under) return null;

  const ratio = contrast(ink, under);
  const tone =
    ratio >= 7 ? "text-success" : ratio >= 4.5 ? "text-muted-foreground" : "text-warning";
  const words = ratio >= 7 ? good : ratio >= 4.5 ? fair : poor;

  return (
    <span className={`shrink-0 text-2xs ${tone}`}>
      {words} · {ratio.toFixed(1)}:1
    </span>
  );
};

const Colour = ({ current, write }: { current: string; write: Write }) => {
  const pick = useLabel("advanced.pick", "Pick a colour");
  const follows = useLabel("advanced.follows", "follows {name}");
  const linked = linkedTo(current);
  const parsed = linked ? null : parse(current);
  const hex = parsed ? toHex(parsed) : "";

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={pick}
            className="size-8 shrink-0 cursor-pointer rounded-sm border border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            style={{ background: current }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <ColorPicker value={hex || "#000000"} onValueCommit={write} />
        </PopoverContent>
      </Popover>
      {linked ? (
        /* Un valor atado no tiene hex que enseñar, y su fórmula no le sirve a nadie. */
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {follows.replace("{name}", nameOf(linked as EliseVar))}
        </span>
      ) : (
        <Input
          size="sm"
          aria-label={pick}
          value={hex}
          onChange={(event) => write(event.target.value)}
          className="min-w-0 flex-1 font-mono text-xs uppercase"
        />
      )}
    </div>
  );
};

const LIMITS: Record<string, { max: number; step: number }> = {
  "--radius": { max: 2, step: 0.0625 },
  "--spacing": { max: 0.4, step: 0.01 },
};

const Sizes = ({ name, current, write }: { name: EliseVar; current: string; write: Write }) => {
  const size = parseSize(current);
  if (!size) return null;

  const limits =
    LIMITS[name] ?? (size.unit === "ms" ? { max: 600, step: 10 } : { max: 4, step: 0.05 });

  return (
    <div className="flex items-center gap-3">
      <Slider
        aria-label={nameOf(name)}
        value={[size.value]}
        min={0}
        max={limits.max}
        step={limits.step}
        onValueChange={([next]) => write(formatSize({ ...size, value: next }))}
        className="flex-1"
      />
      <span className="w-16 shrink-0 text-right font-mono text-xs text-muted-foreground">
        {formatSize(size)}
      </span>
    </div>
  );
};

const SHADOW_PARTS = [
  { key: "x", label: "Sideways", min: -24, max: 24, step: 1 },
  { key: "y", label: "Down", min: -24, max: 24, step: 1 },
  { key: "blur", label: "Softness", min: 0, max: 64, step: 1 },
  { key: "alpha", label: "Strength", min: 0, max: 1, step: 0.01 },
] as const;

const ShadowPart = ({
  part,
  name,
  shadow,
  write,
}: {
  part: (typeof SHADOW_PARTS)[number];
  name: EliseVar;
  shadow: Shadow;
  write: Write;
}) => {
  const label = useLabel(`shadow.${part.key}`, part.label);
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-2xs text-muted-foreground">{label}</span>
      <Slider
        aria-label={`${nameOf(name)}, ${label}`}
        value={[shadow[part.key]]}
        min={part.min}
        max={part.max}
        step={part.step}
        onValueChange={([next]) => write(formatShadow({ ...shadow, [part.key]: next }))}
        className="flex-1"
      />
    </div>
  );
};

const Shadows = ({ name, current, write }: { name: EliseVar; current: string; write: Write }) => {
  const shadow = parseShadow(current);
  if (!shadow) return null;

  return (
    <div className="flex items-start gap-3">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted">
        <span
          className="size-8 rounded-sm border border-border bg-card"
          style={{ boxShadow: current }}
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {SHADOW_PARTS.map((part) => (
          <ShadowPart key={part.key} part={part} name={name} shadow={shadow} write={write} />
        ))}
      </div>
    </div>
  );
};

const Family = ({ current, write }: { current: string; write: Write }) => {
  const search = useLabel("list.search", "Type to search");
  const empty = useLabel("list.empty", "Nothing matches");
  const chosen = FONT_FAMILIES.find((family) => current.includes(family.label));

  return (
    <Combobox
      value={chosen?.id ?? ""}
      onValueChange={(next) => {
        const family = FONT_FAMILIES.find((item) => item.id === next);
        if (family) write(family.stack);
      }}
    >
      <ComboboxTrigger>
        <ComboboxValue placeholder={search}>
          <span style={{ fontFamily: current }}>{chosen?.label}</span>
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder={search} />
        <ComboboxList>
          <ComboboxEmpty>{empty}</ComboboxEmpty>
          {FONT_FAMILIES.map((family) => (
            <ComboboxItem key={family.id} value={family.id} keywords={[family.label]}>
              <span style={{ fontFamily: family.stack }}>{family.label}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

const Row = ({
  name,
  value,
  onChange,
}: {
  name: EliseVar;
  value: EliseTheme;
  onChange: (theme: EliseTheme) => void;
}) => {
  const derived = useLabel("advanced.derived", "The simple editor also sets this one.");
  const note = noteOf(name);
  const current = value[name] ?? lightTheme[name];

  const write: Write = (next) => {
    const theme = { ...value };
    if (next.trim() === "") delete theme[name];
    else theme[name] = next;
    onChange(theme);
  };

  const kind = tokenKinds[name];
  const isFamily = name.startsWith("--font-");

  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-medium text-foreground">{nameOf(name)}</span>
        <span className="flex-1" />
        <Legibility name={name} theme={value} />
      </div>
      {note ? <span className="text-2xs leading-snug text-muted-foreground">{note}</span> : null}

      {kind === "color" ? <Colour current={current} write={write} /> : null}
      {kind === "shadow" ? <Shadows name={name} current={current} write={write} /> : null}
      {kind === "size" || (kind === "other" && !isFamily) ? (
        <Sizes name={name} current={current} write={write} />
      ) : null}
      {isFamily ? <Family current={current} write={write} /> : null}

      {OWNED.has(name) ? <span className="text-2xs text-muted-foreground">{derived}</span> : null}
    </div>
  );
};

/**
 * Todas las variables del tema, cada una con el control que le corresponde.
 *
 * Va aparte de `ThemeEditor` a propósito: escriben el mismo objeto, pero no se
 * parecen en nada y la aplicación decide si son dos pestañas, dos pantallas o
 * un enlace escondido.
 *
 * ```tsx
 * <ThemeTokenEditor value={tema} onChange={setTema} />
 * ```
 */
export const ThemeTokenEditor = ({
  value,
  onChange,
  className,
}: ThemeTokenEditorProps): React.JSX.Element => {
  const [query, setQuery] = React.useState("");
  const search = useLabel("advanced.search", "Search");
  const title = useLabel("advanced.title", "Everything else");
  const subtitle = useLabel(
    "advanced.subtitle",
    "Here you can change anything, one thing at a time. Nothing is corrected for you.",
  );

  const groups = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return TOKEN_GROUPS;
    return TOKEN_GROUPS.map((group) => ({
      ...group,
      /* También por el nombre de la variable, aunque no se enseñe. */
      vars: group.vars.filter(
        (name) => name.includes(needle) || nameOf(name).toLowerCase().includes(needle),
      ),
    })).filter((group) => group.vars.length > 0);
  }, [query]);

  return (
    <div
      data-slot="theme-token-editor"
      className={`flex min-h-0 flex-col bg-background ${className ?? ""}`}
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-card px-5 py-4">
        <span className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-foreground">{title}</span>
          <span className="text-xs leading-snug text-muted-foreground">{subtitle}</span>
        </span>
        <Input
          type="search"
          size="sm"
          aria-label={search}
          placeholder={search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex flex-col rounded-xl border border-border bg-card px-4 py-2"
          >
            <div className="flex flex-col gap-0.5 border-b border-border-subtle py-2.5">
              <span className="text-sm font-semibold text-foreground">{group.label}</span>
              <span className="text-xs leading-snug text-muted-foreground">
                {group.description}
              </span>
            </div>
            {group.vars.map((name) => (
              <Row key={name} name={name} value={value} onChange={onChange} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
