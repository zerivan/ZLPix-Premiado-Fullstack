// src/pages/pagamento.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import NavBottom from "../components/navbottom";

export default function PagamentoPix() {
  const navigate = useNavigate();

  // Exemplo de pedido
  const order = useMemo(
    () => ({
      title: "Bilhete ZLPIX PREMIADO",
      qty: 1,
      total: "R$ 2,00",
      pixCopy: "00020126BR.GOV.BCB.PIX...00000000000000000000000000",
      qrImage: "https://via.placeholder.com/280.png?text=QR+Code+PIX",
    }),
    []
  );

  // Timer 10 minutos
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(order.pixCopy);
      alert("Chave Pix copiada!");
    } catch {
      alert(
        "Não foi possível copiar automaticamente. Copie manualmente:\n\n" +
          order.pixCopy
      );
    }
  }

  function handleConfirmPaid() {
    navigate("/payment-success");
  }

  return (
    <div className="min-h-screen bg-[#0b1221] text-white font-display flex flex-col">
      {/* 🌈 Cabeçalho azul-verde */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-green-600 py-3 shadow-md border-b border-green-500/30">
        <h1 className="text-center text-lg font-extrabold text-yellow-300 drop-shadow-sm">
          Pagamento via PIX 💸
        </h1>
        <p className="text-center text-sm text-blue-100 mt-1">
          Complete o pagamento para confirmar seu bilhete
        </p>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-28">
        {/* RESUMO DO PEDIDO */}
        <section className="mt-4 rounded-xl bg-[#111a2e] p-5 shadow-lg border border-green-400/20">
          <h2 className="text-sm font-medium text-yellow-300 mb-3">
            Resumo do Pedido
          </h2>

          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-white">
              {order.title}
            </p>
            <p className="text-base font-semibold text-yellow-300">
              {order.qty} Bilhete
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-800 flex items-center justify-between">
            <p className="text-base font-bold text-white">Total a pagar:</p>
            <p className="text-2xl font-extrabold text-green-400">{order.total}</p>
          </div>
        </section>

        {/* TIMER */}
        <section className="mt-8 text-center">
          <h3 className="text-base font-semibold text-yellow-300">
            Este QR Code expira em:
          </h3>

          <div className="flex justify-center gap-4 py-5">
            {/* Minutos */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#1c2433] shadow-inner">
                <p className="text-2xl font-bold text-yellow-300">{minutes}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">Minutos</p>
            </div>

            <div className="text-yellow-300 text-3xl font-bold flex items-center">
              :
            </div>

            {/* Segundos */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#1c2433] shadow-inner">
                <p className="text-2xl font-bold text-yellow-300">{seconds}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">Segundos</p>
            </div>
          </div>
        </section>

        {/* QR CODE */}
        <section className="mt-4 flex justify-center">
          <div className="w-full max-w-[300px] overflow-hidden rounded-xl bg-[#111a2e] p-4 shadow-lg border border-green-400/20">
            <img
              src={order.qrImage}
              className="w-full h-auto object-contain rounded-md"
              alt="QR Code PIX"
            />
          </div>
        </section>

        {/* COPIAR CHAVE */}
        <section className="mt-6 px-2">
          <p className="text-center text-sm text-gray-300 mb-3">
            Ou copie o código Pix e pague no seu app bancário
          </p>

          <div className="relative flex items-center rounded-xl bg-[#1c2433] h-16 px-4 shadow-inner overflow-hidden border border-blue-700/30">
            <p className="font-mono text-xs text-yellow-200 truncate">
              {order.pixCopy}
            </p>
          </div>

          <div className="flex gap-3 px-4 mt-4">
            <button
              onClick={copyPix}
              className="flex flex-1 items-center justify-center h-14 rounded-full bg-yellow-400 text-blue-900 font-bold gap-2 shadow-md"
            >
              Copiar Chave
            </button>

            <button
              onClick={() =>
                navigator.share?.({
                  title: order.title,
                  text: order.pixCopy,
                }).catch(() => {})
              }
              className="flex items-center justify-center h-14 rounded-full bg-blue-700 text-white px-6 shadow-md"
            >
              Compartilhar
            </button>
          </div>
        </section>

        {/* CONFIRMAÇÃO */}
        <section className="mt-10 text-center">
          <div className="rounded-xl bg-[#0e182d] p-6 border border-dashed border-yellow-400/40">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center rounded-full bg-green-500 text-white w-16 h-16 shadow-lg">
                <span className="material-symbols-outlined text-4xl">
                  check_circle
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-yellow-300">
              Pagamento Aprovado!
            </h2>

            <p className="mt-2 text-sm text-gray-300">
              Seu bilhete foi confirmado com sucesso.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleConfirmPaid}
                className="px-6 py-2 rounded-full bg-green-500 text-white font-semibold shadow-md"
              >
                Ver Bilhete
              </button>

              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 rounded-full bg-blue-700 text-white shadow-md"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </section>
      </main>

      <NavBottom />
    </div>
  );
}