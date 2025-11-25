// src/pages/resultados.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import NavBottom from "../components/navbottom";

export default function Resultados() {
  const navigate = useNavigate();

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
      <Header />

      {/* Top App Bar (local) */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 p-4 pb-2 backdrop-blur-sm dark:bg-background-dark/80">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 dark:text-white"
        >
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>

        <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          Resultados dos Sorteios
        </h1>

        {/* placeholder para balancear o layout */}
        <div className="h-10 w-10" />
      </header>

      <main className="flex-1 px-4 pb-28 max-w-4xl mx-auto w-full">
        {/* Search and Filter Bar */}
        <div className="py-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <label className="flex h-12 flex-1 flex-col">
              <div className="flex h-full w-full items-stretch rounded-full">
                <div className="flex items-center justify-center rounded-l-full border border-r-0 border-slate-300 bg-slate-200/50 pl-4 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="form-input h-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full border border-l-0 border-slate-300 bg-slate-50 px-4 text-base font-normal leading-normal text-slate-900 placeholder:text-slate-500 focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400"
                  placeholder="Buscar por nº do sorteio"
                  aria-label="Buscar sorteio"
                />
              </div>
            </label>

            <button
              className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-300 bg-slate-50 px-4 pr-3 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">calendar_month</span>
              <span className="text-sm font-medium leading-normal">Filtrar por data</span>
              <span className="material-symbols-outlined text-2xl">arrow_drop_down</span>
            </button>
          </div>
        </div>

        {/* Sorteio Card List */}
        <div className="flex flex-col gap-4">
          {/* Card 1 */}
          <article className="flex flex-col items-stretch justify-start gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900/70">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold leading-tight tracking-tight text-primary dark:text-sky-400">
                  Sorteio Especial de Aniversário
                </p>
                <p className="text-sm font-normal leading-normal text-slate-500 dark:text-slate-400">
                  Sorteio #5678 - 24 de Maio de 2024
                </p>
              </div>
              <button className="text-slate-400 dark:text-slate-500" aria-label="Opções">
                <span className="material-symbols-outlined text-2xl">more_vert</span>
              </button>
            </div>

            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Números da Sorte</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["05", "15", "25", "35", "50"].map((n) => (
                  <span
                    key={n}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/10">
              <p className="mb-2 text-sm font-medium text-amber-800 dark:text-success">Ganhadores</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-amber-600 dark:text-success">emoji_events</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">Carlos R.</span>
                    <span className="text-slate-500 dark:text-slate-400">(...54321)</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">R$ 50.000,00</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-amber-600 dark:text-success">emoji_events</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">Maria S.</span>
                    <span className="text-slate-500 dark:text-slate-400">(...98765)</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">R$ 1.000,00</span>
                </div>
              </div>
            </div>

            <button className="mt-2 flex h-10 w-full items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <span className="truncate">Ver todos os 15 ganhadores</span>
            </button>
          </article>

          {/* Card 2 */}
          <article className="flex flex-col items-stretch justify-start gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900/70">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold leading-tight tracking-tight text-primary dark:text-sky-400">Sorteio Semanal</p>
                <p className="text-sm font-normal leading-normal text-slate-500 dark:text-slate-400">Sorteio #1234 - 15 de Maio de 2024</p>
              </div>
              <button className="text-slate-400 dark:text-slate-500" aria-label="Opções">
                <span className="material-symbols-outlined text-2xl">more_vert</span>
              </button>
            </div>

            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Números da Sorte</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["23", "45", "67", "89", "10"].map((n) => (
                  <span key={n} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/10">
              <p className="mb-2 text-sm font-medium text-amber-800 dark:text-success">Ganhador Principal</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-amber-600 dark:text-success">emoji_events</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">João P.</span>
                    <span className="text-slate-500 dark:text-slate-400">(...11223)</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">R$ 10.000,00</span>
                </div>
              </div>
            </div>
          </article>

          {/* Empty State Example */}
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-600">search_off</span>
            <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Nenhum resultado encontrado</p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Tente ajustar seus filtros de busca ou procure por outro número de sorteio.</p>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="mx-auto max-w-lg">
          <button
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-white shadow-lg shadow-primary/30"
            onClick={() => navigate("/meus-bilhetes")}
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="truncate">Ver meus bilhetes</span>
          </button>
        </div>
      </div>

      <NavBottom />
    </div>
  );
}