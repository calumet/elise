/**
 * El tema como objeto: se escribe en el DOM con `applyTheme` o se serializa con
 * `themeToCss` para el HTML que sale del servidor.
 *
 * @module
 */

import type { EliseVar } from "./tokens.generated";

/**
 * Un tema: cualquier subconjunto de las variables de Elise, más las que ponga
 * el consumidor. El `& {}` es lo que evita que el patrón se coma la unión y con
 * ella el autocompletado de las 110.
 */
export type EliseTheme = Partial<Record<EliseVar | (`--${string}` & {}), string>>;

/* El valor sale de la base de datos y acaba dentro de un `<style>`: esto cierra la etiqueta. */
const UNSAFE = /[<>{};]|\/\*/;

/** Escribe un tema como variables CSS sobre un elemento, que por defecto es el `<html>`. */
export const applyTheme = (
  theme: EliseTheme,
  element: HTMLElement = document.documentElement,
): void => {
  for (const [name, value] of Object.entries(theme)) {
    if (value !== undefined) element.style.setProperty(name, value);
  }
};

/**
 * El tema como texto CSS, para un `<style>` en el HTML que renderiza el servidor.
 *
 * Los valores que llevan caracteres capaces de salirse de la declaración se
 * descartan: uno roto deja su variable en el valor de la hoja, y no la página
 * entera a merced de lo que haya guardado en la base de datos.
 */
export const themeToCss = (theme: EliseTheme, selector: string = ":root"): string => {
  const declarations = Object.entries(theme)
    .filter(([, value]) => value !== undefined && !UNSAFE.test(value))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
};
