import type { Locale, LocaleMessages, Messages, NamespaceMessages } from "./types";

/**
 * Modules en formato eager (Vite: `import.meta.glob(pattern, { eager: true })`).
 * Cada valor ya contiene el default export resuelto.
 */
export type EagerGlobModules = Record<string, { default: unknown }>;

/**
 * Modules en formato lazy (Vite: `import.meta.glob(pattern)` sin `eager`).
 * Cada valor es una función que retorna una promesa del módulo.
 */
export type LazyGlobModules = Record<string, () => Promise<{ default: unknown }>>;

/**
 * Resultado de parsear un path:
 * - Con `namespace`: el default export es `NamespaceMessages`.
 *   Archivo `<namespace>.<locale>.<ext>`, ej. `tables.es-CO.ts`.
 * - Sin `namespace`: el default export es `LocaleMessages` (multi-namespace).
 *   Archivo `<locale>.<ext>`, ej. `es-CO.ts`.
 */
export type ParseResult =
  | { namespace: string; locale: Locale }
  | { namespace?: undefined; locale: Locale };

export type ParsePathFn = (path: string) => ParseResult | null;

export type BuildOptions = {
  /**
   * Parser opcional para extraer namespace y locale de un path. El default
   * acepta dos convenciones:
   * - `<namespace>.<locale>.<ext>` (ej. `tables.es-CO.ts`)
   * - `<locale>.<ext>`             (ej. `es-CO.ts`, con namespaces anidados)
   */
  parsePath?: ParsePathFn;
};

const defaultParsePath: ParsePathFn = (path) => {
  const basename = path.split("/").pop();
  if (!basename) return null;
  const parts = basename.split(".");
  if (parts.length < 2) return null; // sin extension
  parts.pop(); // descartar ext
  if (parts.length === 1) return { locale: parts[0] };
  if (parts.length === 2) return { namespace: parts[0], locale: parts[1] };
  return null;
};

const setNamespace = (messages: Messages, locale: Locale, ns: string, value: unknown) => {
  if (!messages[locale]) messages[locale] = {};
  messages[locale][ns] = value as NamespaceMessages;
};

const mergeLocale = (messages: Messages, locale: Locale, value: unknown) => {
  if (!messages[locale]) messages[locale] = {};
  Object.assign(messages[locale], value as LocaleMessages);
};

/**
 * Construye un objeto `Messages` a partir de un glob eager.
 *
 * Soporta dos convenciones de naming en el mismo glob:
 * - `<namespace>.<locale>.<ext>` → el default export es `NamespaceMessages`.
 * - `<locale>.<ext>`             → el default export es `LocaleMessages`
 *   (multi-namespace anidado dentro del archivo).
 *
 * Si ambos están presentes para un locale, primero se aplica el archivo
 * por-locale y luego los archivos por-namespace sobrescriben las keys del
 * mismo namespace (el archivo más específico gana).
 *
 * @example
 * ```ts
 * // Convención uno-por-namespace
 * const modules = import.meta.glob("./i18n/*.ts", { eager: true });
 * export const messages = buildMessages(modules);
 *
 * // Convención uno-por-locale
 * // ./i18n/es-CO.ts exporta { tables: {...}, alerts: {...} }
 * // Misma llamada, mismo resultado.
 * ```
 */
export const buildMessages = (modules: EagerGlobModules, options?: BuildOptions): Messages => {
  const parse = options?.parsePath ?? defaultParsePath;
  const result: Messages = {};

  // Pass 1: archivos por-locale (base)
  for (const [path, mod] of Object.entries(modules)) {
    const parsed = parse(path);
    if (!parsed || parsed.namespace !== undefined) continue;
    mergeLocale(result, parsed.locale, mod.default);
  }

  // Pass 2: archivos por-namespace (override)
  for (const [path, mod] of Object.entries(modules)) {
    const parsed = parse(path);
    if (!parsed || parsed.namespace === undefined) continue;
    setNamespace(result, parsed.locale, parsed.namespace, mod.default);
  }

  return result;
};

export type LazyLoader = {
  /** Locales detectadas en el glob. */
  availableLocales: Locale[];
  /** Carga (en paralelo) todos los archivos asociados a la locale indicada. */
  loadLocale: (locale: Locale) => Promise<LocaleMessages>;
  /**
   * Carga un namespace específico de una locale. Si existe un archivo
   * `<namespace>.<locale>.<ext>` lo usa; si no, carga el archivo
   * `<locale>.<ext>` y retorna `default[namespace]`.
   */
  loadNamespace: (locale: Locale, namespace: string) => Promise<NamespaceMessages | undefined>;
};

type LazyEntry =
  | { kind: "namespace"; namespace: string; loader: () => Promise<{ default: unknown }> }
  | { kind: "locale"; loader: () => Promise<{ default: unknown }> };

/**
 * Crea un cargador para messages en formato lazy. Soporta las mismas dos
 * convenciones que `buildMessages`.
 *
 * @example
 * ```ts
 * const modules = import.meta.glob("./i18n/*.ts");  // sin eager
 * const loader = buildLazyLoader(modules);
 *
 * const [messages, setMessages] = useState<Messages>({});
 * useEffect(() => {
 *   loader.loadLocale(locale).then(loaded =>
 *     setMessages(prev => ({ ...prev, [locale]: loaded }))
 *   );
 * }, [locale]);
 * ```
 */
export const buildLazyLoader = (modules: LazyGlobModules, options?: BuildOptions): LazyLoader => {
  const parse = options?.parsePath ?? defaultParsePath;
  const byLocale = new Map<Locale, LazyEntry[]>();

  for (const [path, loader] of Object.entries(modules)) {
    const parsed = parse(path);
    if (!parsed) continue;
    const list = byLocale.get(parsed.locale) ?? [];
    if (parsed.namespace !== undefined) {
      list.push({ kind: "namespace", namespace: parsed.namespace, loader });
    } else {
      list.push({ kind: "locale", loader });
    }
    byLocale.set(parsed.locale, list);
  }

  const loadLocale = async (locale: Locale): Promise<LocaleMessages> => {
    const entries = byLocale.get(locale);
    if (!entries) return {};

    const localePart: LocaleMessages = {};
    const namespacePart: LocaleMessages = {};

    await Promise.all(
      entries.map(async (entry) => {
        const mod = await entry.loader();
        if (entry.kind === "locale") {
          Object.assign(localePart, mod.default as LocaleMessages);
        } else {
          namespacePart[entry.namespace] = mod.default as NamespaceMessages;
        }
      }),
    );

    // Archivos por-namespace sobrescriben los por-locale (más específico gana).
    return { ...localePart, ...namespacePart };
  };

  const loadNamespace = async (
    locale: Locale,
    namespace: string,
  ): Promise<NamespaceMessages | undefined> => {
    const entries = byLocale.get(locale);
    if (!entries) return undefined;

    const nsEntry = entries.find(
      (entry): entry is Extract<LazyEntry, { kind: "namespace" }> =>
        entry.kind === "namespace" && entry.namespace === namespace,
    );
    if (nsEntry) {
      const mod = await nsEntry.loader();
      return mod.default as NamespaceMessages;
    }

    const localeEntry = entries.find(
      (entry): entry is Extract<LazyEntry, { kind: "locale" }> => entry.kind === "locale",
    );
    if (localeEntry) {
      const mod = await localeEntry.loader();
      const localeMessages = mod.default as LocaleMessages;
      return localeMessages[namespace];
    }

    return undefined;
  };

  return {
    availableLocales: Array.from(byLocale.keys()),
    loadLocale,
    loadNamespace,
  };
};
