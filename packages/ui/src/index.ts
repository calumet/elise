/**
 * Design system de Calumet: componentes de React sobre primitivas de Radix
 * y Tailwind CSS.
 *
 * Este barril trae todo el catálogo. Cada componente tiene además su propio
 * subpath, por ejemplo `@calumet/elise-ui/button`.
 *
 * @module
 */

export * from "./components";
/** Da el tema activo y `setTheme`. Ver `@calumet/elise-ui/theme`. */
/** Alterna entre el tema claro y el oscuro. Ver `@calumet/elise-ui/theme`. */
export { ThemeProvider, useTheme } from "./theme/theme-provider";
export { defaultLightTheme, defaultDarkTheme, applyTheme, type EliseTheme } from "./themes";
