import { Monitor, Smartphone, TriangleAlert } from "@calumet/elise-icons";
import { Button } from "@calumet/elise-ui/button";
import { Heading } from "@calumet/elise-ui/heading";
import { Popover, PopoverContent, PopoverTrigger } from "@calumet/elise-ui/popover";
import { SegmentedControl, SegmentedControlItem } from "@calumet/elise-ui/segmented-control";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import { fill, useLabels, type Labels } from "../labels";
import { EditorContent } from "../render/content";
import { fromHtml } from "../render/from-html";
import { droppedIn, type DroppedItem } from "./code-html";
import { useServices } from "./context";
import { transition, useDocument, useEditorMode, useMode } from "./modes";
import { reducedMotion } from "./motion";
import { useEditorPreview } from "./preview";

const WRAP = "min-w-0 flex-1 px-4 whitespace-pre-wrap wrap-anywhere [tab-size:2]";

type Token = { kind: "tag" | "name" | "value" | "text"; text: string };

const TOKEN = /(<\/?[a-zA-Z][\w-]*)|(\/?>)|([^\s=<>"'/]+)|("[^"]*"|'[^']*')|(=)/g;

const tokenize = (line: string, inTag: { open: boolean }): Token[] => {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    const push = (kind: Token["kind"], text: string) => tokens.push({ kind, text });
    if (at > last) push("text", line.slice(last, at));
    last = at + match[0].length;
    if (match[1]) {
      inTag.open = true;
      push("tag", match[1]);
    } else if (match[2]) {
      push(inTag.open ? "tag" : "text", match[2]);
      inTag.open = false;
    } else if (inTag.open) {
      push(match[4] ? "value" : match[3] ? "name" : "text", match[0]);
    } else push("text", match[0]);
  }
  if (last < line.length) tokens.push({ kind: "text", text: line.slice(last) });
  return tokens;
};

const TONES: Record<Token["kind"], string> = {
  tag: "text-link",
  name: "text-success-subtle-foreground",
  value: "text-warning-subtle-foreground",
  text: "text-foreground",
};

const DROPPED_LABELS: Record<DroppedItem["kind"], (t: Labels) => string> = {
  element: (t) => t.droppedElement,
  attribute: (t) => t.droppedAttribute,
  address: (t) => t.droppedAddress,
};

const summarize = (t: Labels, items: DroppedItem[]): string => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = fill(DROPPED_LABELS[item.kind](t), {
      name: item.name,
    });
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts, ([label, count]) => (count > 1 ? `${label} ×${count}` : label)).join(
    ", ",
  );
};

