import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "",              // 👈 ESSA LINHA RESOLVE O PROBLEMA DE CAMINHOS!
  plugins: [react()],
  build: { outDir: "dist" },
  server: { port: 5173 }
});