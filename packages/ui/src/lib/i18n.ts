import * as React from "react";

/**
 * Bridge optativo al sistema de i18n de Elise. Lee el React Context que
 * `@calumet/elise-i18n` deposita en `globalThis` vía `Symbol.for`.
 *
 * Si no hay Provider montado (o `elise-i18n` no está instalado), retorna el
 * fallback. Esto permite que el paquete no dependa de `elise-i18n`.
 */

const CONTEXT_KEY = Symbol.for("@calumet/elise.i18n.context");

type I18nCtx = {
  translate: (
    namespace: string,
    key: string,
    options?: { fallback?: string } & Record<string, string | number>,
  ) => string;
} | null;

type GlobalScope = {
  [CONTEXT_KEY]?: React.Context<I18nCtx>;
};

const globalScope = globalThis as GlobalScope;

if (!globalScope[CONTEXT_KEY]) {
  globalScope[CONTEXT_KEY] = React.createContext<I18nCtx>(null);
}

const SharedI18nContext = globalScope[CONTEXT_KEY]!;

export const useElLabel = (namespace: string, key: string, fallback: string): string => {
  const ctx = React.useContext(SharedI18nContext);
  if (!ctx) return fallback;
  return ctx.translate(namespace, key, { fallback });
};
