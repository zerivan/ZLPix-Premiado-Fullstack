import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import header from "../components/header";
import navbottom from "../components/navbottom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  // Redireciona automaticamente para home após 4s
  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // dezenas de exemplo
  const dezenas = ["08", "50", "32"];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-md px-6 pt-10 pb-32">

        {/* Ícone */}
        <div className="flex flex-col items-center">

          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-green-500/20 mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-600/40">
              <span className="material-symbols-outlined text-5xl text-white">
                check
              </span>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white text-center">
            Pagamento Aprovado!
          </h1>

          <p className="text-zinc-600 dark:text-zinc-300 text-center mt-2">
            Seu bilhete foi enviado para seu E-mail e WhatsApp. Boa sorte! 🍀
          </p>
        </div>

        {/* CARD DO BILHETE */}
        <div className="w-full mt-10 flex justify-center">
          <div className="rounded-xl bg-white dark:bg-zinc-900 shadow-xl p-6 flex flex-col items-center border border-green-500/30 w-full">

            <h2 className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
              Suas dezenas sorteadas
            </h2>

            <div className="flex gap-4 mb-3">
              {dezenas.map((d, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-green-600/40 animate-[pop_0.25s_ease-out]"
                >
                  {d}
                </div>
              ))}
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Bilhete Gerado e Confirmado ✔
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="text-center px-6 mt-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Você será redirecionado automaticamente para a página inicial.
          </p>
        </div>

        {/* Botão manual */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full h-14 rounded-full bg-primary text-white font-bold shadow-md shadow-primary/40"
        >
          Voltar para o início agora
        </button>
      </main>

      <NavBottom />

      {/* Animação local */}
      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.4); opacity: 0 }
          100% { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}