import { buildMessages, type EagerGlobModules } from "@calumet/elise-i18n";

/**
 * Auto-descubre todos los archivos `<namespace>.<locale>.ts` en este directorio
 * y los mergea en la forma `Messages` que `<I18nProvider>` espera.
 *
 * Para agregar un namespace o locale, crea un archivo nuevo con el patrón
 * `<namespace>.<locale>.ts` y exporta default un objeto con las traducciones.
 * No se necesita registrarlo en ningún lado: Vite lo levanta automáticamente.
 */
const modules = import.meta.glob<{ default: Record<string, string> }>("./*.ts", {
  eager: true,
});

export const messages = buildMessages(modules as EagerGlobModules);
