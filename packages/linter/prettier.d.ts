/**
 * Configuración compartida de Prettier.
 *
 * @module
 */

import type { Config } from "prettier";

/**
 * La configuración de Prettier de Elise. Se reexporta tal cual desde el
 * `prettier.config.js` del proyecto.
 *
 * ```js
 * import prettierConfig from "@calumet/elise-linter/prettier";
 *
 * export default prettierConfig;
 * ```
 */
declare const config: Config;

export default config;
