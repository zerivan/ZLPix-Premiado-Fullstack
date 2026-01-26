
import React, { useEffect } from "react";
import AppRoutes from "./routes/index";
import { initializeApp } from "firebase/app";

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
initializeApp(firebaseConfig);

export default function App() {
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

  return <AppRoutes />;
}