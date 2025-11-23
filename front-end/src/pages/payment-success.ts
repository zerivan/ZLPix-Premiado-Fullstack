// src/pages/payment-success.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface PaymentSuccessProps {
  numbers?: string[]; // ex.: ["85","03","27"]
}

export default function PaymentSuccess({ numbers = ["85", "03", "27"] }: PaymentSuccessProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col">
      {/* Top App Bar */}
      <header className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex size-12 items-center justify-center text-text-light dark:text-text-dark">
          <span className="material-symbols-outlined text-3xl cursor-pointer"
            onClick={() => navigate("/")}
          >close</span>
        </div>
        <h2 className="text-lg font-bold text-text-light dark:text-text-dark flex-1 text-center">
          Confirmação
        </h2>
        <div className="size-12"></div>
      </header>

      {/* Body */}
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8">

        {/* Success Icon */}
        <div className="flex items-center justify-center size-24 bg-primary/20 rounded-full mb-6">
          <div className="flex items-center justify-center size-16 bg-primary rounded-full">
            <span className="material-symbols-outlined text-white text-5xl">check</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-[32px] font-bold text-center text-text-light dark:text-text-dark px-4">
          Sua compra foi aprovada!
        </h1>

        <p className="text-base text-text-light/80 dark:text-text-dark/80 text-center mt-2 mb-6">
          Boa sorte! Seu bilhete é:
        </p>

        {/* Ticket Numbers – bolinhas verdes */}
        <div className="w-full max-w-sm p-4">
          <div className="flex flex-col items-center rounded-xl bg-white dark:bg-secondary-dark shadow-lg py-6">
            
            <div className="flex items-center justify-center gap-4">
              {numbers.map((n, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white text-2xl font-bold shadow-md"
                >
                  {n}
                </div>
              ))}
            </div>

            <p className="mt-4 text-text-light/70 dark:text-text-dark/70 text-base">
              Seu Bilhete
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="text-sm text-text-light/80 dark:text-text-dark/80 text-center max-w-xs mt-6">
          Uma cópia do seu bilhete e os detalhes do sorteio foram enviados para o seu e-mail e WhatsApp cadastrados.
        </p>

      </main>

      {/* Bottom Button */}
      <footer className="sticky bottom-0 w-full p-4 bg-background-light dark:bg-background-dark">
        <button
          className="w-full flex items-center justify-center rounded-full bg-primary px-6 py-4 text-white text-lg font-bold"
          onClick={() => navigate("/home")}
        >
          Voltar para o Início
        </button>
      </footer>
    </div>
  );
}