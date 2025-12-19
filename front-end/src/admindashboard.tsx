import React, { useEffect, useState } from "react";
import {
  Settings,
  Trophy,
  Users,
  BarChart3,
  LogOut,
  Palette,
  FileText,
  Brain
} from "lucide-react";

// 🧩 COMPONENTES CONTROLADORES (CAMADA CORRETA)
import ConfiguracoesControl from "./components/configuracoescontrol";
import AparenciaControl from "./components/aparenciacontrol";
import AdminDiagnosticoIA from "./components/admindiagnosticoia";

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

  const [resultadoAtual, setResultadoAtual] =
    useState<ResultadoAtual | null>(null);

  // CMS simples
  const CMS_KEY = "home";
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * 🔒 ISOLAMENTO DO PAINEL ADMIN
   * Ativa CSS exclusivo enquanto o admin estiver montado
   */
  useEffect(() => {
    document.body.classList.add("admin-area");
    return () => {
      document.body.classList.remove("admin-area");
    };
  }, []);

  /**
   * 🔐 LOGOUT DO ADMIN
   */
  function handleLogout() {
    localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
    window.location.href = "/admin";
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
    { id: "diagnostico", label: "Diagnóstico IA", icon: Brain },
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
          className="bg-red-500 px-3 py-2 rounded flex items-center gap-2"
        >
          <LogOut size={16} />
          Sair
        </button>
      </header>

      <nav className="bg-white border-b px-3 py-2 flex gap-2 overflow-x-auto relative z-20">
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

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 relative z-0">
        <div className="bg-white p-4 rounded shadow relative z-10">

          {/* CONFIGURAÇÕES */}
          {activeTab === "config" && <ConfiguracoesControl />}

          {/* APARÊNCIA */}
          {activeTab === "appearance" && <AparenciaControl />}

          {/* CONTEÚDO / CMS */}
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
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Salvar Conteúdo
              </button>
            </div>
          )}

          {/* 🧠 DIAGNÓSTICO IA */}
          {activeTab === "diagnostico" && <AdminDiagnosticoIA />}

        </div>
      </main>
    </div>
  );
}