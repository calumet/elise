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

export type BuildOptions = {
  /**
   * Expresión regular para extraer namespace y locale del path.
   * Debe capturar dos grupos: `[, namespace, locale]`.
   * Default: `<namespace>.<locale>.<ext>` (ej. `tables.es-CO.ts`).
   */
  pattern?: RegExp;
};

const DEFAULT_PATTERN = /([^./]+)\.([^./]+)\.[^./]+$/;

const parsePath = (path: string, pattern: RegExp): { namespace: string; locale: Locale } | null => {
  const match = pattern.exec(path);
  if (!match) return null;
  const [, namespace, locale] = match;
  return { namespace, locale };
};

/**
 * Construye un objeto `Messages` a partir de un glob eager.
 *
 * @example
 * ```ts
 * const modules = import.meta.glob("./i18n/*.ts", { eager: true });
 * export const messages = buildMessages(modules);
 * ```
 */
export const buildMessages = (modules: EagerGlobModules, options?: BuildOptions): Messages => {
  const pattern = options?.pattern ?? DEFAULT_PATTERN;
  const result: Messages = {};

  for (const [path, mod] of Object.entries(modules)) {
    const parsed = parsePath(path, pattern);
    if (!parsed) continue;
    const { namespace, locale } = parsed;
    if (!result[locale]) result[locale] = {};
    result[locale][namespace] = mod.default as NamespaceMessages;
  }

  return result;
};

export type LazyLoader = {
  /** Locales detectadas en el glob. */
  availableLocales: Locale[];
  /** Carga (en paralelo) todos los namespaces de la locale indicada. */
  loadLocale: (locale: Locale) => Promise<LocaleMessages>;
  /** Carga un namespace específico de una locale. */
  loadNamespace: (locale: Locale, namespace: string) => Promise<NamespaceMessages | undefined>;
};

/**
 * Crea un cargador para messages en formato lazy.
 *
 * @example
 * ```ts
 * const modules = import.meta.glob("./i18n/*.ts");  // sin eager
 * const loader = buildLazyLoader(modules);
 *
 * // En tu componente:
 * const [messages, setMessages] = useState<Messages>({});
 * useEffect(() => {
 *   loader.loadLocale(locale).then(loaded =>
 *     setMessages(prev => ({ ...prev, [locale]: loaded }))
 *   );
 * }, [locale]);
 * ```
 */
export const buildLazyLoader = (modules: LazyGlobModules, options?: BuildOptions): LazyLoader => {
  const pattern = options?.pattern ?? DEFAULT_PATTERN;
  const byLocale = new Map<Locale, Map<string, () => Promise<{ default: unknown }>>>();

  for (const [path, loader] of Object.entries(modules)) {
    const parsed = parsePath(path, pattern);
    if (!parsed) continue;
    const { namespace, locale } = parsed;
    let nsMap = byLocale.get(locale);
    if (!nsMap) {
      nsMap = new Map();
      byLocale.set(locale, nsMap);
    }
    nsMap.set(namespace, loader);
  }

  const loadLocale = async (locale: Locale): Promise<LocaleMessages> => {
    const nsMap = byLocale.get(locale);
    if (!nsMap) return {};
    const entries = await Promise.all(
      Array.from(nsMap.entries()).map(async ([ns, loader]) => {
        const mod = await loader();
        return [ns, mod.default as NamespaceMessages] as const;
      }),
    );
    return Object.fromEntries(entries);
  };

  const loadNamespace = async (
    locale: Locale,
    namespace: string,
  ): Promise<NamespaceMessages | undefined> => {
    const loader = byLocale.get(locale)?.get(namespace);
    if (!loader) return undefined;
    const mod = await loader();
    return mod.default as NamespaceMessages;
  };

  return {
    availableLocales: Array.from(byLocale.keys()),
    loadLocale,
    loadNamespace,
  };
};
