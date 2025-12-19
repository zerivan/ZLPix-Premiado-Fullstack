import { useEffect, useState } from "react";

type ConfiguracoesAdmin = {
  modoManutencao: boolean;
  diagnosticoIA: boolean;
  painelFinanceiro: boolean;
};

export default function ConfiguracoesControl() {
  const [config, setConfig] = useState<ConfiguracoesAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * 🔗 Carrega configurações do sistema
   * (por enquanto mockado — estrutura pronta para backend)
   */
  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      setErro(null);

      // 🔒 MOCK CONTROLADO (igual fizemos na IA)
      // depois isso vira fetch real
      setConfig({
        modoManutencao: false,
        diagnosticoIA: true,
        painelFinanceiro: false
      });
    } catch (e: any) {
      setErro("Falha ao carregar configurações do sistema");
      setConfig(null);
    } finally {
      setLoading(false);
    }
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

  if (erro) {
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

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span><strong>Modo manutenção</strong></span>
          <span
            className={
              config.modoManutencao ? "text-green-600" : "text-gray-500"
            }
          >
            {config.modoManutencao ? "Ativo" : "Desativado"}
          </span>
        </div>

        <div className="flex justify-between">
          <span><strong>Diagnóstico com IA</strong></span>
          <span
            className={
              config.diagnosticoIA ? "text-green-600" : "text-gray-500"
            }
          >
            {config.diagnosticoIA ? "Ativo" : "Desativado"}
          </span>
        </div>

        <div className="flex justify-between">
          <span><strong>Painel financeiro</strong></span>
          <span
            className={
              config.painelFinanceiro ? "text-green-600" : "text-gray-500"
            }
          >
            {config.painelFinanceiro ? "Ativo" : "Desativado"}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Este módulo é controlado pelo painel administrativo e pelas regras
        globais do sistema.
      </p>
    </div>
  );
}