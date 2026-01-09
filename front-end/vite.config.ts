// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ Vite config otimizada para produção (Render) + Tailwind
export default defineConfig({
  // 🔥 base fundamental para SPA com subrotas (corrige refresh em páginas dinâmicas)
  base: "/",
  plugins: [react()],

  // ✅ Resolução de aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // ✅ Build otimizado para Render
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
    cssMinify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: undefined, // 🔒 evita divisão desnecessária de chunks
      },
    },
  },

  // ✅ Configuração do servidor de desenvolvimento
  server: {
    port: 5173,
    host: "0.0.0.0",
    open: false,
    watch: {
      usePolling: true,
    },
  },

  // ✅ Preview local (Render usa isso em produção)
  preview: {
    port: 10000,
    host: "0.0.0.0",
  },

  // ✅ Corrige erros PostCSS no Render (força Tailwind no build)
  css: {
    postcss: "./postcss.config.cjs",
  },
});
