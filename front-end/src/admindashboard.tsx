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
  Brain
} from "lucide-react";

import ConfiguracoesControl from "./components/configuracoescontrol";
import AparenciaControl from "./components/aparenciacontrol";
import ConteudoControl from "./components/conteudocontrol";
import AdminDiagnosticoIA from "./components/admindiagnosticoia";
import AdminGanhadores from "./components/adminganhadores";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "config" | "appearance" | "content" | "diagnostico" | "winners" | "users" | "reports"
  >("config");

  // 🔒 ISOLAMENTO DO PAINEL ADMIN
  useEffect(() => {
    document.body.classList.add("admin-area");
    return () => {
      document.body.classList.remove("admin-area");
    };
  }, []);

  // ✅ LOGOUT CORRETO (SPA)
  function handleLogout() {
    localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
    navigate("/admin", { replace: true });
  }

  const tabs = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "appearance", label: "Aparência", icon: Palette },
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "diagnostico", label: "Diagnóstico IA", icon: Brain },
    { id: "winners", label: "Ganhadores", icon: Trophy },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 }
  ] as const;

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
        {tabs.map(tab => {
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
          {activeTab === "config" && <ConfiguracoesControl />}
          {activeTab === "appearance" && <AparenciaControl />}
          {activeTab === "content" && <ConteudoControl />}
          {activeTab === "diagnostico" && <AdminDiagnosticoIA />}
          {activeTab === "winners" && <AdminGanhadores />}

          {activeTab === "users" && (
            <div className="text-sm text-gray-500">
              Módulo de usuários (backend OK, front ainda não ligado).
            </div>
          )}

          {activeTab === "reports" && (
            <div className="text-sm text-gray-500">
              Módulo de relatórios (backend OK, front ainda não ligado).
            </div>
          )}
        </div>
      </main>
    </div>
  );
}