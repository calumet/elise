import { react, tailwind } from "@calumet/elise-linter/oxlint";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [react],
  ...tailwind([
    { files: ["packages/showcase/**"], use: "packages/showcase/src/index.css" },
    { files: ["packages/site/**"], use: "packages/site/src/index.css" },
    { files: ["**"], use: "packages/ui/src/tailwind/elise.css" },
  ]),
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
