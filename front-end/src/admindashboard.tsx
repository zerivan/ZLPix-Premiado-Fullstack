import React, { useState } from "react";
import { Settings, Trophy, Users, BarChart3, LogOut } from "lucide-react";

interface Props {
  onLogout: () => void;
}

export default function admindashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState("config");

  const tabs = [
    { id: "config", label: "Configurações", icon: Settings },
    { id: "winners", label: "Ganhadores", icon: Trophy },
    { id: "users", label: "Usuários", icon: Users },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center text-gray-800">
      {/* Header */}
      <header className="w-full bg-indigo-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          Sair
        </button>
      </header>

      {/* Navegação */}
      <nav className="flex flex-wrap justify-center gap-3 bg-white w-full shadow-md py-3 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 hover:bg-indigo-100 text-gray-700"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Conteúdo das Abas */}
      <main className="flex-grow w-full max-w-4xl bg-white mt-6 p-6 rounded-xl shadow-lg">
        {activeTab === "config" && (
          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              ⚙️ Configurações do Sistema
            </h2>
            <p className="text-gray-600 mb-4">
              Ajuste as informações do sorteio, valor do prêmio e data de extração.
            </p>
            <form className="grid gap-4">
              <input
                type="text"
                placeholder="Título do Sorteio"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="number"
                placeholder="Valor do Prêmio (R$)"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="date"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold">
                Salvar Configurações
              </button>
            </form>
          </section>
        )}

        {activeTab === "winners" && (
          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              🏆 Ganhadores Recentes
            </h2>
            <ul className="space-y-2">
              <li className="p-3 border rounded-lg bg-gray-50 flex justify-between">
                <span>João Silva</span> <span>Pix R$200</span>
              </li>
              <li className="p-3 border rounded-lg bg-gray-50 flex justify-between">
                <span>Maria Souza</span> <span>Pix R$500</span>
              </li>
            </ul>
            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold">
              + Adicionar Ganhador
            </button>
          </section>
        )}

        {activeTab === "users" && (
          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              👥 Gerenciamento de Usuários
            </h2>
            <p className="text-gray-600">Lista de usuários conectados em breve...</p>
          </section>
        )}

        {activeTab === "reports" && (
          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">
              📊 Relatórios e Estatísticas
            </h2>
            <p className="text-gray-600">
              Gráficos e dados de desempenho do sorteio aparecerão aqui.
            </p>
          </section>
        )}
      </main>

      {/* Rodapé */}
      <footer className="w-full bg-gray-200 text-center py-4 text-sm text-gray-600 mt-auto">
        © 2025 ZLPix Premiado — Painel Administrativo
      </footer>
    </div>
  );
}