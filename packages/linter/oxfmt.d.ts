/**
 * Configuración compartida de Oxfmt.
 *
 * @module
 */

import type { OxfmtConfig } from "oxfmt";

/**
 * El formato de Elise. Oxfmt no tiene `extends`, así que se esparce en el
 * `oxfmt.config.ts` del proyecto.
 *
 * ```ts
 * import { defineConfig } from "oxfmt";
 *
 * import formato from "@calumet/elise-linter/oxfmt";
 *
 * export default defineConfig({ ...formato });
 * ```
 */
declare const config: OxfmtConfig;

export default config;
