import React, { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState("config");
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);

  // ===== BLOCO CMS =====
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

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

    if (data.fontPrimary) document.body.style.fontFamily = data.fontPrimary;
    if (data.fontHeading) root.style.setProperty("--font-heading", data.fontHeading);

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
          body: JSON.stringify(appearance),
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

  // ============================
  // BLOCO CMS
  // ============================
  function addBlock(type: BlockType) {
    setBlocks([
      ...blocks,
      { id: crypto.randomUUID(), type, value: "" }
    ]);
  }

  function updateBlock(id: string, value: string) {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, value } : b)));
  }

  function moveBlock(index: number, dir: number) {
    const copy = [...blocks];
    const target = copy[index];
    copy[index] = copy[index + dir];
    copy[index + dir] = target;
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
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col text-gray-800">
      <header className="w-full bg-indigo-600 text-white py-4 px-6 flex justify-between">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <button onClick={handleLogout} className="flex gap-2 bg-red-500 px-4 py-2 rounded">
          <LogOut size={18} /> Sair
        </button>
      </header>

      <nav className="flex justify-center gap-3 bg-white py-3 border-b">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded ${
              activeTab === t.id ? "bg-indigo-600 text-white" : "bg-gray-100"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-grow max-w-5xl w-full mx-auto bg-white mt-6 p-6 rounded-xl shadow">
        {/* APARÊNCIA */}
        {activeTab === "appearance" && appearance && (
          <section className="space-y-4">
            <select
              value={appearance.fontPrimary}
              onChange={e => updateAppearance("fontPrimary", e.target.value)}
              className="border p-2 w-full"
            >
              {GOOGLE_FONTS.map(f => <option key={f}>{f}</option>)}
            </select>

            <select
              value={appearance.fontHeading}
              onChange={e => updateAppearance("fontHeading", e.target.value)}
              className="border p-2 w-full"
            >
              {GOOGLE_FONTS.map(f => <option key={f}>{f}</option>)}
            </select>

            <button onClick={saveAppearance} className="bg-indigo-600 text-white px-6 py-3 rounded">
              Salvar Aparência
            </button>
          </section>
        )}

        {/* CMS */}
        {activeTab === "content" && (
          <section className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => addBlock("title")}><Plus size={16}/> Título</button>
              <button onClick={() => addBlock("text")}><Plus size={16}/> Texto</button>
              <button onClick={() => addBlock("button")}><Plus size={16}/> Botão</button>
              <button onClick={() => addBlock("html")}><Plus size={16}/> HTML</button>
            </div>

            {blocks.map((b, i) => (
              <div key={b.id} className="border p-3 rounded space-y-2">
                <textarea
                  value={b.value}
                  onChange={e => updateBlock(b.id, e.target.value)}
                  className="w-full border p-2"
                  placeholder={`Bloco ${b.type}`}
                />
                <div className="flex gap-2">
                  {i > 0 && <ArrowUp onClick={() => moveBlock(i, -1)} />}
                  {i < blocks.length - 1 && <ArrowDown onClick={() => moveBlock(i, 1)} />}
                  <Trash2 onClick={() => removeBlock(b.id)} />
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 ZLPix Premiado
      </footer>
    </div>
  );
}