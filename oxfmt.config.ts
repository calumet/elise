import formato from "@calumet/elise-linter/oxfmt";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...formato,
  // Generados: los reescribe su herramienta y reformatearlos los desincroniza
  // en el siguiente install o build.
  ignorePatterns: ["pnpm-lock.yaml", "dist/", "jsr/", "node_modules/"],
});
