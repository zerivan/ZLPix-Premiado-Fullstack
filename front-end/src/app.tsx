import React, { useEffect } from "react";
import AppRoutes from "./routes/index";

/**
 * Aplica fonte de títulos (fontHeading) vinda da configuração
 * Usa CSS customizado, sem mexer no Tailwind
 */
export default function App() {
  useEffect(() => {
    const root = document.documentElement;

    // cria regra global para títulos usando CSS variables
    const style = document.createElement("style");
    style.innerHTML = `
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading, inherit);
      }
    `;
    document.head.appendChild(style);

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