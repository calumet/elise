/**
 * El editor de apariencia: acomoda los controles y pone el pie.
 *
 * No trae pantalla ni vista previa. Va donde quiera la aplicación, un sidebar o
 * una sheet, y es ella la que dibuja al lado la página que se está tintando.
 *
 * @module
 */

import * as React from "react";

import { DecisionControl } from "./decision-control";
import { clear, DECISIONS, type Decision, type DecisionGroup } from "./decisions";
import { useLabel } from "./i18n";
import type { EliseTheme } from "./theme";
import { lightTheme, type EliseVar } from "./tokens.generated";

/** Props de {@link ThemeEditor}. */
export type ThemeEditorProps = {
  /** El tema en curso: solo lo que se apartó de la hoja. */
  value: EliseTheme;
  onChange: (theme: EliseTheme) => void;
  /**
   * Las decisiones que se enseñan, por su id y en su orden. Sin esto salen
   * todas, que es lo que quiere una app donde el inquilino manda; una con
   * menos margen pasa las suyas.
   */
  decisions?: readonly string[];
  className?: string;
};

const GROUPS: readonly { id: DecisionGroup; label: string }[] = [
  { id: "colors", label: "Colour" },
  { id: "shape", label: "Shape" },
  { id: "text", label: "Type" },
];

const GroupLabel = ({ group }: { group: { id: DecisionGroup; label: string } }) => (
  <span className="px-1 pt-1 text-2xs font-semibold tracking-wider text-muted-foreground uppercase">
    {useLabel(`group.${group.id}`, group.label)}
  </span>
);

const CardHead = ({ decision }: { decision: Decision }) => {
  const label = useLabel(`${decision.card}.card.label`, decision.cardLabel ?? decision.label);
  const help = useLabel(
    `${decision.card}.card.description`,
    decision.cardDescription ?? decision.description,
  );
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {decision.cardDescription ? (
        <span className="text-xs leading-snug text-muted-foreground">{help}</span>
      ) : null}
    </span>
  );
};

const FOOT_BUTTON =
  "inline-flex h-8 cursor-pointer items-center rounded-md border border-input bg-card px-2.5 text-xs text-foreground transition-[border-color] duration-(--duration-fast) hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/* Un tema que llega de un archivo es texto de fuera: solo entran las variables
   que la hoja declara, y solo si su valor es una cadena. */
const asTheme = (parsed: unknown): EliseTheme | null => {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const theme: EliseTheme = {};
  for (const [name, value] of Object.entries(parsed)) {
    if (typeof value === "string" && name in lightTheme) theme[name as EliseVar] = value;
  }
  return Object.keys(theme).length > 0 ? theme : null;
};

/** Las decisiones pedidas, agrupadas por tarjeta sin perder el orden. */
const cardsOf = (ids: readonly string[] | undefined) => {
  const wanted = ids
    ? ids.map((id) => DECISIONS.find((decision) => decision.id === id)).filter(Boolean)
    : DECISIONS;
  const cards = new Map<string, Decision[]>();
  for (const decision of wanted as Decision[]) {
    const group = cards.get(decision.card);
    if (group) group.push(decision);
    else cards.set(decision.card, [decision]);
  }
  return [...cards.values()];
};

/**
 * El editor de apariencia entero, listo para soltar en un sidebar.
 *
 * ```tsx
 * <ThemeEditor value={tema} onChange={setTema} />
 * <ThemeEditor value={tema} onChange={setTema} decisions={["brand", "corners"]} />
 * ```
 */
export const ThemeEditor = ({
  value,
  onChange,
  decisions,
  className,
}: ThemeEditorProps): React.JSX.Element => {
  const [failed, setFailed] = React.useState(false);
  const file = React.useRef<HTMLInputElement>(null);
  const title = useLabel("editor.title", "Appearance");
  const subtitle = useLabel("editor.subtitle", "Every change is drawn here. Nothing is saved yet.");
  const reset = useLabel("editor.reset", "Back to how it was");
  const exportLabel = useLabel("editor.export", "Export");
  const importLabel = useLabel("editor.import", "Import");
  const badFile = useLabel("editor.badFile", "That file is not a theme.");
  const cards = React.useMemo(() => cardsOf(decisions), [decisions]);
  const shown = React.useMemo(() => cards.flat(), [cards]);

  const resetAll = () => {
    let next = value;
    for (const decision of shown) next = clear(decision, next);
    onChange(next);
  };

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tema.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = async (chosen: File) => {
    setFailed(false);
    try {
      const theme = asTheme(JSON.parse(await chosen.text()));
      if (theme) onChange(theme);
      else setFailed(true);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div
      data-slot="theme-editor"
      className={`flex min-h-0 flex-col bg-background ${className ?? ""}`}
    >
      <div className="flex shrink-0 flex-col gap-0.5 border-b border-border bg-card px-5 py-4">
        <span className="text-base font-semibold text-foreground">{title}</span>
        <span className="text-xs leading-snug text-muted-foreground">{subtitle}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {GROUPS.map(({ id, label }) => {
          const here = cards.filter((card) => card[0].group === id);
          if (here.length === 0) return null;

          return (
            <React.Fragment key={id}>
              <GroupLabel group={{ id, label }} />
              {here.map((card) => (
                <div
                  key={card[0].card}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
                >
                  {card.length > 1 ? (
                    <>
                      <CardHead decision={card[0]} />
                      {card[0].compact ? (
                        <div className="grid grid-cols-2 gap-2 rounded-md border border-border-subtle bg-muted p-3.5">
                          {card.map((decision) => (
                            <DecisionControl
                              key={decision.id}
                              decision={decision}
                              value={value}
                              onChange={onChange}
                            />
                          ))}
                        </div>
                      ) : (
                        card.map((decision) => (
                          <DecisionControl
                            key={decision.id}
                            decision={decision}
                            value={value}
                            onChange={onChange}
                          />
                        ))
                      )}
                    </>
                  ) : (
                    <DecisionControl decision={card[0]} value={value} onChange={onChange} />
                  )}
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card px-4 py-3.5">
        <div className="flex items-center gap-2">
          <button type="button" className={FOOT_BUTTON} onClick={resetAll}>
            {reset}
          </button>
          <span className="flex-1" />
          <button type="button" className={FOOT_BUTTON} onClick={exportTheme}>
            {exportLabel}
          </button>
          <button type="button" className={FOOT_BUTTON} onClick={() => file.current?.click()}>
            {importLabel}
          </button>
          {/* Lo dispara el botón de al lado, así que sale del orden de
              tabulación: `sr-only` esconde pero no quita el foco. */}
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            aria-label={importLabel}
            tabIndex={-1}
            className="sr-only"
            onChange={(event) => {
              const chosen = event.target.files?.[0];
              event.target.value = "";
              if (chosen) void importTheme(chosen);
            }}
          />
        </div>
        {failed ? <span className="text-xs text-destructive">{badFile}</span> : null}
      </div>
    </div>
  );
};
