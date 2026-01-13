import React, { useEffect } from "react";
import AppRoutes from "./routes/index";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

/**
 * ============================
 * FIREBASE CONFIG (VITE DEFINE)
 * ============================
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

// 🔥 Inicializa Firebase UMA VEZ
const firebaseApp = initializeApp({
  apiKey: __FIREBASE_CONFIG__.apiKey,
  authDomain: __FIREBASE_CONFIG__.authDomain,
  projectId: __FIREBASE_CONFIG__.projectId,
  storageBucket: __FIREBASE_CONFIG__.storageBucket,
  messagingSenderId: __FIREBASE_CONFIG__.messagingSenderId,
  appId: __FIREBASE_CONFIG__.appId,
});

export default function App() {
  /**
   * ============================
   * APARÊNCIA GLOBAL (SEGURA)
   * ============================
   */
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading, inherit);
      }
    `;
    document.head.appendChild(style);

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
   * PUSH NOTIFICATION (ROBUSTO)
   * ============================
   */
  useEffect(() => {
    let interval: any;

    async function tryInitPush() {
      try {
        const supported = await isSupported();
        if (!supported) return;

        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        // 🔑 Resolve USER ID (espera login)
        const stored = localStorage.getItem("USER_ZLPIX");
        const parsed = stored ? JSON.parse(stored) : null;

        const userId =
          localStorage.getItem("USER_ID") ||
          parsed?.id ||
          parsed?.userId ||
          parsed?._id;

        if (!userId) return;

        // 🔒 Evita registrar token duas vezes
        if (localStorage.getItem("PUSH_TOKEN_SENT") === "true") return;

        const messaging = getMessaging(firebaseApp);

        const token = await getToken(messaging, {
          vapidKey: __FIREBASE_CONFIG__.vapidKey,
        });

        if (!token) {
          console.warn("⚠️ Push: token vazio");
          return;
        }

        console.log("✅ FCM TOKEN:", token);
        console.log("👤 USER ID:", userId);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/push/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              userId: Number(userId),
            }),
          }
        );

        console.log("📡 PUSH BACKEND STATUS:", res.status);

        if (res.ok) {
          localStorage.setItem("PUSH_TOKEN_SENT", "true");
          clearInterval(interval);
        }
      } catch (err) {
        console.warn("❌ Push notification indisponível:", err);
      }
    }

    // 🔁 Tenta a cada 2s até o usuário logar
    interval = setInterval(tryInitPush, 2000);
    tryInitPush();

    return () => clearInterval(interval);
  }, []);

  return <AppRoutes />;
}