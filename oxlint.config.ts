import { designSystem, elise } from "@calumet/elise-linter/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig(
  elise({
    theme: [
      { files: ["packages/showcase/**"], use: "packages/showcase/src/index.css" },
      { files: ["packages/site/**"], use: "packages/site/src/index.css" },
      { files: ["**"], use: "packages/ui/src/tailwind/elise.css" },
    ],
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
          "shadcn/no-arbitrary-values": "off",
        },
      },
      {
        /* La landing es el consumidor que hay dentro del repo, y es de antes
           que la regla. En aviso mientras se salda. */
        files: ["packages/site/**"],
        rules: designSystem({ severity: "warn" }).rules,
      },
      {
        /* La vitrina es un banco de pruebas: ejercita los componentes a
           propósito de formas que una pantalla de verdad no usaría. */
        files: ["packages/showcase/**"],
        rules: designSystem({ severity: "off" }).rules,
      },
    ],
  }),
);
