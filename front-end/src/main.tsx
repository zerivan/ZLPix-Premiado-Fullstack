import ReactDOM from "react-dom/client";
import "./styles/index.css";

import AppRoutes from "./routes/approutes";
import { BrowserRouter } from "react-router-dom";

/**
 * Injeta Google Font dinamicamente (evita duplicar)
 */
function loadGoogleFont(font: string) {
  if (!font) return;

  const fontId = `gf-${font.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement("link");
  link.id = fontId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
    /\s+/g,
    "+"
  )}:wght@300;400;500;600;700;800&display=swap`;

  document.head.appendChild(link);
}

/**
 * Aplica aparência PADRÃO do site
 * (SITE NÃO DEPENDE DE CMS)
 */
function applyDefaultAppearance() {
  const root = document.documentElement;

  // 🎨 Cores padrão
  root.style.setProperty("--color-primary", "#4f46e5");
  root.style.setProperty("--color-secondary", "#6366f1");
  root.style.setProperty("--color-accent", "#facc15");
  root.style.setProperty("--color-background", "#ffffff");

  // 🔤 Fontes padrão
  loadGoogleFont("Inter");
  document.body.style.fontFamily = "Inter";
  root.style.setProperty("--font-heading", "Inter");

  // 🌗 Tema
  root.classList.remove("dark");
}

// ✅ Aplica aparência ANTES de renderizar o React
applyDefaultAppearance();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);