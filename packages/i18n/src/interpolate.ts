import type { InterpolationVars } from "./types";

const placeholderRegex = /\{(\w+)\}/g;

export const interpolate = (template: string, vars?: InterpolationVars): string => {
  if (!vars) return template;
  return template.replace(placeholderRegex, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
};
