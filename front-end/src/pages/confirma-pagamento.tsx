import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ConfirmarPagamento() {
  const navigate = useNavigate();
  const location = useLocation();

  // pegar dados da URL
  const params = new URLSearchParams(location.search);
  const bilhetesRaw = params.get("bilhetes") || "[]";
  const userId = params.get("userId");
  const valor = params.get("valor") || "0";
  const descricao = params.get("descricao") || "Pagamento de bilhetes";

  let bilhetes: string[] = [];
  try {
    bilhetes = JSON.parse(bilhetesRaw);
  } catch {
    bilhetes = [];
  }

  function pagar() {
    navigate(
      `/pagamento?${new URLSearchParams({
        bilhetes: bilhetesRaw,
        userId: String(userId),
        valor,
        descricao,
      }).toString()}`
    );
  }

  function cancelar() {
    navigate("/aposta");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white p-4">
      <h1 className="text-center text-xl font-bold text-yellow-300 mb-4">
        Confirmar Pagamento
      </h1>

      <div className="bg-blue-950/70 border border-blue-800/40 rounded-lg p-4 max-w-md mx-auto">
        <h2 className="text-yellow-300 font-bold mb-2">Bilhetes selecionados:</h2>

        {bilhetes.length === 0 ? (
          <p className="text-gray-300 text-sm">Nenhum bilhete recebido.</p>
        ) : (
          <ul className="space-y-2">
            {bilhetes.map((id) => (
              <li
                key={id}
                className="bg-blue-900/60 border border-blue-700/40 rounded px-2 py-1 text-sm"
              >
                Bilhete #{String(id).slice(-6)}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 text-sm text-gray-300">
          <p>
            <strong>Quantidade:</strong> {bilhetes.length}
          </p>
          <p>
            <strong>Valor total:</strong>{" "}
            <span className="text-green-400 font-bold">R$ {valor}</span>
          </p>
          <p className="mt-1">
            <strong>Descrição:</strong> {descricao}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={pagar}
            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-full font-bold shadow-lg"
          >
            ✅ Confirmar e Pagar
          </button>

          <button
            onClick={cancelar}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-full font-bold shadow-lg"
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}