import { defineConfig } from "tsdown";

export default defineConfig((opciones) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".mjs",
    dts: ".d.ts",
  }),
  sourcemap: true,
  dts: true,
  // En watch no se limpia: la vitrina resuelve contra dist mientras arranca.
  clean: !opciones.watch,
  treeshake: true,
  // El JSDoc ya viaja en el `.d.ts`, que es de donde lo lee el editor.
  outputOptions: { comments: { legal: true, annotation: true, jsdoc: false } },
  minify: false,
  target: "es2020",
}));
