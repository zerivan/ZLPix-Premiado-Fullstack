import React, { useEffect } from "react";
import AppRoutes from "./routes/index";
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
} from "firebase/messaging";

/**
 * ============================
 * FIREBASE CONFIG (ENV)
 * ============================
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa Firebase uma única vez
const firebaseApp = initializeApp(firebaseConfig);

export default function App() {
  useEffect(() => {
    // 🔠 Fonte dos títulos (CSS global)
    const style = document.createElement("style");
    style.innerHTML = `
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading, inherit);
      }
    `;
    document.head.appendChild(style);

    // 🎨 Aparência PADRÃO (segura)
    const root = document.documentElement;

    root.style.setProperty("--color-primary", "#4f46e5");
    root.style.setProperty("--color-secondary", "#6366f1");
    root.style.setProperty("--color-accent", "#facc15");
    root.style.setProperty("--color-background", "#ffffff");
    root.style.setProperty("--font-heading", "Inter");

    document.body.style.fontFamily = "Inter";
    root.classList.remove("dark");

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  /**
   * ============================
   * WEB PUSH — ANDROID / DESKTOP
   * ============================
   */
  useEffect(() => {
    async function initPush() {
      try {
        // Verifica se o browser suporta Push
        const supported = await isSupported();
        if (!supported) return;

        // Só pede permissão se ainda não foi decidida
        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        const messaging = getMessaging(firebaseApp);

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        if (!token) return;

        // Envia token para o backend
        await fetch(
          `${import.meta.env.VITE_API_URL}/push/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );
      } catch (err) {
        console.warn("Push notification indisponível:", err);
      }
    }

    initPush();
  }, []);

  return <AppRoutes />;
}
