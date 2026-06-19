import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  banner: { js: '"use client";' },
  sourcemap: true,
  dts: true,
  outExtension: ({ format }) => ({
    js: format === "esm" ? ".mjs" : ".cjs",
  }),
  splitting: false,
  clean: true,
  // treeshake (rollup) elimina el banner "use client"; el entry es un barrel
  // completo así que el treeshake no aporta nada aquí.
  treeshake: false,
  minify: false,
  target: "es2020",
  external: ["react", "react-dom", "tailwindcss"],
});
