import { defineConfig } from "tsdown";

export default defineConfig((opciones) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".mjs",
    dts: ".d.ts",
  }),
  dts: true,
  sourcemap: true,
  /* En watch, `clean` vacía dist justo al arrancar. El servidor de la
     vitrina levanta en paralelo y resuelve sus imports contra dist, así que
     esa ventana le da un módulo inexistente. */
  clean: !opciones.watch,
  treeshake: true,
  /* El JSDoc fuera del bundle: rolldown lo conserva por defecto y aquí son 98 KB.

     Las anotaciones se quedan, que son las que guían el treeshaking de quien consume. */
  outputOptions: { comments: { legal: true, annotation: true, jsdoc: false } },
  minify: false,
  target: "es2020",
}));
