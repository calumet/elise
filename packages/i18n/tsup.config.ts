import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/dates/index.ts", "src/numbers/index.ts"],
  format: ["esm", "cjs"],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  sourcemap: true,
  dts: true,
  splitting: false,
  clean: true,
  treeshake: true,
  minify: false,
  target: "es2020",
});
