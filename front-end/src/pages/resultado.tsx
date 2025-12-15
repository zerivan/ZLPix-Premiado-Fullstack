import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";

type ResultadoAPI = {
  concurso: string;
  dataApuracao: string;
  premios: string[];
  proximoSorteio?: string;
  timestampProximoSorteio?: number;
};

function diasAte(timestamp?: number) {
  if (!timestamp) return null;
  const diff = timestamp - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Resultado() {
  const [resultados, setResultados] = useState<ResultadoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchFederal() {
      setLoading(true);
      try {
        const res = await fetch(
          "https://zlpix-premiado-fullstack.onrender.com/api/federal"
        );
        const json = await res.json();

        if (!json.ok) {
          setErro("Não foi possível carregar os resultados.");
          return;
        }

        const d = json.data || {};
        const premios = Array.isArray(d.premios) ? d.premios : [];

        while (premios.length < 5) premios.push("-----");

        setResultados([
          {
            concurso: d.concurso ?? "N/A",
            dataApuracao: d.dataApuracao ?? "N/A",
            premios: premios.slice(0, 5),
            proximoSorteio: d.proximoSorteio,
            timestampProximoSorteio: d.timestampProximoSorteio,
          },
        ]);
      } catch (err) {
        console.error("Erro ao buscar resultado:", err);
        setErro("Falha ao conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    }

    fetchFederal();
  }, []);

  const positionLabels = ["1º", "2º", "3º", "4º", "5º"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display pb-24">
      <header className="text-center py-6">
        <h1 className="text-2xl font-extrabold text-yellow-300 drop-shadow-md">
          🎯 Loteria Federal — Resultados Oficiais
        </h1>
        <p className="text-sm text-blue-100">Atualizados automaticamente</p>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {loading && (
          <p className="text-center text-yellow-300 animate-pulse py-8">
            Carregando resultados...
          </p>
        )}

        {erro && <p className="text-center text-red-400 py-4">{erro}</p>}

        {!loading &&
          !erro &&
          resultados.map((r, i) => {
            const dias = diasAte(r.timestampProximoSorteio);

            return (
              <article
                key={i}
                className="rounded-2xl bg-white/10 border border-yellow-400/20 shadow-lg p-6 backdrop-blur-sm my-6"
              >
                <h2 className="text-lg font-bold text-yellow-300 mb-1 text-center">
                  Concurso {r.concurso} — {r.dataApuracao}
                </h2>

                {/* ⏭ Próximo sorteio (discreto) */}
                {dias !== null && (
                  <p className="text-center text-xs text-blue-100/80 mb-4">
                    ⏭ Próximo sorteio na quarta-feira • faltam{" "}
                    <span className="text-yellow-300 font-semibold">
                      {dias} dias
                    </span>
                  </p>
                )}

                {/* GRID */}
                <div className="grid grid-cols-2 gap-4 items-center justify-items-center mb-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-sm text-blue-100 mb-2">
                        {positionLabels[idx]}
                      </span>
                      <div className="h-16 w-28 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-2xl font-bold shadow-md">
                        {r.premios[idx]}
                      </div>
                    </div>
                  ))}

                  <div className="col-span-2 flex flex-col items-center mt-2">
                    <span className="text-sm text-blue-100 mb-2">
                      {positionLabels[4]}
                    </span>
                    <div className="h-14 w-32 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-xl font-bold shadow-md">
                      {r.premios[4]}
                    </div>
                  </div>
                </div>

                {/* Lista legível */}
                <div className="rounded-xl bg-white/5 p-3 border border-white/10 mt-4">
                  <p className="text-yellow-300 font-semibold mb-3 text-center">
                    💰 Premiação (ordem)
                  </p>
                  <div className="space-y-2">
                    {r.premios.map((num, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm border-b border-white/10 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-yellow-300 text-blue-900 font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div className="text-blue-100">
                            {positionLabels[idx]} Prize
                          </div>
                        </div>
                        <div className="text-yellow-300 font-semibold text-lg">
                          {num}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
      </main>

      <NavBottom />
    </div>
  );
}