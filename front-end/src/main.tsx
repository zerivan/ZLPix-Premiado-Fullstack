import ReactDOM from "react-dom/client";
import "./styles/index.css";

import { api } from "./api/client";
import AppRoutes from "./routes/approutes";
import { BrowserRouter } from "react-router-dom";

/**
 * Aplica aparência global no app
 * (cores + fonte base + tema)
 */
async function applyAppearance() {
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

    // 🔤 Fonte base
    if (appearance.fontPrimary) {
      document.body.style.fontFamily = appearance.fontPrimary;
    }

    // 🔠 Fonte de títulos (usada no App.tsx)
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
    console.warn("⚠️ Não foi possível aplicar aparência, usando padrão.");
  }
}

// Aplica aparência ANTES de renderizar
applyAppearance().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
});