import { useEffect, useState } from "react";

type ConfiguracoesAdmin = {
  modoManutencao: boolean;
  diagnosticoIA: boolean;
  painelFinanceiro: boolean;
};

export default function ConfiguracoesControl() {
  const [config, setConfig] = useState<ConfiguracoesAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação (depois vem do backend)
    setConfig({
      modoManutencao: false,
      diagnosticoIA: true,
      painelFinanceiro: false
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando...</div>;
  }

  if (!config) {
    return <div className="text-sm text-red-500">Configuração indisponível</div>;
  }

  return (
    <div className="relative z-10 space-y-4">
      <h2 className="text-lg font-semibold">Configurações do Sistema</h2>

      <div className="text-sm text-gray-700 space-y-1">
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