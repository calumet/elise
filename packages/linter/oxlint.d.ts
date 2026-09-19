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

/** Un contrato del design system: qué clases acepta un componente. */
export type Contract = {
  /** Expresión regular contra el nombre del componente. */
  pattern: string;
  allow?: string[];
  deny?: string[];
  message?: string | Record<string, string>;
};

/** Opciones de {@link designSystem}, que {@link elise} también acepta. */
export type DesignSystemOptions = {
  /**
   * Para bajar el nivel mientras se salda lo que ya había. Va aquí y no como
   * un `"warn"` en un `overrides`: eso reemplaza la regla entera y se lleva
   * por delante los contratos.
   */
  severity?: "error" | "warn" | "off";
  contracts?: Contract[];
  rules?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

/**
 * Comprueba cómo se usan los componentes de Elise: quién es dueño de qué
 * estilo, y qué hacer en lugar de pisarlo.
 *
 * Normalmente no hace falta llamarla: {@link elise} ya la incluye. Se usa
 * suelta para bajar el nivel en un `overrides`.
 *
 * ```ts
 * overrides: [{ files: ["src/legacy/**"], rules: designSystem({ severity: "warn" }).rules }]
 * ```
 */
export declare function designSystem(options?: DesignSystemOptions): OxlintConfig;

/**
 * Todo lo de Elise en una llamada: React, las clases contra el tema y el uso
 * del design system.
 *
 * ```ts
 * import { elise } from "@calumet/elise-linter/oxlint";
 * import { defineConfig } from "oxlint";
 *
 * export default defineConfig(elise({ theme: "src/index.css" }));
 * ```
 *
 * Sin `theme` no se validan las clases contra el tema. Con
 * `designSystem: false` se apagan las reglas de uso del catálogo.
 */
export declare function elise(options?: {
  /** El CSS con `@import "tailwindcss"`. En un monorepo, el mapeo de rutas. */
  theme?: string | Array<{ files: string[]; use: string }>;
  designSystem?: DesignSystemOptions | false;
  rules?: Record<string, unknown>;
  ignorePatterns?: string[];
  overrides?: unknown[];
}): OxlintConfig;
