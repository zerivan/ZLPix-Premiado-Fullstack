import { useEffect, useState } from "react";
import axios from "axios";

type ConfiguracoesAdmin = {
  modoManutencao: boolean;
  diagnosticoIA: boolean;
  painelFinanceiro: boolean;
};

// ✅ DEFAULT SEGURO
const DEFAULT_CONFIG: ConfiguracoesAdmin = {
  modoManutencao: false,
  diagnosticoIA: false,
  painelFinanceiro: false,
};

export default function ConfiguracoesControl() {
  const [config, setConfig] = useState<ConfiguracoesAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";

  function getAuthHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // =========================
  // LOAD CONFIGURAÇÕES
  // =========================
  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      setErro(null);

      const headers = getAuthHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/api/admin/configuracoes`,
        { headers }
      );

      if (res.data?.ok) {
        // ✅ NORMALIZAÇÃO DEFINITIVA
        setConfig({
          modoManutencao: !!res.data.data?.modoManutencao,
          diagnosticoIA: !!res.data.data?.diagnosticoIA,
          painelFinanceiro: !!res.data.data?.painelFinanceiro,
        });
      } else {
        setConfig(DEFAULT_CONFIG);
      }
    } catch {
      setConfig(DEFAULT_CONFIG);
      setErro("Falha ao carregar configurações do sistema.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // SAVE CONFIGURAÇÕES
  // =========================
  async function salvarConfiguracoes(novoValor: ConfiguracoesAdmin) {
    try {
      setSalvando(true);
      setErro(null);

      const headers = getAuthHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      await axios.post(
        `${BASE_URL}/api/admin/configuracoes`,
        novoValor,
        { headers }
      );

      setConfig(novoValor);
    } catch {
      setErro("Erro ao salvar configurações.");
    } finally {
      setSalvando(false);
    }
  }

  function toggle(key: keyof ConfiguracoesAdmin) {
    if (!config) return;

    salvarConfiguracoes({
      ...config,
      [key]: !config[key],
    });
  }

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando configurações do sistema...
      </div>
    );
  }

  if (erro && !config) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  if (!config) {
    return (
      <div className="text-sm text-red-500">
        Configuração indisponível
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Configurações do Sistema
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span><strong>Modo manutenção</strong></span>
          <button
            onClick={() => toggle("modoManutencao")}
            disabled={salvando}
            className={`px-3 py-1 rounded text-white ${
              config.modoManutencao ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            {config.modoManutencao ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span><strong>Diagnóstico com IA</strong></span>
          <button
            onClick={() => toggle("diagnosticoIA")}
            disabled={salvando}
            className={`px-3 py-1 rounded text-white ${
              config.diagnosticoIA ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            {config.diagnosticoIA ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span><strong>Painel financeiro</strong></span>
          <button
            onClick={() => toggle("painelFinanceiro")}
            disabled={salvando}
            className={`px-3 py-1 rounded text-white ${
              config.painelFinanceiro ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            {config.painelFinanceiro ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Alterações são salvas imediatamente no sistema.
      </p>
    </div>
  );
}