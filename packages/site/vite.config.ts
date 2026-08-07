import { suamoxPages } from "@calumet/suamox-vite-plugin-pages";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), suamoxPages({ pagesDir: "src/pages", extensions: [".tsx"] })],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    // El runtime de SSG lee el manifiesto para inyectar el CSS y el JS en cada
    // página prerenderizada, así que tiene que emitirse.
    outDir: "dist/client",
    manifest: true,
  },
});
