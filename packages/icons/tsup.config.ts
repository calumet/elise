import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  treeshake: true,
  minify: false,
  target: "es2020",
});
