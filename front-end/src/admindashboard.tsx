import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Trophy,
  Users,
  BarChart3,
  LogOut,
  Palette,
  FileText,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus
} from "lucide-react";

/**
 * Fontes Google recomendadas
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

type BlockType = "title" | "text" | "button" | "html";

type ContentBlock = {
  id: string;
  type: BlockType;
  value: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate(); // ✅ AQUI
  const [activeTab, setActiveTab] = useState("config");
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // ✅ LOGOUT CORRETO
  function handleLogout() {
    localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
    navigate("/admin", { replace: true });
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
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance"
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appearance)
        }
      );
      alert("Aparência salva com sucesso");
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

  function addBlock(type: BlockType) {
    setBlocks([...blocks, { id: crypto.randomUUID(), type, value: "" }]);
  }

  function updateBlock(id: string, value: string) {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, value } : b)));
  }

  function moveBlock(index: number, dir: number) {
    const copy = [...blocks];
    [copy[index], copy[index + dir]] = [copy[index + dir], copy[index]];
    setBlocks(copy);
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter(b => b.id !== id));
  }

  const tabs = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "winners", label: "Ganhadores", icon: Trophy },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-indigo-600 text-white px-4 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Painel Administrativo</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 px-3 py-2 rounded"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

      {/* NAV */}
      <nav className="bg-white border-b overflow-x-auto">
        <div className="flex gap-2 px-3 py-2 min-w-max">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap ${
                  activeTab === t.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* CONTEÚDO */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow p-4">
          {activeTab === "appearance" && appearance && (
            <div className="space-y-4">
              <select
                value={appearance.fontPrimary}
                onChange={e =>
                  updateAppearance("fontPrimary", e.target.value)
                }
                className="border p-2 w-full rounded"
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>

              <select
                value={appearance.fontHeading}
                onChange={e =>
                  updateAppearance("fontHeading", e.target.value)
                }
                className="border p-2 w-full rounded"
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>

              <button
                onClick={saveAppearance}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded"
              >
                {loading ? "Salvando..." : "Salvar Aparência"}
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 ZLPix Premiado
      </footer>
    </div>
  );
}