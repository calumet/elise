/**
 * Configuración compartida de Oxlint.
 *
 * @module
 */

import type { OxlintConfig } from "oxlint";

/**
 * TypeScript y orden de imports. Se extiende desde el `oxlint.config.ts` del
 * proyecto.
 *
 * ```ts
 * import { defineConfig } from "oxlint";
 * import { base } from "@calumet/elise-linter/oxlint";
 *
 * export default defineConfig({ extends: [base] });
 * ```
 */
export declare const base: OxlintConfig;

/** Lo de {@link base} más las reglas de React. */
export declare const react: OxlintConfig;
