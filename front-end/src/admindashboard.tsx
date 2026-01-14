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
  Banknote,
} from "lucide-react";

// ✅ IMPORTS CORRETOS — CASE-SENSITIVE / LINUX SAFE
import AdminConfiguracoesControl from "./components/adminconfiguracoescontrol";
import AdminAparenciaControl from "./components/adminaparenciacontrol";
import AdminConteudoControl from "./components/adminconteudocontrol";
import AdminDiagnosticoIA from "./components/admindiagnosticoia";
import AdminGanhadores from "./components/adminganhadores";
import AdminUsuariosControl from "./components/adminusuarioscontrol";
import AdminRelatoriosControl from "./components/adminrelatorioscontrol";

type TabId =
  | "config"
  | "appearance"
  | "content"
  | "diagnostico"
  | "winners"
  | "users"
  | "reports"
  | "withdrawals"; // ✅ NOVA ABA

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    document.body.classList.add("admin-area");
    return () => {
      document.body.classList.remove("admin-area");
    };
  }, [navigate]);

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
    { id: "withdrawals", label: "Saques", icon: Banknote }, // ✅ AQUI
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  function renderTab() {
    if (!activeTab) {
      return (
        <div className="text-sm text-gray-500">
          Selecione uma opção no menu acima.
        </div>
      );
    }

    switch (activeTab) {
      case "config":
        return <AdminConfiguracoesControl />;
      case "appearance":
        return <AdminAparenciaControl />;
      case "content":
        return <AdminConteudoControl />;
      case "diagnostico":
        return <AdminDiagnosticoIA />;
      case "winners":
        return <AdminGanhadores />;
      case "users":
        return <AdminUsuariosControl />;
      case "reports":
        return <AdminRelatoriosControl />;
      case "withdrawals":
        return (
          <div className="text-sm text-gray-600">
            Aba de <strong>Saques</strong> criada.  
            Listagem e aprovação serão implementadas no próximo passo.
          </div>
        );
      default:
        return null;
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