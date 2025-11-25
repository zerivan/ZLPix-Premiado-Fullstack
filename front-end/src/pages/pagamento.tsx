// src/pages/pagamento.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import header from "../components/header";
import navbottom from "../components/navbottom";

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
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <Header />

      <main className="max-w-3xl mx-auto p-4 pb-32">
        {/* RESUMO DO PEDIDO */}
        <section className="mt-4 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-lg border border-white/10">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
            Resumo do Pedido
          </h2>

          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {order.title}
            </p>
            <p className="text-base font-semibold text-slate-700 dark:text-white">
              {order.qty} Bilhete
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
            <p className="text-base font-bold text-slate-800 dark:text-white">
              Total a pagar:
            </p>
            <p className="text-2xl font-extrabold text-primary">{order.total}</p>
          </div>
        </section>

        {/* TIMER */}
        <section className="mt-8 text-center">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            Este QR Code expira em:
          </h3>

          <div className="flex justify-center gap-4 py-5">
            {/* Minutos */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-md">
                <p className="text-2xl font-bold text-primary">{minutes}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Minutos
              </p>
            </div>

            <div className="text-primary text-3xl font-bold flex items-center">
              :
            </div>

            {/* Segundos */}
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-md">
                <p className="text-2xl font-bold text-primary">{seconds}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Segundos
              </p>
            </div>
          </div>
        </section>

        {/* QR CODE */}
        <section className="mt-4 flex justify-center">
          <div className="w-full max-w-[300px] overflow-hidden rounded-xl bg-white dark:bg-slate-900 p-4 shadow-lg">
            <img
              src={order.qrImage}
              className="w-full h-auto object-contain"
              alt="QR Code PIX"
            />
          </div>
        </section>

        {/* COPIAR CHAVE */}
        <section className="mt-4 px-2">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-3">
            Ou copie o código Pix e pague no seu app bancário
          </p>

          <div className="relative flex items-center rounded-xl bg-white dark:bg-slate-800 h-16 px-4 shadow-sm overflow-hidden">
            <p className="font-mono text-xs text-slate-700 dark:text-slate-200 truncate">
              {order.pixCopy}
            </p>
          </div>

          <div className="flex gap-3 px-4 mt-4">
            <button
              onClick={copyPix}
              className="flex flex-1 items-center justify-center h-14 rounded-full bg-primary text-white font-bold gap-2"
            >
              <span className="material-symbols-outlined">content_copy</span>
              Copiar Chave
            </button>

            <button
              onClick={() =>
                navigator.share?.({
                  title: order.title,
                  text: order.pixCopy,
                }).catch(() => {})
              }
              className="flex items-center justify-center h-14 rounded-full bg-zinc-200 dark:bg-slate-700 text-slate-700 dark:text-white px-6"
            >
              <span className="material-symbols-outlined">share</span>
              Compartilhar
            </button>
          </div>
        </section>

        {/* CONFIRMAÇÃO */}
        <section className="mt-10 text-center">
          <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-6 border border-dashed border-primary">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center rounded-full bg-primary text-white w-16 h-16">
                <span className="material-symbols-outlined text-4xl">
                  check_circle
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-primary">
              Pagamento Aprovado!
            </h2>

            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              Seu bilhete foi confirmado com sucesso.
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleConfirmPaid}
                className="px-6 py-2 rounded-full bg-white dark:bg-slate-800 text-primary font-semibold"
              >
                Ver Bilhete
              </button>

              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 rounded-full bg-white/80 dark:bg-slate-800 text-slate-900 dark:text-white"
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