import { react, shadcn, tailwind } from "@calumet/elise-linter/oxlint";
import { defineConfig } from "oxlint";

/* Los dos van esparcidos porque Oxlint no hereda `settings` por `extends`, y
   esparcir uno detrás de otro pisaría las claves del primero. */
const tw = tailwind([
  { files: ["packages/showcase/**"], use: "packages/showcase/src/index.css" },
  { files: ["packages/site/**"], use: "packages/site/src/index.css" },
  { files: ["**"], use: "packages/ui/src/tailwind/elise.css" },
]);
const ds = shadcn();

export default defineConfig({
  extends: [react],
  jsPlugins: [...tw.jsPlugins, ...ds.jsPlugins],
  settings: { ...tw.settings, ...ds.settings },
  rules: { ...tw.rules, ...ds.rules },
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/jsr/**",
    "**/.turbo/**",
    "**/build/**",
    "**/.next/**",
  ],
  overrides: [
    {
      files: ["scripts/sonda-visual.js"],
      env: { browser: true },
    },
    {
      /* Elise es el design system, no quien lo consume: sus componentes son
         dueños de su apariencia, y componer clases es como lo hacen. Queda
         `no-raw-colors`, que sí vale adentro: todo color sale del tema. */
      files: ["packages/ui/**", "packages/tables/**", "packages/alerts/**", "packages/toasts/**"],
      rules: {
        "shadcn/no-restyle": "off",
        "shadcn/no-inline-styles": "off",
        "shadcn/require-static-classes": "off",
      },
    },
    {
      /* La landing es el consumidor que hay dentro del repo, y es de antes que
         la regla. En aviso mientras se salda, que es el camino que la propia
         herramienta recomienda. */
      files: ["packages/site/**"],
      rules: shadcn({ severity: "warn" }).rules,
    },
    {
      /* La vitrina es un banco de pruebas: ejercita los componentes a
         propósito de formas que una pantalla de verdad no usaría. */
      files: ["packages/showcase/**"],
      rules: shadcn({ severity: "off" }).rules,
    },
  ],
});
