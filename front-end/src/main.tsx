import ReactDOM from "react-dom/client";
import "./styles/index.css";

import AppRoutes from "./routes/approutes";
import { BrowserRouter } from "react-router-dom";
import { setupGlobalAxiosInterceptors } from "./api/setupInterceptors";

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
 * 🔥 ADICIONADO — carregamento dos ícones
 */
function loadMaterialIcons() {
  const id = "material-symbols";
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";

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

  // 🔥 ADICIONADO AQUI
  loadMaterialIcons();

  document.body.style.fontFamily = "Inter";
  root.style.setProperty("--font-heading", "Inter");

  // 🌗 Tema
  root.classList.remove("dark");
}

// ✅ Aplica aparência ANTES de renderizar o React
applyDefaultAppearance();
setupGlobalAxiosInterceptors();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

/**
 * ============================
 * SERVICE WORKER — FIREBASE PUSH
 * ============================
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(() => {
        console.log("Service Worker registrado (Push)");
      })
      .catch((err) => {
        console.warn("Erro ao registrar Service Worker:", err);
      });
  });
}