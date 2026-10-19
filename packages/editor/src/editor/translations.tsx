import { ArrowLeft, Check, Eye, Languages } from "@calumet/elise-icons";
import { Badge } from "@calumet/elise-ui/badge";
import { Button } from "@calumet/elise-ui/button";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateMedia,
  EmptyStateTitle,
} from "@calumet/elise-ui/empty-state";
import { Progress } from "@calumet/elise-ui/progress";
import { SegmentedControl, SegmentedControlItem } from "@calumet/elise-ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@calumet/elise-ui/select";
import { Text } from "@calumet/elise-ui/text";
import * as React from "react";

import { fill, typeLabel, useLabels, type Labels } from "../labels";
import { renderInline } from "../render/content";
import type { TranslationUnit } from "../translations";
import { isTranslated } from "../translations";
import { EditorModeSwitch } from "./code";
import {
  useEditorMode,
  useTranslationsState,
  type LocaleProgress,
  type TranslationsState,
} from "./modes";
import { usePreviewIn } from "./preview";
import { TranslationField } from "./translation-field";

const ATTRIBUTE_LABELS: Record<string, keyof Labels> = {
  alt: "altAttribute",
  caption: "captionAttribute",
  label: "labelAttribute",
  name: "nameAttribute",
};

const HEADINGS = new Set(["h2", "h3"]);

const COLUMNS =
  "gap-x-4 gap-y-2 border-b border-border px-4 py-3 @2xl/translations:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_minmax(0,1fr)] @2xl/translations:px-5";
const ROW = `grid ${COLUMNS}`;

const unitLabel = (t: Labels, unit: TranslationUnit): string => {
  const [type = "", attr] = unit.type.split("#");
  const own = attr
    ? `${typeLabel(t, type)} · ${t[ATTRIBUTE_LABELS[attr] ?? "labelAttribute"]}`
    : typeLabel(t, type);
  return [...unit.trail.map((kind) => typeLabel(t, kind)), own].join(" › ");
};

const LocaleCode = ({ name, locale }: { name: string; locale: string }) =>
  name.toLowerCase() === locale.toLowerCase() ? null : (
    <span className="text-xs font-normal text-muted-foreground">{locale}</span>
  );

