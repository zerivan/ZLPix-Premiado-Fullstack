// src/pages/zlp.tsx

import NavBottom from "../components/navbottom";

export default function ZLP() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b1e5b] text-[#dbe5ff]">

      <main className="flex-grow pt-14 pb-24 px-6 max-w-lg mx-auto w-full">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <span className="material-symbols-outlined text-yellow-400 text-2xl">
              monetization_on
            </span>
            <h1 className="text-blue-200 font-bold uppercase tracking-[0.25em] text-xs">
              Suas Moedas ZLP
            </h1>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-extrabold text-yellow-300">
              1.350
            </span>
            <span className="text-xl font-bold text-yellow-400/80 tracking-widest uppercase">
              ZLP
            </span>
          </div>
        </div>

        {/* CARD */}
        <section className="relative rounded-2xl p-8 mb-8 overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl bg-white/5">

          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 to-blue-900/90"></div>

          <div className="relative z-10">

            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-semibold text-blue-100">
                Progresso para 1 bilhete
              </span>
              <span className="text-xl font-black text-white">
                1350 <span className="text-xs text-blue-200">/ 2000 ZLP</span>
              </span>
            </div>

            <div className="h-4 w-full bg-blue-950/60 rounded-full overflow-hidden border border-white/10">
              <div className="h-full w-[67.5%] bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 rounded-full"></div>
            </div>

            <p className="mt-6 text-center text-blue-100 text-sm">
              Faltam <span className="text-yellow-400 font-bold">650 ZLP</span> para 1 bilhete grátis.
            </p>

          </div>
        </section>

        {/* BOTÕES */}
        <div className="space-y-5">

          <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 p-5 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-white text-3xl">
              redeem
            </span>
            <span className="text-white font-black uppercase tracking-tight text-lg">
              Coletar moedas do dia
            </span>
          </button>

          <div className="flex flex-col gap-2">

            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-full flex items-center justify-center gap-3 opacity-90 active:scale-95 transition-all border border-white/10">
              <span className="material-symbols-outlined text-white text-2xl">
                confirmation_number
              </span>
              <span className="text-white font-bold uppercase tracking-widest text-sm">
                Resgatar Bilhete
              </span>
            </button>

            <div className="bg-blue-950/40 rounded-full py-2 text-center border border-white/10">
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-200">
                Necessário 2000 ZLP
              </span>
            </div>

          </div>
        </div>

      </main>

      {/* ✅ MENU PADRÃO DO SISTEMA */}
      <NavBottom />

    </div>
  );
}