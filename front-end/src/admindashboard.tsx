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

type AppContent = {
  key: string;
  title: string;
  contentHtml: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("config");
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);

  // Conteúdo / HTML
  const [contentKey, setContentKey] = useState("how_to_play");
  const [contentTitle, setContentTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  function handleLogout() {
    localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
    window.location.href = "/admin";
  }

  // ============================
  // PREVIEW AO VIVO (APARÊNCIA)
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
    } catch {
      alert("Erro ao salvar aparência");
    } finally {
      setLoading(false);
    }
  }

  // ============================
  // CONTEÚDO / HTML
  // ============================
  async function loadContent(key: string) {
    try {
      const res = await fetch(
        `https://zlpix-premiado-backend.onrender.com/api/federal/admin/content/${key}`
      );
      const json = await res.json();
      if (json.ok && json.data) {
        setContentTitle(json.data.title);
        setContentHtml(json.data.contentHtml);
      } else {
        setContentTitle("");
        setContentHtml("");
      }
    } catch (err) {
      console.error("Erro ao carregar conteúdo", err);
    }
  }

  async function saveContent() {
    setLoading(true);
    try {
      await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/content",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: contentKey,
            title: contentTitle,
            contentHtml,
          }),
        }
      );
      alert("Conteúdo salvo com sucesso");
    } catch {
      alert("Erro ao salvar conteúdo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppearance();
  }, []);

  useEffect(() => {
    if (activeTab === "content") {
      loadContent(contentKey);
    }
  }, [activeTab, contentKey]);

  const tabs = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "winners", label: "Ganhadores", icon: Trophy },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  function updateAppearance<K extends keyof AppAppearance>(
    key: K,
    value: AppAppearance[K]
  ) {
    if (!appearance) return;
    const updated = { ...appearance, [key]: value };
    setAppearance(updated);
    applyPreview(updated);
  }

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
        {/* APARÊNCIA */}
        {activeTab === "appearance" && appearance && (
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-indigo-600">
              🎨 Aparência (Preview ao vivo)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                Cor Primária
                <input
                  type="color"
                  value={appearance.primaryColor}
                  onChange={(e) =>
                    updateAppearance("primaryColor", e.target.value)
                  }
                />
              </label>

              <label>
                Cor Secundária
                <input
                  type="color"
                  value={appearance.secondaryColor}
                  onChange={(e) =>
                    updateAppearance("secondaryColor", e.target.value)
                  }
                />
              </label>

              <label>
                Fonte Principal
                <input
                  type="text"
                  value={appearance.fontPrimary}
                  onChange={(e) =>
                    updateAppearance("fontPrimary", e.target.value)
                  }
                  className="p-2 border rounded w-full"
                />
              </label>

              <label>
                Fonte Títulos
                <input
                  type="text"
                  value={appearance.fontHeading}
                  onChange={(e) =>
                    updateAppearance("fontHeading", e.target.value)
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

        {/* CONTEÚDO */}
        {activeTab === "content" && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-indigo-600">
              📝 Editor de Conteúdo / HTML
            </h2>

            <select
              value={contentKey}
              onChange={(e) => setContentKey(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="how_to_play">Como Jogar</option>
              <option value="rules">Regras</option>
              <option value="home_text">Texto da Home</option>
            </select>

            <input
              type="text"
              placeholder="Título"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              className="p-2 border rounded w-full"
            />

            <textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              rows={10}
              className="p-3 border rounded w-full font-mono"
              placeholder="<p>Conteúdo HTML aqui...</p>"
            />

            <button
              onClick={saveContent}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? "Salvando..." : "Salvar Conteúdo"}
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