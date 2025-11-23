import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  // redireciona automaticamente para home após 4 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // dezenas de exemplo (depois você substitui pelo valor real que virá do backend)
  const dezenas = ["08", "50", "32"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-background-light dark:bg-background-dark pb-8 pt-10 px-6 font-display">
      
      {/* Ícone de sucesso */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-28 h-28 rounded-full bg-green-500/20 mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-5xl">
              check
            </span>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white text-center mb-2">
          Pagamento Aprovado!
        </h1>

        {/* Subtexto */}
        <p className="text-zinc-600 dark:text-zinc-300 text-center text-base px-6">
          Boa sorte! Seu bilhete foi enviado para seu E-mail e WhatsApp.
        </p>
      </div>

      {/* Bilhete */}
      <div className="w-full max-w-sm mt-8">
        <div className="rounded-xl bg-white dark:bg-zinc-900 shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-zinc-700 dark:text-zinc-300 text-sm mb-3">
            Suas dezenas
          </h2>

          <div className="flex gap-4 mb-2">
            {dezenas.map((d, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold shadow-md"
              >
                {d}
              </div>
            ))}
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">Bilhete Gerado</p>
        </div>
      </div>

      {/* Info */}
      <div className="text-center px-6 mt-6">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Você será redirecionado automaticamente para a página inicial.
        </p>
      </div>

      {/* Botão de voltar manual (caso precise) */}
      <button
        onClick={() => navigate("/")}
        className="w-full max-w-sm h-14 rounded-full bg-green-500 text-white font-bold shadow-lg mt-6"
      >
        Voltar para o início agora
      </button>
    </div>
  );
}
