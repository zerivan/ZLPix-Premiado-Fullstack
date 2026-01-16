import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function MeusBilhetes() {
  const [bilhetes, setBilhetes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("todos");

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

  function isPremiado(b: any) {
    return b.status === "PREMIADO" || b.premiado === true;
  }

  function isDentroDoPrazo(b: any) {
    if (!b.sorteioData) return false;
    const d = new Date(b.sorteioData);
    d.setHours(17, 0, 0, 0);
    return Date.now() < d.getTime();
  }

  function isVisivel(b: any) {
    if (isPremiado(b)) return true;
    if (b.pago && isDentroDoPrazo(b)) return true;
    return false;
  }

  const bilhetesFiltrados = bilhetes.filter(isVisivel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white pb-24">
      <header className="text-center pt-6 pb-2">
        <h1 className="text-2xl font-bold text-yellow-300">🎟️ Meus Bilhetes</h1>
        <p className="text-sm text-blue-100">
          Bilhetes válidos até quarta-feira às 17h
        </p>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-4 pb-10 mt-6">
        {bilhetesFiltrados.map((b: any) => (
          <div
            key={b.id}
            className="relative overflow-hidden bg-white/10 border border-white/10 rounded-2xl p-4 shadow-lg"
          >
            {/* 🔒 MARCA D’ÁGUA DE FUNDO */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/5 text-6xl font-extrabold tracking-widest rotate-[-25deg] select-none">
                ZLPIX PREMIADO
              </span>
            </div>

            {/* 🏷️ TIMBRE SUPERIOR */}
            <div className="relative mb-3 text-center">
              <span className="text-yellow-300 text-lg font-extrabold tracking-wide">
                ZLPIX PREMIADO
              </span>
            </div>

            {/* CONTEÚDO */}
            <div className="relative">
              <div className="mb-2">
                <h2 className="font-bold text-lg text-yellow-300">
                  Bilhete #{b.id}
                </h2>
                <p className="text-xs text-blue-100">
                  Criado em: {new Date(b.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-blue-100">
                  Sorteio: {new Date(b.sorteioData).toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                {b.dezenas.split(",").map((n: string, i: number) => (
                  <span
                    key={i}
                    className="h-10 w-10 flex items-center justify-center bg-yellow-400 text-blue-900 font-bold rounded-full shadow-md"
                  >
                    {n}
                  </span>
                ))}
              </div>

              {/* RODAPÉ — VALOR + STATUS ALINHADOS */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-green-400 font-semibold">
                  R$ {Number(b.valor).toFixed(2)}
                </p>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isPremiado(b)
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {isPremiado(b) ? "Premiado" : "Pago"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>

      <NavBottom />
    </div>
  );
}