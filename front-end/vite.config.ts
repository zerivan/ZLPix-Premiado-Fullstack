// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500, // ✅ ajuste do warning (não afeta o build)
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  preview: {
    port: 10000,
    host: "0.0.0.0",
  },
});
