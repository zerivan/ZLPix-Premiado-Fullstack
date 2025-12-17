import React, { useEffect, useState } from "react";
import { Settings, Trophy, Users, BarChart3, LogOut, Palette } from "lucide-react";

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

  async function loadAppearance() {
    try {
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance"
      );
      const json = await res.json();
      if (json.ok) setAppearance(json.data);
    } catch (err) {
      console.error("Erro ao carregar aparência", err);
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
    } catch (err) {
      alert("Erro ao salvar aparência");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppearance();
  }, []);

  const tabs = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "appearance", label: "Aparência", icon: Palette },
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
              🎨 Aparência do Aplicativo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                Cor Primária
                <input
                  type="color"
                  value={appearance.primaryColor}
                  onChange={(e) =>
                    setAppearance({ ...appearance, primaryColor: e.target.value })
                  }
                />
              </label>

              <label>
                Cor Secundária
                <input
                  type="color"
                  value={appearance.secondaryColor}
                  onChange={(e) =>
                    setAppearance({ ...appearance, secondaryColor: e.target.value })
                  }
                />
              </label>

              <label>
                Fonte Principal
                <input
                  type="text"
                  value={appearance.fontPrimary}
                  onChange={(e) =>
                    setAppearance({ ...appearance, fontPrimary: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                />
              </label>

              <label>
                Texto Botão Principal
                <input
                  type="text"
                  value={appearance.mainButtonText}
                  onChange={(e) =>
                    setAppearance({ ...appearance, mainButtonText: e.target.value })
                  }
                  className="p-2 border rounded w-full"
                />
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