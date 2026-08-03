import { defineConfig } from "tsup";

export default defineConfig((opciones) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  banner: { js: '"use client";' },
  sourcemap: true,
  dts: true,
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  splitting: false,
  /* En watch, `clean` vacía dist justo al arrancar. El servidor de la
     vitrina levanta en paralelo y resuelve sus imports contra dist, así que
     esa ventana le da un módulo inexistente. */
  clean: !opciones.watch,
  // treeshake (rollup) elimina el banner "use client"; el entry es un barrel
  // completo así que el treeshake no aporta nada aquí.
  treeshake: false,
  minify: false,
  target: "es2020",
  external: ["react", "react-dom", "tailwindcss"],
}));
