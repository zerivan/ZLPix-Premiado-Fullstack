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

  useEffect(() => {
    carregarSaques();
  }, []);

  async function carregarSaques() {
    try {
      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await api.get("/wallet/transacoes", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        💸 Saques
      </h2>

      <p className="text-sm text-gray-600">
        Lista de solicitações de saque feitas pelos usuários.
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
            className="border rounded p-3 flex justify-between items-center bg-gray-50"
          >
            <div className="text-sm">
              <p>
                <strong>Valor:</strong> R$ {Number(s.valor).toFixed(2)}
              </p>
              <p>
                <strong>PIX:</strong>{" "}
                {s.metadata?.pixKey || "Não informado"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {s.status === "pending" ? "Pendente" : s.status}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(s.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}