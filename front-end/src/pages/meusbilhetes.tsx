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

  function baixarHistorico() {
    if (!bilhetes.length) return;

    const conteudo = bilhetes
      .map((b) => {
        return `
Bilhete #${b.id}
Criado: ${new Date(b.createdAt).toLocaleString("pt-BR")}
Sorteio: ${new Date(b.sorteioData).toLocaleString("pt-BR")}
Dezenas: ${b.dezenas}
Valor: R$ ${Number(b.valor).toFixed(2)}
Status: ${b.status}
-----------------------------`;
      })
      .join("\n");

    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `historico-bilhetes-${Date.now()}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function dataVirada(b: any): Date | null {
    if (!b.sorteioData) return null;
    const d = new Date(b.sorteioData);
    d.setHours(20, 0, 0, 0);
    return d;
  }

  function dentroDaPermanencia(b: any) {
    const virada = dataVirada(b);
    if (!virada) return false;

    const limite = new Date(virada);
    limite.setDate(limite.getDate() + DIAS_PERMANENCIA);

    return Date.now() <= limite.getTime();
  }

  function isVisivel(b: any) {
    const virada = dataVirada(b);
    if (!virada) return false;

    if (Date.now() < virada.getTime()) {
      return true;
    }

    return dentroDaPermanencia(b);
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
      <header className="text-center pt-5 pb-2">
        <h1 className="text-lg font-bold text-yellow-300">🎟️ Meus Bilhetes</h1>
        <p className="text-xs text-blue-100">
          Bilhetes ativos e vencidos recentes
        </p>
      </header>

      {/* 🔥 BOTÃO DOWNLOAD HISTÓRICO */}
      {bilhetes.length > 0 && (
        <div className="text-center mt-3">
          <button
            onClick={baixarHistorico}
            className="bg-yellow-400 text-blue-900 font-bold px-5 py-2 rounded-full shadow-md"
          >
            ⬇️ Baixar Histórico
          </button>
        </div>
      )}

      <main className="px-3 max-w-sm mx-auto space-y-3 pb-10 mt-4">
        {bilhetesVisiveis.map((b: any) => {
          const status = getStatusLabel(b);

          return (
            <div
              key={b.id}
              className="relative overflow-hidden bg-white/10 border border-white/10 rounded-lg p-3 shadow-md"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-4xl font-extrabold opacity-5 rotate-[-25deg] select-none text-center leading-tight">
                  ZLPIX<br />PREMIADO
                </span>
              </div>

              <div className="relative z-10">
                <div className="mb-2 text-center">
                  <span className="text-yellow-300 text-sm font-extrabold tracking-wide">
                    ZLPIX PREMIADO
                  </span>
                </div>

                <div className="mb-2">
                  <h2 className="font-bold text-sm text-yellow-300">
                    Bilhete #{b.id}
                  </h2>
                  <p className="text-[10px] text-blue-100">
                    Criado: {new Date(b.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-[10px] text-blue-100">
                    Sorteio: {new Date(b.sorteioData).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="flex gap-1 mb-3">
                  {b.dezenas.split(",").map((n: string, i: number) => (
                    <span
                      key={i}
                      className="h-7 w-7 flex items-center justify-center bg-yellow-400 text-blue-900 font-bold rounded-full shadow text-xs"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-green-400 font-semibold">
                    R$ {Number(b.valor).toFixed(2)}
                  </p>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}
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