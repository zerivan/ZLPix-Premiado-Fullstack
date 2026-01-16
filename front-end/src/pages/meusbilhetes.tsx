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

      if (parsed && (parsed.id || parsed.userId || parsed._id)) {
        return String(parsed.id ?? parsed.userId ?? parsed._id);
      }
      if (parsed.user && (parsed.user.id || parsed.user.userId)) {
        return String(parsed.user.id ?? parsed.user.userId);
      }
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
    } catch (e) {
      console.log("Erro ao carregar bilhetes:", e);
    }
  }

  useEffect(() => {
    loadBilhetes();
  }, [userId]);

  useEffect(() => {
    function onFocus() {
      if (document.visibilityState === "visible") {
        loadBilhetes();
      }
    }

    document.addEventListener("visibilitychange", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [userId]);

  // =========================
  // HELPERS (REGRA CORRETA)
  // =========================
  function isPremiado(b: any) {
    return b.status === "PREMIADO" || b.premiado === true;
  }

  /**
   * Bilhete é válido ATÉ quarta-feira às 17:00
   */
  function isDentroDoPrazo(b: any) {
    if (!b.sorteioData) return false;

    const data = new Date(b.sorteioData);
    data.setHours(17, 0, 0, 0); // ⏰ 17:00 em ponto

    return Date.now() < data.getTime();
  }

  function isVisivel(b: any) {
    // 🔒 Premiado nunca some
    if (isPremiado(b)) return true;

    // ⏳ Pago + dentro do prazo
    if (
      b.pago === true &&
      (b.status === "ATIVO" ||
        b.status === "ATIVO_ATUAL" ||
        b.status === "ATIVO_PROXIMO") &&
      isDentroDoPrazo(b)
    ) {
      return true;
    }

    return false;
  }

  const bilhetesVisiveis = bilhetes.filter(isVisivel);

  const bilhetesFiltrados = bilhetesVisiveis.filter((b) => {
    if (filtro === "premiados") return isPremiado(b);
    if (filtro === "pendentes") return !b.pago;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white pb-24">
      <header className="text-center pt-6 pb-2">
        <h1 className="text-2xl font-bold text-yellow-300">🎟️ Meus Bilhetes</h1>
        <p className="text-sm text-blue-100">
          Bilhetes válidos até quarta-feira às 17h
        </p>
      </header>

      <div className="flex justify-center gap-3 mt-4 mb-5">
        {["todos", "premiados", "pendentes"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
              filtro === tipo
                ? tipo === "premiados"
                  ? "bg-blue-500 text-white"
                  : tipo === "pendentes"
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400 text-blue-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {tipo === "todos"
              ? "Todos"
              : tipo === "premiados"
              ? "Premiados"
              : "Pendentes"}
          </button>
        ))}
      </div>

      <main className="px-4 max-w-lg mx-auto space-y-4 pb-10">
        {bilhetesFiltrados.length === 0 ? (
          <p className="text-center text-white/70 mt-10">
            Nenhum bilhete disponível no momento.
          </p>
        ) : (
          bilhetesFiltrados.map((b: any) => (
            <div
              key={b.id}
              className="bg-white/10 border border-white/10 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-bold text-lg text-yellow-300">
                    Bilhete #{b.id}
                  </h2>
                  <p className="text-xs text-blue-100">
                    Sorteio:{" "}
                    {b.sorteioData
                      ? new Date(b.sorteioData).toLocaleDateString("pt-BR")
                      : "-"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isPremiado(b)
                      ? "bg-blue-500 text-white"
                      : b.pago
                      ? "bg-green-500 text-white"
                      : "bg-yellow-400 text-blue-900"
                  }`}
                >
                  {isPremiado(b)
                    ? "Premiado"
                    : b.pago
                    ? "Pago"
                    : "Pendente"}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                {(b.dezenas ? b.dezenas.split(",") : []).map(
                  (n: string, i: number) => (
                    <span
                      key={i}
                      className="h-10 w-10 flex items-center justify-center bg-yellow-400 text-blue-900 font-bold rounded-full shadow-md"
                    >
                      {n}
                    </span>
                  )
                )}
              </div>

              <p className="text-sm text-green-400 font-semibold">
                R$ {Number(b.valor).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </main>

      <NavBottom />
    </div>
  );
}