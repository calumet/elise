import { defineConfig } from "tsup";

export default defineConfig((opciones) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  dts: true,
  sourcemap: true,
  splitting: false,
  /* En watch, `clean` vacía dist justo al arrancar. El servidor de la
     vitrina levanta en paralelo y resuelve sus imports contra dist, así que
     esa ventana le da un módulo inexistente. */
  clean: !opciones.watch,
  treeshake: true,
  minify: false,
  target: "es2020",
}));
