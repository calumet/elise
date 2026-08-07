/**
 * Configuración compartida de ESLint, en tres capas construidas una sobre otra.
 *
 * @module
 */

import type { Linter } from "eslint";

/**
 * Las tres configuraciones planas de ESLint, cada una construida sobre la
 * anterior. Se esparcen en el `eslint.config.js` del proyecto.
 *
 * ```js
 * import { configs } from "@calumet/elise-linter";
 *
 * export default [...configs.react];
 * ```
 */
export declare const configs: {
  /** TypeScript y orden de imports. */
  base: Linter.Config[];
  /** Lo de `base` más React y las reglas de hooks. */
  react: Linter.Config[];
  /**
   * Lo de `react` más el orden y la validez de las clases de Tailwind.
   *
   * Carga `eslint-plugin-better-tailwindcss` recién al leer la propiedad, así
   * que hay que instalarlo junto con `tailwindcss`. Si falta, tira un error con
   * el comando de instalación.
   */
  readonly tailwind: Linter.Config[];
};
