import { defineConfig } from "tsdown";

export default defineConfig((opciones) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  banner: { js: '"use client";' },
  sourcemap: true,
  dts: true,
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".mjs",
    dts: ".d.ts",
  }),
  /* En watch, `clean` vacía dist justo al arrancar. El servidor de la
     vitrina levanta en paralelo y resuelve sus imports contra dist, así que
     esa ventana le da un módulo inexistente. */
  clean: !opciones.watch,
  treeshake: true,
  outputOptions: { comments: { legal: true, annotation: true, jsdoc: false } },
  minify: false,
  target: "es2020",
}));
