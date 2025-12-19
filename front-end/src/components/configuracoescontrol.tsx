import { useEffect, useState } from "react";

/**
 * Componente CONTROLADOR de Configurações do Admin
 *
 * - NÃO é página
 * - NÃO é rota
 * - NÃO acessa banco direto
 * - Recebe regras (props ou estado carregado pelo painel)
 * - Controla comportamento do sistema
 */

type ConfiguracoesAdmin = {
  modoManutencao: boolean;
  diagnosticoIA: boolean;
  painelFinanceiro: boolean;
};

export default function ConfiguracoesControl() {
  const [config, setConfig] = useState<ConfiguracoesAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ SIMULAÇÃO — depois isso vem do backend
  useEffect(() => {
    // Por enquanto NÃO chama API
    // Serve só para provar renderização e arquitetura
    setConfig({
      modoManutencao: false,
      diagnosticoIA: true,
      painelFinanceiro: false,
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  if (!config) {
    return <div>Configurações indisponíveis</div>;
  }

  return (
    <div className="w-full rounded-xl border bg-white p-4 space-y-4">
      <h2 className="text-lg font-semibold">Configurações do Sistema</h2>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Modo manutenção:</strong>{" "}
          {config.modoManutencao ? "Ativo" : "Desativado"}
        </div>

        <div>
          <strong>Diagnóstico com IA:</strong>{" "}
          {config.diagnosticoIA ? "Ativo" : "Desativado"}
        </div>

        <div>
          <strong>Painel financeiro:</strong>{" "}
          {config.painelFinanceiro ? "Ativo" : "Desativado"}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Este componente é controlado pelo painel admin e pelas regras do sistema.
      </p>
    </div>
  );
}