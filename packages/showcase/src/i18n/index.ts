import { buildMessages } from "@calumet/elise-i18n";

/**
 * Auto-descubre archivos de traducciones en este directorio y los mergea
 * en la forma `Messages` que `<I18nProvider>` espera.
 *
 * Convenciones soportadas (puedes mezclarlas):
 * - `<locale>.ts`              → exporta `{ <namespace>: { key: ... } }` (todo junto)
 * - `<namespace>.<locale>.ts`  → exporta `{ key: ... }` (un namespace por archivo)
 *
 * Si ambos existen para el mismo locale+namespace, gana el más específico.
 */
const modules = import.meta.glob<{ default: unknown }>(["./*.ts", "!./index.ts"], {
  eager: true,
});

export const messages = buildMessages(modules);
