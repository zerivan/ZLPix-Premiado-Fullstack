import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">

      {/* Header */}
      <header className="sticky top-0 z-10 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex items-center p-4 justify-between">
          <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">
            ZLPIX PREMIADO
          </h1>

          <div className="flex w-12 items-center justify-end">
            <button className="relative flex items-center justify-center rounded-full h-10 w-10 text-slate-900 dark:text-white">
              <span className="material-symbols-outlined text-2xl">notifications</span>

              <span className="absolute top-1 right-1.5 h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-4 pb-28">

        {/* SALDO */}
        <div className="my-6 p-4 rounded-xl bg-dark-blue/20 dark:bg-dark-blue/50 flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-[#9292c9] text-sm">Seu Saldo</p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold text-2xl">account_balance_wallet</span>
              <p className="text-slate-900 dark:text-white text-lg font-bold">R$ 12,50</p>
            </div>
          </div>

          <button className="px-5 h-10 flex items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
            Adicionar Saldo
          </button>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="flex flex-col items-center text-center rounded-xl bg-dark-blue p-6 shadow-lg">
          <p className="text-gold text-sm uppercase tracking-wider">Próximo Sorteio</p>
          <h2
            className="text-white text-5xl font-bold tracking-tight"
            style={{ textShadow: "0px 2px 8px rgba(255, 215, 0, 0.3)" }}
          >
            R$ 50.000
          </h2>
          <p className="text-slate-300 text-sm pt-2">Termina em:</p>
        </div>

        {/* TIMER */}
        <div className="flex gap-2 sm:gap-4 py-6">
          {[
            ["02", "Dias"],
            ["18", "Horas"],
            ["45", "Minutos"],
            ["33", "Segundos"],
          ].map(([value, label], i) => (
            <div key={i} className="flex grow basis-0 flex-col gap-2">
              <div className="h-16 sm:h-20 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-[#232348]">
                <p className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-bold">
                  {value}
                </p>
              </div>
              <p className="text-center text-slate-500 dark:text-white text-xs sm:text-sm">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* COMO FUNCIONA */}
        <div className="space-y-4">

          <h3 className="text-slate-900 dark:text-white text-lg font-bold">Como Funciona</h3>

          {[
            {
              title: "Como participar?",
              text: "Adicione saldo, escolha suas dezenas e confirme a aposta. Simples e rápido!"
            },
            {
              title: "Regulamento do sorteio",
              text: "Baseado na Loteria Federal. Pagamentos via PIX em até 24h após a apuração."
            },
            {
              title: "Perguntas Frequentes",
              text: "Encontre respostas sobre pagamentos, segurança, prêmios e muito mais."
            }
          ].map((item, index) => (
            <details
              key={index}
              className="group rounded-lg bg-slate-200/50 dark:bg-slate-800/50 p-4"
            >
              <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 dark:text-white">
                {item.title}
                <span className="transition group-open:rotate-180">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </summary>

              <p className="mt-4 text-slate-600 dark:text-slate-400">
                {item.text}
              </p>
            </details>
          ))}
        </div>
      </main>

      {/* NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/50 dark:border-slate-800/50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-md items-center justify-around px-4">

          <Link to="/" className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              home
            </span>
            <span className="text-xs font-bold">Início</span>
          </Link>

          <Link to="/bilhetes" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="text-xs font-medium">Bilhetes</span>
          </Link>

          <Link to="/resultados" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined">emoji_events</span>
            <span className="text-xs font-medium">Resultados</span>
          </Link>

          <Link to="/perfil" className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs font-medium">Perfil</span>
          </Link>

        </div>
      </nav>
    </div>
  );
}