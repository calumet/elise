import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/forms/index.ts', 'src/toasts/index.ts', 'src/dates/index.ts', 'src/alerts/index.ts', 'src/tables/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: true,
  splitting: false,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2020'
});
