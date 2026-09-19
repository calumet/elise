import { defineConfig } from "tsdown";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  banner: { js: '"use client";' },
  sourcemap: true,
  dts: true,
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".mjs",
    dts: ".d.ts",
  }),
  // En watch no se limpia: la vitrina resuelve contra dist mientras arranca.
  clean: !options.watch,
  treeshake: true,
  outputOptions: { comments: { legal: true, annotation: true, jsdoc: false } },
  minify: false,
  target: "es2020",
}));
