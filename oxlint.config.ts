import { react } from "@calumet/elise-linter/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [react],
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
