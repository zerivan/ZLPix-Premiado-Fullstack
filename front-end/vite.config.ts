// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/", // 🔥 FUNDAMENTAL para SPA com subrotas
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  /**
   * ============================
   * FIREBASE — CONFIG INJETADA
   * ============================
   * (chaves públicas, seguro no front)
   */
  define: {
    __FIREBASE_CONFIG__: JSON.stringify({
      apiKey: "AIzaSyBTJanXweYDNFHvYvW7EP6fUbyUMcDz3Ig",
      authDomain: "zlpix-premiado.firebaseapp.com",
      projectId: "zlpix-premiado",
      storageBucket: "zlpix-premiado.firebasestorage.app",
      messagingSenderId: "530368618940",
      appId: "1:530368618940:web:bfbb8dd5d343eb1526cbb9",
      vapidKey:
        "BDxne-vTVfpexLtFIDQmUOmQMgRabnfwTxFwFWZN8pS8g7RT0XckrCPVoBPFzBvgSXS6uLg_PWbbhxuQPQqFEBI",
    }),
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      external: ["dompurify"],
    },
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