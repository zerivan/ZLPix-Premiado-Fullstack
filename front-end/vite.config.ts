import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 🚀 Configuração otimizada para Render
export default defineConfig({
  base: "./", // ✅ Caminhos relativos — evita erro 404 no Render
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets", // Mantém estrutura estável no deploy
    sourcemap: false, // Pode deixar true se quiser debugar
    emptyOutDir: true, // Limpa antes de cada build
  },
  server: {
    port: 5173,
    host: "0.0.0.0", // ✅ Necessário pro Render acessar a app
  },
  preview: {
    port: 10000, // 👈 Igual ao Render
    host: "0.0.0.0",
  },
});