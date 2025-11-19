import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const [time, setTime] = useState({
    dias: 2,
    horas: 18,
    minutos: 45,
    segundos: 33,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => {
        let { dias, horas, minutos, segundos } = t;

        segundos--;
        if (segundos < 0) {
          segundos = 59;
          minutos--;
          if (minutos < 0) {
            minutos = 59;
            horas--;
            if (horas < 0) {
              horas = 23;
              dias = Math.max(0, dias - 1);
            }
          }
        }

        return { dias, horas, minutos, segundos };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col w-full">

      {/* HEADER */}
      <header className="sticky top-0 z-10 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center p-4 justify-between">
          <h1 className="text-slate-900 dark:text-white text-xl font-bold">
            ZLPIX PREMIADO
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold text-2xl">
                account_balance_wallet
              </span>
              <p className="text-slate-900 dark:text-white font-bold">R$ 12,50</p>
            </div>

            <button className="relative flex items-center justify-center p-2 text-slate-900 dark:text-white">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 px-4 pb-28">
        <div className="max-w-3xl mx-auto">

          {/* SALDO */}
          <div className="my-6">
            <div className="flex flex-col sm:flex-row items-stretch gap-4 bg-dark-blue/20 dark:bg-dark-blue/50 p-4 rounded-xl">
              <div className="flex-1">
                <p className="text-slate-500 dark:text-[#9292c9] text-sm">Seu Saldo</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold text-2xl">
                    account_balance_wallet
                  </span>
                  <p className="text-slate-900 dark:text-white text-lg font-bold">
                    R$ 12,50
                  </p>
                </div>
              </div>
              <div className="flex items-end">
                <button className="min-w-[120px] h-10 px-4 rounded-full bg-primary text-white font-medium">
                  Adicionar Saldo
                </button>
              </div>
            </div>
          </div>

          {/* PRÓXIMO SORTEIO */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-dark-blue p-6 text-center shadow-lg mb-6">
            <p className="text-gold text-sm font-medium uppercase tracking-wider">
              Próximo Sorteio
            </p>
            <h2 className="text-white text-5xl font-bold leading-tight mt-2">
              R$ 50.000
            </h2>
            <p className="text-slate-300 text-sm mt-2">Termina em:</p>
          </div>

          {/* TIMER */}
          <div className="flex gap-2 sm:gap-4 py-4">
            {[
              { label: "Dias", value: time.dias },
              { label: "Horas", value: time.horas },
              { label: "Minutos", value: time.minutos },
              { label: "Segundos", value: time.segundos },
            ].map((t) => (
              <div key={t.label} className="flex grow basis-0 flex-col items-stretch gap-2">
                <div className="flex h-16 sm:h-20 items-center justify-center rounded-lg bg-slate-200 dark:bg-[#232348]">
                  <p className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-bold">
                    {String(t.value).padStart(2, "0")}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-slate-500 dark:text-white text-xs sm:text-sm">
                    {t.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* COMO FUNCIONA */}
          <div className="space-y-4">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold">
              Como Funciona
            </h3>

            <details className="group rounded-lg bg-slate-200/50 dark:bg-slate-800/50 p-4" open>
              <summary className="flex items-center justify-between cursor-pointer text-base font-medium text-slate-900 dark:text-white">
                Como participar?
                <span className="transition group-open:rotate-180">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </summary>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Adicione saldo, escolha seus números e confirme a aposta.
              </p>
            </details>

            <details className="group rounded-lg bg-slate-200/50 dark:bg-slate-800/50 p-4">
              <summary className="flex items-center justify-between cursor-pointer text-base font-medium text-slate-900 dark:text-white">
                Regulamento do sorteio
                <span className="transition group-open:rotate-180">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </summary>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                O sorteio é baseado na Loteria Federal. Prêmios pagos via PIX.
              </p>
            </details>

            <details className="group rounded-lg bg-slate-200/50 dark:bg-slate-800/50 p-4">
              <summary className="flex items-center justify-between cursor-pointer text-base font-medium text-slate-900 dark:text-white">
                Perguntas Frequentes
                <span className="transition group-open:rotate-180">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </summary>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Dúvidas? Veja perguntas frequentes.
              </p>
            </details>
          </div>
        </div>
      </main>

      {/* NAV BOTTOM */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/50 dark:border-slate-800/50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-md items-center justify-around px-4">

          <Link className="flex flex-col items-center justify-center gap-1 text-primary" to="/home">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="text-xs font-bold">Início</span>
          </Link>

          <Link className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary" to="/sorteio">
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="text-xs font-medium">Aposta</span>
          </Link>

          <Link className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary" to="/bilhetes">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-xs font-medium">Bilhetes</span>
          </Link>

          <Link className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary" to="/resultado">
            <span className="material-symbols-outlined">emoji_events</span>
            <span className="text-xs font-medium">Resultados</span>
          </Link>

          <Link className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary" to="/perfil">
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs font-medium">Perfil</span>
          </Link>

        </div>
      </nav>
    </div>
  );
}