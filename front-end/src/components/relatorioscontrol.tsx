import { useEffect, useState } from "react";
import { api } from "../api/client";

type Relatorio = {
  totalUsuarios: number;
  totalBilhetes: number;
  totalTransacoes: number;
  totalArrecadado: number;
  totalPago: number;
  ultimaTransacao?: {
    valor: number;
    createdAt: string;
    status: string;
  };
};

export default function RelatoriosControl() {
  const [data, setData] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadRelatorios() {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/relatorios");

      if (res.data?.ok) {
        setData(res.data.data);
      }
    } catch {
      setErro("Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRelatorios();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando relatórios...
      </div>
    );
  }

  if (erro) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Relatórios</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="border rounded p-3">
          <strong>Usuários</strong>
          <div>{data.totalUsuarios}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Apostas</strong>
          <div>{data.totalBilhetes}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Transações</strong>
          <div>{data.totalTransacoes}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Total arrecadado</strong>
          <div>R$ {data.totalArrecadado.toFixed(2)}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Total pago</strong>
          <div>R$ {data.totalPago.toFixed(2)}</div>
        </div>
      </div>

      {data.ultimaTransacao && (
        <div className="text-xs text-gray-500 border rounded p-3">
          Última transação: R$ {data.ultimaTransacao.valor.toFixed(2)} —{" "}
          {new Date(data.ultimaTransacao.createdAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}