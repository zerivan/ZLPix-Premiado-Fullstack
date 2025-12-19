import ReactDOM from "react-dom/client";
import "./styles/index.css";

import { api } from "./api/client";
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
 * Aplica aparência global no app
 * (cores + fontes + tema)
 *
 * ⚠️ ROTA ALINHADA COM A NOVA ARQUITETURA
 */
async function applyAppearance() {
  try {
    const res = await api.get("/api/federal/app-appearance");
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

    // 🔤 Google Fonts (dinâmico)
    if (appearance.fontPrimary) {
      loadGoogleFont(appearance.fontPrimary);
      document.body.style.fontFamily = appearance.fontPrimary;
    }

    if (appearance.fontHeading) {
      loadGoogleFont(appearance.fontHeading);
      root.style.setProperty("--font-heading", appearance.fontHeading);
    }

    // 🌗 Tema
    if (appearance.themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  } catch (err) {
    console.warn("⚠️ Não foi possível aplicar aparência, usando padrão.");
  }
}

// Aplica aparência ANTES de renderizar o React
applyAppearance().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
});