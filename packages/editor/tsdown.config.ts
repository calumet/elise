import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/render.ts"],
  format: ["esm", "cjs"],
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".mjs",
    dts: ".d.ts",
  }),
  sourcemap: true,
  dts: true,
  clean: !options.watch,
  treeshake: true,
  outputOptions: { comments: { legal: true, annotation: true, jsdoc: false } },
  minify: false,
  target: "es2020",
}));
