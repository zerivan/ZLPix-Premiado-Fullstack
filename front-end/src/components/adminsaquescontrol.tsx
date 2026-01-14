import React, { useEffect, useState } from "react";
import { api } from "../api/client";

type Saque = {
  id: number;
  valor: number;
  status: string;
  createdAt: string;
  metadata?: {
    tipo?: string;
    pixKey?: string;
  };
};

export default function AdminSaquesControl() {
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);

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
      const headers = getAdminHeaders();
      if (!headers) {
        console.warn("TOKEN_ZLPIX_ADMIN ausente");
        setSaques([]);
        return;
      }

      const res = await api.get("/api/admin/saques", {
        headers,
      });

      const todos = res.data || [];

      const somenteSaques = todos.filter(
        (t: Saque) => t.metadata?.tipo === "saque"
      );

      setSaques(somenteSaques);
    } catch (err) {
      console.error("Erro ao carregar saques:", err);
      setSaques([]);
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

      await api.post(
        "/api/admin/saques/pagar",
        { transacaoId },
        { headers }
      );

      await carregarSaques();
    } catch (err) {
      alert("Erro ao marcar saque como pago");
    } finally {
      setProcessando(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        💸 Saques
      </h2>

      <p className="text-sm text-gray-600">
        Lista de solicitações de saque. Após pagamento manual via PIX, marque
        como pago.
      </p>

      {loading && (
        <p className="text-sm text-gray-500">Carregando saques...</p>
      )}

      {!loading && saques.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhuma solicitação de saque encontrada.
        </p>
      )}

      <div className="space-y-3">
        {saques.map((s) => (
          <div
            key={s.id}
            className="border rounded p-3 bg-gray-50 flex justify-between items-center"
          >
            <div className="text-sm space-y-1">
              <p>
                <strong>Valor:</strong> R$ {Number(s.valor).toFixed(2)}
              </p>
              <p>
                <strong>PIX:</strong>{" "}
                {s.metadata?.pixKey || "Não informado"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {s.status === "pending" ? "Pendente" : "Pago"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(s.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>

            {s.status === "pending" && (
              <button
                onClick={() => marcarComoPago(s.id)}
                disabled={processando === s.id}
                className="px-3 py-2 rounded bg-green-600 text-white text-sm font-bold disabled:opacity-50"
              >
                {processando === s.id ? "Processando..." : "Marcar como PAGO"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}