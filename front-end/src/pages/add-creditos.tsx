import React, { useState } from "react";
import { motion } from "framer-motion";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

export default function AddCreditos() {
  const [valor, setValor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔑 PIX GERADO
  const [pixData, setPixData] = useState<{
    qr_code_base64?: string;
    copy_paste?: string;
  } | null>(null);

  const valoresRapidos = [10, 20, 50, 100];

  function selecionarValor(v: number) {
    setValor(v);
  }

  async function gerarPix() {
    if (!valor || valor <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const userId = localStorage.getItem("USER_ID");
    if (!userId) {
      alert("Usuário não identificado.");
      return;
    }

    try {
      setLoading(true);
      setPixData(null);

      // ✅ PIX EXCLUSIVO DA CARTEIRA
      const res = await api.post(
        "/wallet/depositar",
        { valor },
        { headers: { "x-user-id": userId } }
      );

      setPixData(res.data);
    } catch (e) {
      console.error("Erro ao gerar PIX:", e);
      alert("Não foi possível gerar o PIX. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display flex flex-col pb-24">
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300 drop-shadow">
          ➕ Adicionar Créditos
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Escolha um valor para depositar
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8 space-y-8">
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {valoresRapidos.map((v) => (
            <motion.button
              key={v}
              whileTap={{ scale: 0.93 }}
              onClick={() => selecionarValor(v)}
              className={`py-4 rounded-2xl border text-lg font-bold shadow-md ${
                valor === v
                  ? "bg-yellow-400 text-blue-900 border-yellow-300"
                  : "bg-white/10 text-yellow-300 border-white/20"
              }`}
            >
              R$ {v}
            </motion.button>
          ))}
        </div>

        <div className="w-full max-w-md">
          <input
            type="number"
            value={valor ?? ""}
            onChange={(e) => setValor(Number(e.target.value))}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white"
            placeholder="Digite um valor"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={gerarPix}
          disabled={loading}
          className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-blue-900 font-extrabold text-lg shadow-xl"
        >
          {loading ? "Gerando PIX..." : "⚡ GERAR PIX"}
        </motion.button>

        {/* ===================== */}
        {/* 🔲 PIX GERADO */}
        {/* ===================== */}
        {pixData && (
          <div className="bg-black/50 p-6 rounded-2xl w-full max-w-md space-y-4 text-center">
            <h3 className="text-lg font-bold text-yellow-300">
              Pague com PIX
            </h3>

            {pixData.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                alt="QR Code PIX"
                className="mx-auto w-48 h-48 bg-white p-2 rounded"
              />
            )}

            {pixData.copy_paste && (
              <textarea
                readOnly
                value={pixData.copy_paste}
                className="w-full p-2 rounded text-xs text-black"
              />
            )}

            <p className="text-xs text-blue-100">
              Após o pagamento, o saldo será liberado automaticamente.
            </p>
          </div>
        )}
      </main>

      <NavBottom />
    </div>
  );
}