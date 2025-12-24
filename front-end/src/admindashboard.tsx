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
  Brain,
} from "lucide-react";

import ConfiguracoesControl from "./components/configuracoescontrol";
import AparenciaControl from "./components/aparenciacontrol";
import ConteudoControl from "./components/conteudocontrol";
import AdminDiagnosticoIA from "./components/admindiagnosticoia";
import AdminGanhadores from "./components/adminganhadores";
import AdminUsuariosControl from "./components/adminusuarioscontrol";

// 🔥 IMPORT CORRETO DO RELATÓRIO
import AdminRelatoriosControl from "./components/adminrelatorioscontrol";

type TabId =
  | "config"
  | "appearance"
  | "content"
  | "diagnostico"
  | "winners"
  | "users"
  | "reports";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("appearance");

  useEffect(() => {
    document.body.classList.add("admin-area");
    return () => {
      document.body.classList.remove("admin-area");
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
    navigate("/admin", { replace: true });
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "diagnostico", label: "Diagnóstico IA", icon: Brain },
    { id: "winners", label: "Ganhadores", icon: Trophy },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  function renderTab() {
    try {
      switch (activeTab) {
        case "config":
          return <ConfiguracoesControl />;
        case "appearance":
          return <AparenciaControl />;
        case "content":
          return <ConteudoControl />;
        case "diagnostico":
          return <AdminDiagnosticoIA />;
        case "winners":
          return <AdminGanhadores />;
        case "users":
          return <AdminUsuariosControl />;
        case "reports":
          return <AdminRelatoriosControl />; // ✅ AGORA CERTO
        default:
          return null;
      }
    } catch (err) {
      console.error("Erro ao renderizar aba:", err);
      return (
        <div className="text-sm text-red-600">
          Erro ao carregar este módulo.
        </div>
      );
    }
  }

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

      <nav className="bg-white border-b px-3 py-2 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4">
        <div className="bg-white p-4 rounded shadow">
          {renderTab()}
        </div>
      </main>
    </div>
  );
}