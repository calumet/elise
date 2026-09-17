import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      /* La segunda página existe para probar el marco con los anchos de la
         ventana y no los de una caja de la vitrina. */
      input: {
        main: path.resolve(__dirname, "index.html"),
        marco: path.resolve(__dirname, "marco.html"),
        campo: path.resolve(__dirname, "campo.html"),
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@tanstack/react-table")) return "vendor-tanstack";
          if (id.includes("react-day-picker")) return "vendor-calendar";
          if (id.includes("@radix-ui")) return "vendor-radix";
          return "vendor";
        },
      },
    },
  },
});
