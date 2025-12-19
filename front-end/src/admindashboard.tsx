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

// 🧩 COMPONENTE CONTROLADOR (CAMADA CORRETA)
import ConfiguracoesControl from "./components/configuracoescontrol";

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
};

type ResultadoAtual = {
  concurso: string;
  dataApuracao: string;
};

function adminHeaders() {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("config");
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);

  const [resultadoAtual, setResultadoAtual] =
    useState<ResultadoAtual | null>(null);

  const CMS_KEY = "home";
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  function handleLogout() {
    localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
    window.location.href = "/admin";
  }

  function applyPreview(data: AppAppearance) {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", data.primaryColor);
    root.style.setProperty("--color-secondary", data.secondaryColor);
    root.style.setProperty("--color-accent", data.accentColor);
    root.style.setProperty("--color-background", data.backgroundColor);

    if (data.fontPrimary) document.body.style.fontFamily = data.fontPrimary;
    if (data.fontHeading)
      root.style.setProperty("--font-heading", data.fontHeading);

    data.themeMode === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
  }

  async function loadAppearance() {
    try {
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance",
        { headers: adminHeaders() }
      );
      const json = await res.json();
      if (json.ok && json.data) {
        setAppearance(json.data);
        applyPreview(json.data);
      }
    } catch {}
  }

  async function saveAppearance() {
    if (!appearance) return;
    setLoading(true);
    try {
      await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance",
        {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify(appearance)
        }
      );
      alert("Aparência salva");
    } finally {
      setLoading(false);
    }
  }

  async function loadContent() {
    try {
      const res = await fetch(
        `https://zlpix-premiado-backend.onrender.com/api/federal/admin/content/${CMS_KEY}`,
        { headers: adminHeaders() }
      );
      const json = await res.json();
      if (json.ok && json.data) {
        setTitle(json.data.title || "");
        setContentHtml(json.data.contentHtml || "");
      }
    } catch {}
  }

  async function saveContent() {
    setLoading(true);
    try {
      await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/content",
        {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify({
            key: CMS_KEY,
            title,
            contentHtml
          })
        }
      );
      alert("Conteúdo salvo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppearance();

    const raw = localStorage.getItem("ZLPIX_RESULTADO_ATUAL");
    if (raw) {
      try {
        setResultadoAtual(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (activeTab === "content") loadContent();
  }, [activeTab]);

  const tabs = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "winners", label: "Ganhadores", icon: Trophy },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-600 text-white px-4 py-4 flex justify-between">
        <h1 className="font-bold">Painel Administrativo</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-2 rounded"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

      <nav className="bg-white border-b px-3 py-2 flex gap-2 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 max-w-4xl mx-auto p-4">
        <div className="bg-white p-4 rounded shadow">

          {/* CONFIGURAÇÕES — AGORA VIA COMPONENTE */}
          {activeTab === "config" && <ConfiguracoesControl />}

          {activeTab === "appearance" && appearance && (
            <div className="space-y-3">
              <select
                value={appearance.fontPrimary}
                onChange={e =>
                  setAppearance({ ...appearance, fontPrimary: e.target.value })
                }
                className="border p-2 w-full"
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>

              <button
                onClick={saveAppearance}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Salvar Aparência
              </button>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-3">
              <input
                className="border p-2 w-full"
                placeholder="Título"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <textarea
                className="border p-2 w-full h-40"
                value={contentHtml}
                onChange={e => setContentHtml(e.target.value)}
              />
              <button
                onClick={saveContent}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Salvar Conteúdo
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}