// src/pages/resultado.tsx
import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

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
  const [resultado, setResultado] = useState<ResultadoAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarResultado() {
      setLoading(true);
      try {
        // 🔗 FONTE ÚNICA DA VERDADE
        const res = await api.get("/api/federal");

        if (!res.data?.ok) {
          setErro("Não foi possível carregar os resultados.");
          return;
        }

        const d = res.data.data;

        const premios = Array.isArray(d.premios) ? d.premios : [];
        while (premios.length < 5) premios.push("-----");

        const normalizado: ResultadoAPI = {
          concurso: d.concurso ?? "N/A",
          dataApuracao: d.dataApuracao ?? "N/A",
          premios: premios.slice(0, 5),
          proximoSorteio: d.proximoSorteio,
          timestampProximoSorteio: d.timestampProximoSorteio,
        };

        // 🧠 REGISTRA ESTADO GLOBAL DO SORTEIO
        localStorage.setItem(
          "ZLPIX_RESULTADO_ATUAL",
          JSON.stringify(normalizado)
        );

        setResultado(normalizado);
      } catch (err) {
        console.error("Erro ao buscar resultado:", err);
        setErro("Falha ao conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    }

    carregarResultado();
  }, []);

  const positionLabels = ["1º", "2º", "3º", "4º", "5º"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white pb-24">
      <header className="text-center py-6">
        <h1 className="text-2xl font-extrabold text-yellow-300 drop-shadow-md">
          🎯 Loteria Federal — Resultados Oficiais
        </h1>
        <p className="text-sm text-blue-100">Fonte oficial do sistema</p>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {loading && (
          <p className="text-center text-yellow-300 animate-pulse py-8">
            Carregando resultados...
          </p>
        )}

        {erro && <p className="text-center text-red-400 py-4">{erro}</p>}

        {!loading && !erro && resultado && (() => {
          const dias = diasAte(resultado.timestampProximoSorteio);

          return (
            <article className="rounded-2xl bg-white/10 border border-yellow-400/20 shadow-lg p-6 backdrop-blur-sm my-6">
              <h2 className="text-lg font-bold text-yellow-300 mb-1 text-center">
                Concurso {resultado.concurso} — {resultado.dataApuracao}
              </h2>

              {dias !== null && (
                <p className="text-center text-xs text-blue-100/80 mb-4">
                  ⏭ Próximo sorteio • faltam{" "}
                  <span className="text-yellow-300 font-semibold">
                    {dias} dias
                  </span>
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 items-center justify-items-center mb-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-sm text-blue-100 mb-2">
                      {positionLabels[idx]}
                    </span>
                    <div className="h-16 w-28 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-2xl font-bold shadow-md">
                      {resultado.premios[idx]}
                    </div>
                  </div>
                ))}

                <div className="col-span-2 flex flex-col items-center mt-2">
                  <span className="text-sm text-blue-100 mb-2">
                    {positionLabels[4]}
                  </span>
                  <div className="h-14 w-32 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-xl font-bold shadow-md">
                    {resultado.premios[4]}
                  </div>
                </div>
              </div>
            </article>
          );
        })()}
      </main>

      <NavBottom />
    </div>
  );
}