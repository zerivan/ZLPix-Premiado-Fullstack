import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const DIAS_PERMANENCIA = 7;

export default function MeusBilhetes() {
  const [bilhetes, setBilhetes] = useState<any[]>([]);

  function resolveUserId(): string | null {
    try {
      const direct = localStorage.getItem("USER_ID");
      if (direct) return String(direct);

      const stored = localStorage.getItem("USER_ZLPIX");
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.user?.id) return String(parsed.user.id);

      return null;
    } catch {
      return null;
    }
  }

  const userId = resolveUserId();

  async function loadBilhetes() {
    try {
      if (!userId) return;

      const res = await axios.get(`${API}/bilhete/meus`, {
        headers: { "x-user-id": userId },
      });

      setBilhetes(res.data || []);
    } catch {}
  }

  useEffect(() => {
    loadBilhetes();
  }, [userId]);

  function venceuEm(b: any): Date | null {
    if (!b.sorteioData) return null;
    const d = new Date(b.sorteioData);
    d.setHours(17, 0, 0, 0);
    return d;
  }

  function dentroDaPermanencia(b: any) {
    const vencimento = venceuEm(b);
    if (!vencimento) return false;

    const limite = new Date(vencimento);
    limite.setDate(limite.getDate() + DIAS_PERMANENCIA);

    return Date.now() <= limite.getTime();
  }

  function isVisivel(b: any) {
    const vencimento = venceuEm(b);

    if (b.status === "ATIVO" && vencimento && Date.now() < vencimento.getTime()) {
      return true;
    }

    if (vencimento && dentroDaPermanencia(b)) {
      return true;
    }

    return false;
  }

  const bilhetesVisiveis = bilhetes.filter(isVisivel);

  function getStatusLabel(b: any) {
    switch (b.status) {
      case "PREMIADO":
        return { label: "Premiado", className: "bg-blue-500 text-white" };
      case "NAO_PREMIADO":
        return { label: "Não Premiado", className: "bg-red-500 text-white" };
      case "ATIVO":
        return { label: "Ativo", className: "bg-green-500 text-white" };
      default:
        return { label: b.status || "Pago", className: "bg-gray-500 text-white" };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white pb-24">
      <header className="text-center pt-6 pb-2">
        <h1 className="text-xl font-bold text-yellow-300">🎟️ Meus Bilhetes</h1>
        <p className="text-xs text-blue-100">
          Bilhetes ativos e vencidos recentes
        </p>
      </header>

      <main className="px-4 max-w-md mx-auto space-y-3 pb-10 mt-4">
        {bilhetesVisiveis.map((b: any) => {
          const status = getStatusLabel(b);

          return (
            <div
              key={b.id}
              className="relative overflow-hidden bg-white/10 border border-white/10 rounded-xl p-3 shadow-lg"
            >
              {/* 🔥 MARCA D’ÁGUA */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-5xl font-extrabold opacity-5 rotate-[-25deg] select-none">
                  ZLPIX
                </span>
              </div>

              <div className="relative z-10">
                <div className="relative mb-2 text-center">
                  <span className="text-yellow-300 text-base font-extrabold tracking-wide">
                    ZLPIX PREMIADO
                  </span>
                </div>

                <div className="mb-2">
                  <h2 className="font-bold text-base text-yellow-300">
                    Bilhete #{b.id}
                  </h2>
                  <p className="text-xs text-blue-100">
                    Criado em: {new Date(b.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-blue-100">
                    Sorteio: {new Date(b.sorteioData).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="flex gap-2 mb-3">
                  {b.dezenas.split(",").map((n: string, i: number) => (
                    <span
                      key={i}
                      className="h-8 w-8 flex items-center justify-center bg-yellow-400 text-blue-900 font-bold rounded-full shadow-md text-sm"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-green-400 font-semibold">
                    R$ {Number(b.valor).toFixed(2)}
                  </p>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <NavBottom />
    </div>
  );
}