// src/main.tsx
import ReactDOM from "react-dom/client";
import "./styles/index.css";

import { api } from "./api/client";
import AppRoutes from "./routes/approutes";
import { BrowserRouter } from "react-router-dom";

/**
 * Aplica aparência global no app
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

    // 🔤 Fonte
    if (appearance.fontPrimary) {
      document.body.style.fontFamily = appearance.fontPrimary;
    }

    // 🌗 Tema
    if (appearance.themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

  } catch (err) {
    console.warn("⚠️ Não foi possível aplicar aparência, usando padrão.");
  }
}

// Teste de conexão backend
api.get("/")
  .then(() => console.log("✅ Conectado ao backend com sucesso!"))
  .catch((err) =>
    console.error("❌ Erro ao conectar ao backend:", err.message)
  );

// Aplica aparência ANTES de renderizar
applyAppearance().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
});