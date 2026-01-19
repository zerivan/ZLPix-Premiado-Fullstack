import { useEffect, useState } from "react";
import axios from "axios";

type Relatorio = {
  totalUsuarios: number;
  totalBilhetesPagos: number;
  totalTransacoes: number;
  arrecadadoBilhetes: number;
  totalPremiosPagos: number;
  ultimaTransacao?: {
    valor: number;
    createdAt: string;
    status: string;
  } | null;
};

export default function AdminRelatoriosControl() {
  const [data, setData] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadRelatorios() {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await axios.get(
        "https://zlpix-premiado-fullstack.onrender.com/api/admin/relatorios",
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      if (res.data?.ok && res.data.data) {
        setData(res.data.data);
      } else {
        setErro("Resposta inválida do servidor.");
      }
    } catch (err) {
      console.error(err);
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

  if (!data) {
    return (
      <div className="text-sm text-gray-500">
        Nenhum dado disponível no momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Relatórios</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="border rounded p-3">
          <strong>Usuários</strong>
          <div>{data.totalUsuarios}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Apostas pagas</strong>
          <div>{data.totalBilhetesPagos}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Transações</strong>
          <div>{data.totalTransacoes}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Arrecadado (bilhetes)</strong>
          <div>R$ {data.arrecadadoBilhetes.toFixed(2)}</div>
        </div>

        <div className="border rounded p-3">
          <strong>Prêmios pagos</strong>
          <div>R$ {data.totalPremiosPagos.toFixed(2)}</div>
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