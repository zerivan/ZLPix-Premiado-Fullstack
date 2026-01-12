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
      apiKey: "SUA_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      projectId: "SEU_PROJECT_ID",
      storageBucket: "SEU_STORAGE_BUCKET",
      messagingSenderId: "SEU_SENDER_ID",
      appId: "SEU_APP_ID",
      vapidKey: "SUA_VAPID_KEY",
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