const CodeView = ({
  code,
  flagged,
  onChange,
  textareaRef,
}: {
  code: string;
  flagged: Set<number>;
  onChange: (code: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}): React.JSX.Element => {
  const t = useLabels();
  const lines = React.useMemo(() => {
    const state = { open: false };
    return code.split("\n").map((line) => tokenize(line, state));
  }, [code]);
  return (
    <div className="relative min-h-full py-4 font-mono text-sm leading-6">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 start-0 w-12 border-e border-border bg-muted"
      />
      <pre aria-hidden="true" className="relative m-0 font-[inherit]">
        {lines.map((tokens, index) => (
          <div
            key={index}
            data-flagged={flagged.has(index + 1) || undefined}
            className="flex data-flagged:bg-warning-subtle"
          >
            <span className="w-12 shrink-0 pe-3 text-end text-muted-foreground select-none">
              {index + 1}
            </span>
            <span className={WRAP}>
              {tokens.length
                ? tokens.map((token, at) => (
                    <span key={at} className={TONES[token.kind]}>
                      {token.text}
                    </span>
                  ))
                : "​"}
            </span>
          </div>
        ))}
      </pre>
      <textarea
        ref={textareaRef}
        aria-label={t.pageCode}
        value={code}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className={`${WRAP} absolute inset-y-0 start-12 end-0 resize-none overflow-hidden border-0 bg-transparent py-4 font-[inherit] leading-[inherit] text-foreground caret-foreground outline-none [-webkit-text-fill-color:transparent] selection:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset`}
      />
    </div>
  );
};

const Dropped = ({
  items,
  onLine,
}: {
  items: DroppedItem[];
  onLine: (line: number) => void;
}): React.JSX.Element => {
  const t = useLabels();
  const [open, setOpen] = React.useState(false);
  return (
    <div
      role="status"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-warning-subtle px-4 py-2 text-sm text-warning-subtle-foreground transition-opacity duration-(--duration-base) ease-out starting:opacity-0"
    >
      <TriangleAlert aria-hidden="true" className="size-icon-md shrink-0" />
      <span className="min-w-0 flex-1 basis-60">
        {t.droppedIntro} <span className="font-mono">{summarize(t, items)}</span>
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-warning-subtle-foreground underline underline-offset-2"
          >
            {t.seeChanges}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-1">
          <ul className="m-0 flex max-h-72 list-none flex-col overflow-y-auto p-0">
            {items.map((item) => (
              <li key={`${item.kind}-${item.at}`}>
                <button
                  type="button"
                  className="flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-start text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => {
                    setOpen(false);
                    onLine(item.line);
                  }}
                >
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {fill(t.lineNumber, { line: item.line })}
                  </span>
                  <span className="min-w-0 font-mono break-all">
                    {fill(DROPPED_LABELS[item.kind](t), {
                      name: item.name,
                    })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const CODE_MIN = 256;
const RESULT_MIN = 320;
const STEP = 2;

const useParentWidth = (ref: React.RefObject<HTMLElement | null>): number => {
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(parent);
    return () => observer.disconnect();
  }, [ref]);
  return width;
};

const Divider = ({ controls }: { controls: string }): React.JSX.Element => {
  const t = useLabels();
  const { split, setSplit } = useMode();
  const self = React.useRef<HTMLDivElement>(null);
  const width = useParentWidth(self);
  const min = width ? Math.min(50, Math.ceil((CODE_MIN / width) * 100)) : 0;
  const max = width ? Math.max(50, Math.floor(100 - (RESULT_MIN / width) * 100)) : 100;
  const clamp = (value: number) => Math.round(Math.min(max, Math.max(min, value)));
  const [dragging, setDragging] = React.useState(false);

  const follow = (event: React.PointerEvent) => {
    const box = self.current?.parentElement?.getBoundingClientRect();
    if (box?.width) setSplit(clamp(((event.clientX - box.left) / box.width) * 100));
  };

  const keys: Record<string, () => number> = {
    ArrowLeft: () => split - STEP,
    ArrowRight: () => split + STEP,
    Home: () => min,
    End: () => max,
    Enter: () => 50,
  };

  return (
    <div
      ref={self}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={t.resizePanels}
      aria-controls={controls}
      aria-valuenow={clamp(split)}
      aria-valuemin={min}
      aria-valuemax={max}
      data-dragging={dragging || undefined}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.focus();
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (dragging) follow(event);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onDoubleClick={() => setSplit(50)}
      onKeyDown={(event) => {
        const next = keys[event.key];
        if (!next) return;
        event.preventDefault();
        setSplit(clamp(next()));
      }}
      className="group relative z-sticky hidden w-px shrink-0 cursor-col-resize touch-none bg-border outline-none before:absolute before:-inset-x-1.5 before:inset-y-0 before:content-[''] md:block"
    >
      <span
        aria-hidden="true"
        className="absolute -inset-x-px inset-y-0 bg-primary opacity-0 transition-opacity duration-(--duration-fast) ease-out group-hover:opacity-100 group-focus-visible:opacity-100 group-data-dragging:opacity-100"
      />
    </div>
  );
};

export type EditorCodeProps = { title?: string; className?: string };

export const EditorCode = ({ title, className }: EditorCodeProps): React.JSX.Element | null => {
  const t = useLabels();
  const { schema } = useServices();
  const { value } = useDocument();
  const { mode } = useEditorMode();
  const { code, setCode, split } = useMode();
  const { device, setDevice } = useEditorPreview();
  const codeId = React.useId();
  const textarea = React.useRef<HTMLTextAreaElement>(null);
  const scroller = React.useRef<HTMLDivElement>(null);
  const deferred = React.useDeferredValue(code);
  const items = React.useMemo(() => droppedIn(deferred, schema), [deferred, schema]);
  const flagged = React.useMemo(() => new Set(items.map((item) => item.line)), [items]);
  const result = React.useMemo(
    () => ({ ...value, content: fromHtml(deferred, { schema, locale: value.locale }).content }),
    [deferred, schema, value],
  );
  if (mode !== "code") return null;

  const goToLine = (line: number) => {
    const field = textarea.current;
    if (!field) return;
    const lines = code.split("\n");
    const start = lines.slice(0, line - 1).reduce((sum, text) => sum + text.length + 1, 0);
    field.focus({ preventScroll: true });
    field.setSelectionRange(start, start + (lines[line - 1]?.length ?? 0));
    scroller.current?.querySelectorAll("pre > div")[line - 1]?.scrollIntoView({
      block: "center",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <section
      data-slot="editor-code"
      aria-label={t.modeCode}
      className={`flex min-h-0 flex-1 flex-col ${className ?? ""}`.trim()}
    >
      {items.length ? <Dropped items={items} onLine={goToLine} /> : null}
      <div
        style={{ "--split": `${split}%` } as React.CSSProperties}
        className="flex min-h-0 flex-1 flex-col has-data-dragging:cursor-col-resize has-data-dragging:select-none md:flex-row"
      >
        <div
          ref={scroller}
          id={codeId}
          role="region"
          aria-label={t.pageCode}
          className="min-h-0 flex-1 overflow-y-auto border-b border-border bg-card md:min-w-64 md:grow-0 md:basis-(--split) md:border-b-0"
        >
          <CodeView code={code} flagged={flagged} onChange={setCode} textareaRef={textarea} />
        </div>
        <Divider controls={codeId} />
        <div
          role="region"
          aria-label={t.codeResult}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto bg-background px-4 py-4 sm:px-6 md:min-w-80"
        >
          <div className="flex items-center justify-between gap-2">
            <Text size="xs" weight="medium" tone="muted">
              {t.codeResult}
            </Text>
            <SegmentedControl
              aria-label={t.view}
              value={device}
              onValueChange={(next) => next && transition(() => setDevice(next as typeof device))}
            >
              <SegmentedControlItem value="desktop" aria-label={t.desktop}>
                <Monitor aria-hidden="true" className="size-icon-md" />
              </SegmentedControlItem>
              <SegmentedControlItem value="mobile" aria-label={t.mobile}>
                <Smartphone aria-hidden="true" className="size-icon-md" />
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
          <div
            data-device={device}
            className={`@container/editor-page mx-auto w-full px-4 py-6 ${device === "mobile" ? "max-w-sm rounded-xl border border-border bg-card" : "max-w-none @2xl:px-8"}`}
          >
            {title ? (
              <Heading level={1} className="mb-6 min-w-0 break-words">
                {title}
              </Heading>
            ) : null}
            <EditorContent value={result} schema={schema} />
          </div>
          <Text size="xs" tone="muted">
            {t.codeResultHint}
          </Text>
        </div>
      </div>
    </section>
  );
};

export type EditorModeSwitchProps = { className?: string };

export const EditorModeSwitch = ({ className }: EditorModeSwitchProps): React.JSX.Element => {
  const t = useLabels();
  const { mode, setMode } = useEditorMode();
  const { previewing, edit } = useEditorPreview();
  const pick = (next: string) => {
    if (previewing) edit();
    if (next && next !== mode) setMode(next as "visual" | "code");
  };
  return (
    <SegmentedControl
      aria-label={t.editorMode}
      value={mode === "translations" ? "" : mode}
      onValueChange={pick}
      className={className}
    >
      <SegmentedControlItem value="visual">{t.modeVisual}</SegmentedControlItem>
      <SegmentedControlItem value="code">{t.modeCode}</SegmentedControlItem>
    </SegmentedControl>
  );
};
