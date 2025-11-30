import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: true,
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.mjs' : '.cjs'
  }),
  splitting: false,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2020',
  external: ['react', 'react-dom', 'tailwindcss']
});
