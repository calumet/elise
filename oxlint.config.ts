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
        files: ["scripts/visual-probe.js"],
        env: { browser: true },
      },
      {
        // Elise es el design system, no quien lo consume. Queda `no-raw-colors`.
        files: [
          "packages/ui/**",
          "packages/tables/**",
          "packages/alerts/**",
          "packages/themes/**",
          "packages/toasts/**",
        ],
        rules: {
          "shadcn/no-restyle": "off",
          "shadcn/no-inline-styles": "off",
          "shadcn/require-static-classes": "off",
          "shadcn/no-arbitrary-values": "off",
        },
      },
      {
        // En aviso mientras se salda lo que ya había.
        files: ["packages/site/**"],
        rules: designSystem({ severity: "warn" }).rules,
      },
      {
        // La vitrina es un banco de pruebas.
        files: ["packages/showcase/**"],
        rules: designSystem({ severity: "off" }).rules,
      },
    ],
  }),
);
