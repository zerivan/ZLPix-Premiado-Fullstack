import React, { useEffect, useState } from "react";
import axios from "axios";

type Saque = {
  id: number;
  valor: number;
  status: string;
  createdAt: string;
  userId: number;
  tipo: string;
  metadata?: {
    tipo?: string;
    pixKey?: string;
  };
};

type ExtratoItem = {
  id: number;
  valor: number;
  status: string;
  tipo: string;
  createdAt: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;

export default function AdminSaquesControl() {
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);
  const [extrato, setExtrato] = useState<ExtratoItem[]>([]);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [userSelecionado, setUserSelecionado] = useState<number | null>(null);
  const [erroExtrato, setErroExtrato] = useState<string | null>(null);
  const [loadingExtrato, setLoadingExtrato] = useState(false);

  useEffect(() => {
    carregarSaques();
  }, []);

  function getAdminHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async function carregarSaques() {
    try {
      setLoading(true);
      const headers = getAdminHeaders();
      if (!headers) {
        console.error("Token de admin não encontrado");
        setSaques([]);
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/admin/saques`, {
        headers,
      });

      setSaques(res.data || []);
      setErroExtrato(null);
    } catch (err) {
      console.error("Erro ao carregar saques:", err);
      setSaques([]);
      setErroExtrato("Erro ao carregar saques");
    } finally {
      setLoading(false);
    }
  }

  async function marcarComoPago(transacaoId: number) {
    try {
      const headers = getAdminHeaders();
      if (!headers) {
        alert("Token de admin ausente");
        return;
      }

      setProcessando(transacaoId);
      setErroExtrato(null);

      const response = await axios.post(
        `${BASE_URL}/api/admin/saques/${transacaoId}/pagar`,
        {},
        { headers }
      );

      if (response.data?.ok) {
        alert("Saque marcado como pago com sucesso!");
        await carregarSaques();
      } else {
        throw new Error("Resposta inesperada do servidor");
      }
    } catch (err: any) {
      const mensagem =
        err?.response?.data?.error || "Erro ao marcar saque como pago";
      console.error("Erro ao marcar saque como pago:", err);
      alert(mensagem);
      setErroExtrato(mensagem);
    } finally {
      setProcessando(null);
    }
  }

  async function carregarExtrato(userId: number) {
    try {
      setUserSelecionado(userId);
      setLoadingExtrato(true);
      setErroExtrato(null);

      const userHeaders = {
        "x-user-id": String(userId),
      };

      const [saldoRes, histRes] = await Promise.all([
        axios.get(`${BASE_URL}/wallet/saldo`, {
          headers: userHeaders,
        }),
        axios.get(`${BASE_URL}/wallet/historico`, {
          headers: userHeaders,
        }),
      ]);

      const saldoValue = saldoRes.data?.saldo ?? 0;
      const extratoData = (histRes.data || []) as ExtratoItem[];

      setSaldo(saldoValue);
      setExtrato(extratoData);
    } catch (err: any) {
      console.error("Erro extrato:", err);
      const mensagem =
        err?.response?.data?.error || "Erro ao carregar extrato do usuário";
      setErroExtrato(mensagem);
      setExtrato([]);
      setSaldo(null);
    } finally {
      setLoadingExtrato(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">💸 Saques</h2>

      <p className="text-sm text-gray-600">
        Lista de solicitações de saque. Após pagamento manual via PIX, marque
        como pago.
      </p>

      {erroExtrato && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ⚠️ {erroExtrato}
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-500">⏳ Carregando saques...</p>
      )}

      {!loading && saques.length === 0 && (
        <p className="text-sm text-gray-500">
          ✅ Nenhuma solicitação de saque encontrada.
        </p>
      )}

      {!loading && saques.length > 0 && (
        <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 font-semibold">
          📊 Total de saques pendentes: {saques.length}
        </div>
      )}

      <div className="space-y-3">
        {saques.map((s) => (
          <div
            key={s.id}
            className="border border-gray-300 rounded p-4 bg-gray-50 hover:bg-gray-100 transition space-y-3"
          >
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">
                    ID: {s.id} | Usuário: {s.userId}
                  </p>
                  <p className="text-gray-600">
                    <strong>Valor:</strong> R$ {Number(s.valor).toFixed(2)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    s.status === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {s.status === "pending" ? "⏳ Pendente" : "✅ Pago"}
                </span>
              </div>

              <p className="text-gray-700">
                <strong>PIX Key:</strong>{" "}
                {s.metadata?.pixKey ? (
                  <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                    {s.metadata.pixKey}
                  </span>
                ) : (
                  <span className="text-gray-500">Não informado</span>
                )}
              </p>

              <p className="text-xs text-gray-500">
                🕐 {new Date(s.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => carregarExtrato(s.userId)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition"
              >
                👁️ Ver Extrato
              </button>

              {s.status === "pending" && (
                <button
                  onClick={() => marcarComoPago(s.id)}
                  disabled={processando === s.id}
                  className={`px-4 py-2 text-white text-xs rounded font-bold transition ${
                    processando === s.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {processando === s.id ? "⏳ Processando..." : "✅ Marcar como PAGO"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {userSelecionado && (
        <div className="border border-blue-300 rounded p-4 bg-blue-50 space-y-3 mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm font-bold text-gray-900">
              📋 Extrato do Usuário #{userSelecionado}
            </div>
            <button
              onClick={() => {
                setUserSelecionado(null);
                setExtrato([]);
                setSaldo(null);
                setErroExtrato(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 font-semibold"
            >
              ✕ Fechar
            </button>
          </div>

          {loadingExtrato ? (
            <div className="text-center py-4 text-sm text-gray-600">
              ⏳ Carregando extrato...
            </div>
          ) : (
            <>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="text-sm">
                  💰 <strong>Saldo Atual:</strong>{" "}
                  <span className="text-lg font-bold text-green-600">
                    R$ {Number(saldo || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {extrato.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">
                  ℹ️ Nenhuma transação encontrada
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    📊 Últimas transações:
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {extrato.map((t) => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center border border-gray-200 rounded px-3 py-2 bg-white hover:bg-gray-50 transition text-xs"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {t.tipo}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {new Date(t.createdAt).toLocaleString("pt-BR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            R$ {Number(t.valor).toFixed(2)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded font-semibold ${
                              t.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : t.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {t.status === "paid"
                              ? "✅ Pago"
                              : t.status === "approved"
                              ? "✅ Aprovado"
                              : "⏳ Pendente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}