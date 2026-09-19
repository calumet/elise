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

/**
 * Valida las clases de Tailwind contra el tema del proyecto. El orden no entra
 * aquí: lo arregla `sortTailwindcss` de Oxfmt.
 *
 * `entryPoint` es el CSS con `@import "tailwindcss"`, relativo a la raíz.
 */
export declare function tailwind(
  entryPoint: string | Array<{ files: string[]; use: string }>,
): OxlintConfig;
