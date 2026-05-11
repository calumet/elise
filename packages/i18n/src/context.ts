import * as React from "react";

import type { I18nContextValue } from "./types";

/**
 * Context compartido via `Symbol.for("@calumet/elise.i18n.context")` en `globalThis`.
 *
 * El primer paquete que importe (elise-i18n o elise-ui) crea el Context y lo
 * deposita en globalThis. Los demás paquetes resuelven el MISMO Context object,
 * lo que permite que `elise-ui`/`elise-tables`/etc. lean traducciones sin
 * importar `elise-i18n` directamente.
 */

const CONTEXT_KEY = Symbol.for("@calumet/elise.i18n.context");

type GlobalScope = {
  [CONTEXT_KEY]?: React.Context<I18nContextValue | null>;
};

const globalScope = globalThis as GlobalScope;

if (!globalScope[CONTEXT_KEY]) {
  globalScope[CONTEXT_KEY] = React.createContext<I18nContextValue | null>(null);
}

export const I18nContext = globalScope[CONTEXT_KEY]!;
