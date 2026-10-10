import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Test

export default defineConfig({
  plugins: [react()],

  // Relative Pfade: funktioniert auf GitHub Pages (https://mauroj13.github.io/LinguaAI/)
  // und lokal (http://localhost:5173/) – unabhängig vom Repository-Namen.
  base: "./",

  css: {
    preprocessorOptions: {
      scss: { api: "modern" },
    },
  },

  server: {
    port: 5173,
    open: false,
  },
});
