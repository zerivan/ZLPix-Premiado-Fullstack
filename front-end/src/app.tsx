import React, { useEffect } from "react";
import AppRoutes from "./routes/index";
import { api } from "./api/client";

/**
 * Aplica aparência global:
 * - fonte principal
 * - fonte de títulos
 * - prepara cores via CSS variables
 * Tudo centralizado aqui (lugar correto)
 */
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

    // 🎨 Busca aparência no backend
    async function loadAppearance() {
      try {
        const res = await api.get("/api/federal/admin/app-appearance");
        if (!res.data?.ok || !res.data.data) return;

        const appearance = res.data.data;
        const root = document.documentElement;

        // 🎨 Cores
        if (appearance.primaryColor)
          root.style.setProperty("--color-primary", appearance.primaryColor);

        if (appearance.secondaryColor)
          root.style.setProperty("--color-secondary", appearance.secondaryColor);

        if (appearance.accentColor)
          root.style.setProperty("--color-accent", appearance.accentColor);

        if (appearance.backgroundColor)
          root.style.setProperty("--color-background", appearance.backgroundColor);

        // 🔤 Fontes
        if (appearance.fontPrimary) {
          document.body.style.fontFamily = appearance.fontPrimary;
        }

        if (appearance.fontHeading) {
          root.style.setProperty("--font-heading", appearance.fontHeading);
        }

        // 🌗 Tema
        if (appearance.themeMode === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      } catch (err) {
        console.warn("⚠️ Aparência não carregada, usando padrão.");
      }
    }

    loadAppearance();

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <React.StrictMode>
      <AppRoutes />
    </React.StrictMode>
  );
}