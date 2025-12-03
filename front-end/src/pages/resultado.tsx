import React from "react";
import { useNavigate } from "react-router-dom";
import header from "../components/header";
import navbottom from "../components/navbottom";

export default function resultados() {
  const navigate = useNavigate();

  return (
    <div className="font-display bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 min-h-screen flex flex-col text-white">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-blue-950/60 backdrop-blur-md p-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <span className="material-symbols-outlined text-2xl text-yellow-300">
            arrow_back
          </span>
        </button>

        <h1 className="flex-1 text-center text-lg font-bold text-yellow-300">
          Resultados dos Sorteios
        </h1>

        {/* placeholder */}
        <div className="h-10 w-10" />
      </header>

      {/* Conteúdo */}
      <main className="flex-1 px-4 pb-28 max-w-4xl mx-auto w-full">
        <section className="py-4 space-y-5">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white/10 p-4 border border-yellow-400/10 shadow-lg">
            <p className="text-lg font-semibold text-yellow-300 mb-1">
              Sorteio Especial de Aniversário 🎉
            </p>
            <p className="text-sm text-blue-100 mb-3">#5678 — 24/05/2024</p>

            <div className="flex justify-center gap-2 mb-4">
              {["05", "15", "25", "35", "50"].map((n) => (
                <span
                  key={n}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-blue-900 font-bold"
                >
                  {n}
                </span>
              ))}
            </div>

            <div className="bg-yellow-100/10 rounded-xl p-3 border border-yellow-400/20">
              <p className="text-sm text-yellow-300 mb-1 font-semibold">
                Ganhadores
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Carlos R. (...54321)</span>
                  <span className="font-bold text-yellow-400">R$ 50.000,00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white">Maria S. (...98765)</span>
                  <span className="font-bold text-yellow-400">R$ 1.000,00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white/10 p-4 border border-yellow-400/10 shadow-lg">
            <p className="text-lg font-semibold text-yellow-300 mb-1">
              Sorteio Semanal 🍀
            </p>
            <p className="text-sm text-blue-100 mb-3">#1234 — 15/05/2024</p>

            <div className="flex justify-center gap-2 mb-4">
              {["23", "45", "67", "89", "10"].map((n) => (
                <span
                  key={n}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-blue-900 font-bold"
                >
                  {n}
                </span>
              ))}
            </div>

            <div className="bg-yellow-100/10 rounded-xl p-3 border border-yellow-400/20">
              <p className="text-sm text-yellow-300 mb-1 font-semibold">
                Ganhador Principal
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-white">João P. (...11223)</span>
                <span className="font-bold text-yellow-400">R$ 10.000,00</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Botão fixo */}
      <div className="fixed bottom-20 left-0 right-0 p-4">
        <div className="mx-auto max-w-lg">
          <button
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-yellow-400 text-base font-bold text-blue-900 shadow-lg hover:bg-yellow-300 transition"
            onClick={() => navigate("/meus-bilhetes")}
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="truncate">Ver meus bilhetes</span>
          </button>
        </div>
      </div>

      {/* Menu inferior */}
      <navbottom />
    </div>
  );
}