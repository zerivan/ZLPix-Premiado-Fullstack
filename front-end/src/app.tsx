import React, { useEffect } from "react";
import AppRoutes from "./routes/index";

/**
 * App ROOT
 * - NÃO consulta CMS
 * - NÃO depende do painel ADM
 * - NÃO trava render
 *
 * CMS é responsabilidade do ADMIN, não do site público
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

  return <AppRoutes />;
}