const LocaleList = ({
  base,
  count,
  locales,
  current,
  onPick,
}: {
  base: TranslationsState["base"];
  count: number;
  locales: LocaleProgress[];
  current: string | null;
  onPick: (locale: string) => void;
}): React.JSX.Element => {
  const t = useLabels();
  return (
    <div className="flex flex-col gap-1">
      <Text as="h2" size="xs" weight="medium" tone="muted" className="px-2 pb-1">
        {t.baseLanguage}
      </Text>
      <div className="flex items-baseline justify-between gap-2 p-2 text-base">
        <span className="min-w-0 truncate">
          {base.name} <LocaleCode name={base.name} locale={base.locale} />
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {count === 1 ? t.textCountOne : fill(t.textCount, { count })}
        </span>
      </div>
      <Text as="h2" size="xs" weight="medium" tone="muted" className="px-2 pt-3 pb-1">
        {t.translations}
      </Text>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {locales.map((locale) => (
          <li key={locale.locale}>
            <button
              type="button"
              aria-current={locale.locale === current || undefined}
              onClick={() => onPick(locale.locale)}
              className="flex w-full flex-col gap-2 rounded-md p-2 text-start text-base transition-[background-color,box-shadow] duration-(--duration-fast) ease-out hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-current:bg-background aria-current:shadow-sm"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate font-medium">
                  {locale.name} <LocaleCode name={locale.name} locale={locale.locale} />
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {fill(t.progressOf, { done: locale.translated, total: locale.total })}
                </span>
              </span>
              <Progress
                aria-label={locale.name}
                value={locale.total ? (locale.translated / locale.total) * 100 : 0}
                className="h-1"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BaseText = ({ unit }: { unit: TranslationUnit }): React.JSX.Element => (
  <div
    className={`min-w-0 py-2 text-base break-words whitespace-pre-line ${HEADINGS.has(unit.type) ? "font-semibold" : ""}`}
  >
    {typeof unit.base === "string" ? unit.base : renderInline(unit.base, unit.key)}
  </div>
);

const Empty = ({
  Icon,
  title,
  hint,
}: {
  Icon: typeof Check;
  title: string;
  hint: string;
}): React.JSX.Element => (
  <EmptyState size="sm">
    <EmptyStateMedia>
      <Icon />
    </EmptyStateMedia>
    <EmptyStateTitle>{title}</EmptyStateTitle>
    <EmptyStateDescription>{hint}</EmptyStateDescription>
  </EmptyState>
);

const TranslationRow = ({
  unit,
  target,
  state,
}: {
  unit: TranslationUnit;
  target: LocaleProgress;
  state: TranslationsState;
}): React.JSX.Element => {
  const t = useLabels();
  const label = unitLabel(t, unit);
  const stale = state.stale(target.locale, unit);
  return (
    <div data-stale={stale || undefined} className={ROW}>
      <span className="text-xs font-medium break-words text-muted-foreground @2xl/translations:pt-2.5">
        {label}
      </span>
      <BaseText unit={unit} />
      <div className="flex min-w-0 flex-col gap-2">
        <TranslationField
          key={`${target.locale}|${unit.key}`}
          plain={typeof unit.base === "string"}
          value={state.get(target.locale, unit.key)}
          formatted={unit.formatted}
          heading={HEADINGS.has(unit.type)}
          label={fill(t.translationFor, { language: target.inline, block: label })}
          placeholder={fill(t.missingTranslation, { language: state.base.inline })}
          onChange={(next) => state.set(target.locale, unit, next)}
        />
        {stale ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning">{t.staleTranslation}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => state.review(target.locale, unit)}
            >
              <Check aria-hidden="true" />
              {t.keepTranslation}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

type Filter = "all" | "missing";

const useVisibleRows = (
  state: TranslationsState,
  locale: string | null,
  filter: Filter,
): TranslationUnit[] => {
  const [frozen, setFrozen] = React.useState<{ view: string; keys: Set<string> } | null>(null);
  const view = `${locale}|${filter}`;
  let keys = frozen?.view === view ? frozen.keys : null;
  if (filter === "missing" && locale && !keys) {
    keys = new Set(
      state.units
        .filter((unit) => !isTranslated(state.get(locale, unit.key)) || state.stale(locale, unit))
        .map((unit) => unit.key),
    );
    setFrozen({ view, keys });
  }
  return keys ? state.units.filter((unit) => keys.has(unit.key)) : state.units;
};

const Header = ({
  title,
  headingId,
  filter,
  onFilter,
  current,
}: {
  title?: string;
  headingId: string;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  current: LocaleProgress | undefined;
}): React.JSX.Element => {
  const t = useLabels();
  const { setMode } = useEditorMode();
  const previewIn = usePreviewIn();
  const heading = title ? fill(t.translateTitle, { title }) : t.translatePage;
  return (
    <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-card px-4 py-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t.backToEditor}
        className="-ms-1 text-muted-foreground"
        onClick={() => setMode("visual")}
      >
        <ArrowLeft aria-hidden="true" />
      </Button>
      <div className="flex min-w-0 flex-1 basis-48 flex-col">
        <Text as="h1" id={headingId} size="base" weight="semibold" truncate title={heading}>
          {heading}
        </Text>
        <Text size="xs" tone="muted" truncate>
          {t.translateHint}
        </Text>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          aria-label={t.translationFilter}
          value={filter}
          onValueChange={(next) => next && onFilter(next as Filter)}
        >
          <SegmentedControlItem value="all">{t.filterAll}</SegmentedControlItem>
          <SegmentedControlItem value="missing">{t.filterMissing}</SegmentedControlItem>
        </SegmentedControl>
        {current ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => previewIn(current.locale)}
          >
            <Eye aria-hidden="true" />
            {fill(t.viewIn, { language: current.inline })}
          </Button>
        ) : null}
        <Button type="button" size="sm" onClick={() => setMode("visual")}>
          {t.done}
        </Button>
        <EditorModeSwitch className="ms-2" />
      </div>
    </div>
  );
};

export type EditorTranslationsProps = { title?: string; className?: string };

export const EditorTranslations = ({
  title,
  className,
}: EditorTranslationsProps): React.JSX.Element => {
  const t = useLabels();
  const state = useTranslationsState();
  const [picked, setPicked] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const current =
    state.locales.find((locale) => locale.locale === picked) ??
    state.locales.find((locale) => locale.translated < locale.total) ??
    state.locales[0];
  const locale = current?.locale ?? null;
  const rows = useVisibleRows(state, locale, filter);
  const headingId = React.useId();

  const empty = !current ? (
    <Empty Icon={Languages} title={t.noLanguages} hint={t.noLanguagesHint} />
  ) : state.units.length === 0 ? (
    <Empty Icon={Languages} title={t.nothingToTranslate} hint={t.nothingToTranslateHint} />
  ) : rows.length === 0 ? (
    <Empty
      Icon={Check}
      title={t.nothingMissing}
      hint={fill(t.nothingMissingHint, { language: current.inline })}
    />
  ) : null;

  return (
    <section
      data-slot="editor-translations"
      aria-labelledby={headingId}
      className={`flex min-h-0 flex-1 flex-col ${className ?? ""}`.trim()}
    >
      <Header
        title={title}
        headingId={headingId}
        filter={filter}
        onFilter={setFilter}
        current={current}
      />
      <div className="flex min-h-0 flex-1">
        <nav
          aria-label={t.languages}
          className="hidden w-62 shrink-0 flex-col overflow-y-auto border-e border-border bg-muted p-3 md:flex"
        >
          <LocaleList
            base={state.base}
            count={state.units.length}
            locales={state.locales}
            current={locale}
            onPick={setPicked}
          />
          <Text size="xs" tone="muted" className="mt-auto p-2 pt-6">
            {t.languagesHint}
          </Text>
        </nav>
        <div className="@container/translations min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {state.locales.length > 1 ? (
            <div className="mx-auto mb-4 max-w-4xl md:hidden">
              <Select value={locale ?? undefined} onValueChange={setPicked}>
                <SelectTrigger aria-label={t.languages}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.locales.map((option) => (
                    <SelectItem key={option.locale} value={option.locale}>
                      {`${option.name} · ${fill(t.progressOf, { done: option.translated, total: option.total })}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card [&>:last-child]:border-b-0">
            <div
              aria-hidden="true"
              className={`${COLUMNS} hidden bg-muted py-2 text-xs font-medium text-muted-foreground @2xl/translations:grid`}
            >
              <span>{t.blockColumn}</span>
              <span>{fill(t.baseColumn, { language: state.base.name })}</span>
              <span>{current?.name}</span>
            </div>
            {title ? (
              <div className={ROW}>
                <span className="text-xs font-medium text-muted-foreground @2xl/translations:pt-2.5">
                  {t.pageTitle}
                </span>
                <div className="py-2 text-base font-semibold break-words">{title}</div>
                <Text size="sm" tone="muted" className="@2xl/translations:pt-2.5">
                  {t.titleInMenu}
                </Text>
              </div>
            ) : null}
            {empty || !current ? (
              <div className="p-6">{empty}</div>
            ) : (
              rows.map((unit) => (
                <TranslationRow key={unit.key} unit={unit} target={current} state={state} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export type EditorTranslationsButtonProps = { className?: string };

export const EditorTranslationsButton = ({
  className,
}: EditorTranslationsButtonProps): React.JSX.Element | null => {
  const t = useLabels();
  const { setMode } = useEditorMode();
  const { locales } = useTranslationsState();
  if (locales.length === 0) return null;
  const pending = locales.filter((locale) => locale.translated < locale.total).length;
  const summary =
    pending === 1 ? t.translationsPendingOne : fill(t.translationsPending, { count: pending });
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-slot="editor-translations-button"
      className={className}
      title={pending ? summary : t.translationsComplete}
      onClick={() => setMode("translations")}
    >
      <Languages aria-hidden="true" />
      <span data-slot="label">{t.translations}</span>
      {pending ? (
        <Badge tone="warning" size="sm">
          <span aria-hidden="true">{pending}</span>
          <span className="sr-only">{summary}</span>
        </Badge>
      ) : null}
    </Button>
  );
};
