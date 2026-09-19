import format from "@calumet/elise-linter/oxfmt";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...format,
  sortTailwindcss: {
    stylesheet: "packages/ui/src/tailwind/elise.css",
    functions: ["cn"],
  },
  // Generados: los reescribe su herramienta y reformatearlos los desincroniza
  // en el siguiente install o build.
  ignorePatterns: ["pnpm-lock.yaml", "dist/", "jsr/", "node_modules/"],
});
