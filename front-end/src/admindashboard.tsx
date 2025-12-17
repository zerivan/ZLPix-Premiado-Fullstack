import React, { useEffect, useState } from "react";
import {
  Settings,
  Trophy,
  Users,
  BarChart3,
  LogOut,
  Palette,
  FileText
} from "lucide-react";

/**
 * Fontes Google recomendadas
 * (seguras, populares, display ok)
 */
const GOOGLE_FONTS = [
  "Inter",
  "Poppins",
  "Manrope",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Nunito",
  "Playfair Display",
  "DM Sans"
];

type AppAppearance = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  themeMode: string;
  fontPrimary: string;
  fontHeading: string;
  mainButtonText: string;
  homeTitle: string;
  homeSubtitle: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("config");
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);

  function handleLogout() {
    localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
    window.location.href = "/admin";
  }

  // ============================
  // PREVIEW AO VIVO
  // ============================
  function applyPreview(data: AppAppearance) {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", data.primaryColor);
    root.style.setProperty("--color-secondary", data.secondaryColor);
    root.style.setProperty("--color-accent", data.accentColor);
    root.style.setProperty("--color-background", data.backgroundColor);

    if (data.fontPrimary) {
      document.body.style.fontFamily = data.fontPrimary;
    }

    if (data.fontHeading) {
      root.style.setProperty("--font-heading", data.fontHeading);
    }

    if (data.themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  async function loadAppearance() {
    try {
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance"
      );
      const json = await res.json();
      if (json.ok && json.data) {
        setAppearance(json.data);
        applyPreview(json.data);
      }
    } catch {
      console.error("Erro ao carregar aparência");
    }
  }

  async function saveAppearance() {
    if (!appearance) return;
    setLoading(true);
    try {
      await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appearance),
        }
      );
      alert("Aparência salva com sucesso");
    } catch {
      alert("Erro ao salvar aparência");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppearance();
  }, []);

  function updateAppearance<K extends keyof AppAppearance>(
    key: K,
    value: AppAppearance[K]
  ) {
    if (!appearance) return;
    const updated = { ...appearance, [key]: value };
    setAppearance(updated);
    applyPreview(updated);
  }

  const tabs = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "winners", label: "Ganhadores", icon: Trophy },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col text-gray-800">
      <header className="w-full bg-indigo-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>

      <nav className="flex flex-wrap justify-center gap-3 bg-white py-3 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 hover:bg-indigo-100"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-grow max-w-5xl w-full mx-auto bg-white mt-6 p-6 rounded-xl shadow">
        {activeTab === "appearance" && appearance && (
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-indigo-600">
              🎨 Aparência (Preview ao vivo)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                Fonte Principal
                <select
                  value={appearance.fontPrimary}
                  onChange={(e) =>
                    updateAppearance("fontPrimary", e.target.value)
                  }
                  className="p-2 border rounded w-full"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Fonte dos Títulos
                <select
                  value={appearance.fontHeading}
                  onChange={(e) =>
                    updateAppearance("fontHeading", e.target.value)
                  }
                  className="p-2 border rounded w-full"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              onClick={saveAppearance}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? "Salvando..." : "Salvar Aparência"}
            </button>
          </section>
        )}

        {activeTab === "config" && (
          <p className="text-gray-600">
            Configurações do sistema (mantidas, sem alteração).
          </p>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 ZLPix Premiado
      </footer>
    </div>
  );
}