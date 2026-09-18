import { defineConfig } from "oxlint";

import { base } from "@calumet/elise-linter/oxlint";

export default defineConfig({
  extends: [base],
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
  ],
});
