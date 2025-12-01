import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Configuração compatível com Render (ou Vercel)
export default defineConfig({
  base: "./", // Caminhos relativos — evita erro 404 no Render
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    host: true, // Permite acesso externo no Render
  },
});