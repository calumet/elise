import { useEditorRef } from "platejs/react";
import * as React from "react";
import { flushSync } from "react-dom";

import { useElLocales } from "../i18n";
import { fromHtml } from "../render/from-html";
import { fingerprint, isTranslated, translationUnits, type TranslationUnit } from "../translations";
import type { EditorDocument, Translation } from "../types";
import { codeHtml } from "./code-html";
import { useServices } from "./context";
import { reducedMotion } from "./motion";

export type EditorMode = "visual" | "code" | "translations";

type DocumentAccess = {
  value: EditorDocument;
  update: (change: (doc: EditorDocument) => EditorDocument) => void;
};

const DocumentContext = React.createContext<DocumentAccess | null>(null);

export const DocumentProvider: React.Provider<DocumentAccess | null> = DocumentContext.Provider;

export const useDocument = (): DocumentAccess => {
  const access = React.useContext(DocumentContext);
  if (!access) throw new Error("Editor pieces must be rendered inside Editor.Root");
  return access;
};

type ModeState = {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  code: string;
  setCode: (code: string) => void;
  split: number;
  setSplit: (split: number) => void;
};

const ModeContext = React.createContext<ModeState | null>(null);

const IDLE: ModeState = {
  mode: "visual",
  setMode: () => {},
  code: "",
  setCode: () => {},
  split: 50,
  setSplit: () => {},
};

export const useMode = (): ModeState => React.useContext(ModeContext) ?? IDLE;

export const useEditorMode = (): { mode: EditorMode; setMode: (mode: EditorMode) => void } => {
  const { mode, setMode } = useMode();
  return { mode, setMode };
};

export const transition = (run: () => void): void => {
  if (reducedMotion() || !document.startViewTransition) {
    run();
    return;
  }
  document.startViewTransition(() => flushSync(run));
};

export const ModeProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const editor = useEditorRef();
  const { schema } = useServices();
  const { value } = useDocument();
  const [mode, setModeState] = React.useState<EditorMode>("visual");
  const [code, setCode] = React.useState("");
  const origin = React.useRef("");

  const setMode = React.useCallback(
    (next: EditorMode) => {
      if (next === mode) return;
      if (mode === "code" && code !== origin.current) {
        const content = fromHtml(code, { schema, locale: value.locale }).content;
        editor.tf.deselect();
        editor.tf.replaceNodes(content as never, { at: [], children: true });
      }
      if (next === "code") {
        const html = codeHtml({ ...value, content: editor.children as never }, schema);
        origin.current = html;
        setCode(html);
      }
      transition(() => setModeState(next));
    },
    [mode, code, schema, value, editor],
  );

  const [split, setSplit] = React.useState(50);
  const state = React.useMemo(
    () => ({ mode, setMode, code, setCode, split, setSplit }),
    [mode, setMode, code, split],
  );
  return <ModeContext.Provider value={state}>{children}</ModeContext.Provider>;
};

type LocaleName = { locale: string; name: string; inline: string };

export type LocaleProgress = LocaleName & { translated: number; total: number };

const localeName = (locale: string, ui: string): LocaleName => {
  let inline = locale;
  try {
    inline =
      new Intl.DisplayNames([ui], { type: "language" }).of(locale.split("-")[0] ?? locale) ??
      locale;
  } catch {}
  return { locale, inline, name: inline.charAt(0).toLocaleUpperCase(ui) + inline.slice(1) };
};

export type TranslationsState = {
  base: LocaleName;
  units: TranslationUnit[];
  locales: LocaleProgress[];
  get: (locale: string, key: string) => Translation | undefined;
  stale: (locale: string, unit: TranslationUnit) => boolean;
  set: (locale: string, unit: TranslationUnit, value: Translation | undefined) => void;
  review: (locale: string, unit: TranslationUnit) => void;
};

export const useTranslationsState = (): TranslationsState => {
  const { value, update } = useDocument();
  const { locales: declared } = useServices();
  const i18n = useElLocales();
  const ui = i18n.locale ?? value.locale;
  const units = React.useMemo(() => translationUnits(value.content), [value.content]);
  const targets = (declared ?? i18n.locales).filter((locale) => locale !== value.locale);

  const get = (locale: string, key: string) => value.translations?.[locale]?.[key];

  const write = (
    locale: string,
    key: string,
    translation: Translation | undefined,
    source: string,
  ) =>
    update((doc) => {
      const table = { ...doc.translations?.[locale] };
      const sources = { ...doc.translatedFrom?.[locale] };
      if (translation === undefined || !isTranslated(translation)) {
        delete table[key];
        delete sources[key];
      } else {
        table[key] = translation;
        sources[key] = fingerprint(source);
      }
      return {
        ...doc,
        translations: { ...doc.translations, [locale]: table },
        translatedFrom: { ...doc.translatedFrom, [locale]: sources },
      };
    });

  return {
    base: localeName(value.locale, ui),
    units,
    locales: targets.map((locale) => ({
      ...localeName(locale, ui),
      translated: units.filter((unit) => isTranslated(get(locale, unit.key))).length,
      total: units.length,
    })),
    get,
    stale: (locale, unit) => {
      const source = value.translatedFrom?.[locale]?.[unit.key];
      return (
        isTranslated(get(locale, unit.key)) &&
        source !== undefined &&
        source !== fingerprint(unit.text)
      );
    },
    set: (locale, unit, translation) => write(locale, unit.key, translation, unit.text),
    review: (locale, unit) => write(locale, unit.key, get(locale, unit.key), unit.text),
  };
};
