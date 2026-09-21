/**
 * El editor avanzado: una variable, un campo.
 *
 * El otro editor promete que el contraste se arregla solo; este no puede
 * prometerlo, porque su razón de ser es dejar poner lo que sea. Lo que hace es
 * enseñar la razón de contraste al lado de cada par de fondo y tinta: quien
 * entra aquí sabe lo que hace, pero que lo vea.
 *
 * @module
 */

import { ColorPicker } from "@calumet/elise-ui/color-picker";
import { Input } from "@calumet/elise-ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui/popover";
import * as React from "react";

import { nameOf, noteOf, OWNED, TOKEN_GROUPS } from "./catalog";
import { contrast, format, parse, toHex } from "./color";
import { useLabel } from "./i18n";
import type { EliseTheme } from "./theme";
import { lightTheme, tokenKinds, type EliseVar } from "./tokens.generated";

/** Props de {@link ThemeTokenEditor}. */
export type ThemeTokenEditorProps = {
  /** El mismo tema que edita `ThemeEditor`: los dos escriben el mismo objeto. */
  value: EliseTheme;
  onChange: (theme: EliseTheme) => void;
  className?: string;
};

/* Un `-foreground` se lee encima de la variable de la que cuelga, y
   `--foreground` encima del papel. Con eso sale el par que se mide. */
const backdropOf = (name: EliseVar): EliseVar | null => {
  if (name === "--foreground") return "--background";
  if (!name.endsWith("-foreground")) return null;
  const base = name.slice(0, -"-foreground".length) as EliseVar;
  return base in lightTheme ? base : null;
};

const Ratio = ({ name, theme }: { name: EliseVar; theme: EliseTheme }) => {
  const backdrop = backdropOf(name);
  if (!backdrop) return null;

  const ink = parse(theme[name] ?? lightTheme[name]);
  const under = parse(theme[backdrop] ?? lightTheme[backdrop]);
  if (!ink || !under) return null;

  const ratio = contrast(ink, under);
  const poor = ratio < 4.5;
  return (
    <span
      className={`shrink-0 font-mono text-2xs ${poor ? "text-warning" : "text-muted-foreground"}`}
      title={`${nameOf(name)} / ${nameOf(backdrop)}`}
    >
      {ratio.toFixed(1)}:1
    </span>
  );
};

const Swatch = ({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (next: string) => void;
}): React.JSX.Element => {
  const parsed = parse(value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={useLabel("advanced.pick", "Pick a colour")}
          className="size-8 shrink-0 cursor-pointer rounded-sm border border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          style={{ background: value }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <ColorPicker
          value={parsed ? toHex(parsed) : "#000000"}
          onValueCommit={(next) => {
            const read = parse(next);
            if (read) onCommit(format(read));
          }}
        />
      </PopoverContent>
    </Popover>
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
  const derived = useLabel("advanced.derived", "set by the simple editor");
  const note = noteOf(name);
  const current = value[name] ?? lightTheme[name];
  const changed = value[name] !== undefined;

  const write = (next: string) => {
    const theme = { ...value };
    /* Vaciar el campo saca la variable del tema, que es volver a la hoja. */
    if (next.trim() === "") delete theme[name];
    else theme[name] = next;
    onChange(theme);
  };

  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-medium text-foreground">{nameOf(name)}</span>
        <code className="font-mono text-2xs text-muted-foreground">{name}</code>
        <span className="flex-1" />
        <Ratio name={name} theme={value} />
      </div>
      {note ? <span className="text-2xs leading-snug text-muted-foreground">{note}</span> : null}
      <div className="flex items-center gap-2">
        {tokenKinds[name] === "color" ? <Swatch value={current} onCommit={write} /> : null}
        <Input
          size="sm"
          aria-label={nameOf(name)}
          value={current}
          onChange={(event) => write(event.target.value)}
          className={`min-w-0 flex-1 font-mono text-xs ${changed ? "" : "text-muted-foreground"}`}
        />
      </div>
      {OWNED.has(name) ? <span className="text-2xs text-muted-foreground">{derived}</span> : null}
    </div>
  );
};

/**
 * Todas las variables del tema, una por campo, con su nombre y su grupo.
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
  const search = useLabel("advanced.search", "Search a variable");
  const title = useLabel("advanced.title", "Every variable");
  const subtitle = useLabel(
    "advanced.subtitle",
    "Contrast is shown here, not corrected. Empty a field to go back to the sheet.",
  );

  const groups = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return TOKEN_GROUPS;
    return TOKEN_GROUPS.map((group) => ({
      ...group,
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
