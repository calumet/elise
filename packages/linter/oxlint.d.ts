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

/** Un contrato de `shadcn/no-restyle`: qué acepta un componente. */
export type Contract = {
  /** Expresión regular contra el nombre del componente. */
  pattern: string;
  allow?: string[];
  deny?: string[];
  message?: string | Record<string, string>;
};

/**
 * Reglas de uso del design system, para quien consume Elise. Reconoce los
 * componentes que llegan de `@calumet/elise-*` y trae un contrato por familia.
 *
 * Va esparcido y no dentro de `extends`, porque Oxlint no hereda `settings`.
 *
 * ```ts
 * export default defineConfig({
 *   extends: [react],
 *   ...shadcn(),
 * });
 * ```
 *
 * `no-unknown-classes` no se enciende aquí: la da {@link tailwind}. Tampoco
 * `no-arbitrary-values`, que choca con las medidas de maquetación de una
 * página; se pide con `rules` si se la quiere.
 */
export declare function shadcn(options?: {
  /**
   * Para bajar el nivel mientras se salda lo que ya había. Va aquí y no como
   * un `"warn"` en un `overrides`: eso reemplaza la regla entera y se lleva
   * por delante los contratos.
   */
  severity?: "error" | "warn" | "off";
  contracts?: Contract[];
  rules?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}): OxlintConfig;
