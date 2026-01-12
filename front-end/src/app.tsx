import React, { useEffect } from "react";
import AppRoutes from "./routes/index";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

/**
 * ============================
 * FIREBASE CONFIG (VITE DEFINE)
 * ============================
 * Injetado via vite.config.ts
 */
declare const __FIREBASE_CONFIG__: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
};

// Inicializa Firebase uma única vez
const firebaseApp = initializeApp({
  apiKey: __FIREBASE_CONFIG__.apiKey,
  authDomain: __FIREBASE_CONFIG__.authDomain,
  projectId: __FIREBASE_CONFIG__.projectId,
  storageBucket: __FIREBASE_CONFIG__.storageBucket,
  messagingSenderId: __FIREBASE_CONFIG__.messagingSenderId,
  appId: __FIREBASE_CONFIG__.appId,
});

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
        const supported = await isSupported();
        if (!supported) return;

        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        const messaging = getMessaging(firebaseApp);

        const token = await getToken(messaging, {
          vapidKey: __FIREBASE_CONFIG__.vapidKey,
        });

        if (!token) return;

        // 🔑 RESOLVE USER ID (CORREÇÃO)
        const stored = localStorage.getItem("USER_ZLPIX");
        const parsed = stored ? JSON.parse(stored) : null;

        const userId =
          localStorage.getItem("USER_ID") ||
          parsed?.id ||
          parsed?.userId ||
          parsed?._id;

        if (!userId) return;

        // 📡 ENVIA TOKEN + USERID (CORRETO)
        await fetch(`${import.meta.env.VITE_API_URL}/push/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            userId: Number(userId),
          }),
        });
      } catch (err) {
        console.warn("Push notification indisponível:", err);
      }
    }

    initPush();
  }, []);

  return <AppRoutes />;
}