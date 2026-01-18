// src/pages/resultado.tsx
import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";

/**
 * ============================
 * 🔧 MODO TESTE CONTROLADO
 * ============================
 * true  → usa resultado de teste (ensaio)
 * false → volta para Federal real
 */
const TESTE_RESULTADO = true;

type ResultadoAPI = {
  dataApuracao?: string | null;
  premios?: string[];
  proximoSorteio?: string;
  timestampProximoSorteio?: number;
};

function formatarData(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default function Resultado() {
  const [resultado, setResultado] = useState<ResultadoAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarResultado() {
      setLoading(true);

      // ============================
      // 🔥 RESULTADO DE TESTE (REALISTA)
      // ============================
      if (TESTE_RESULTADO) {
        const dataTeste = new Date("2026-01-21T17:00:00-03:00");

        setResultado({
          dataApuracao: dataTeste.toISOString(),
          premios: [
            "71900", // gera 71
            "90311", // gera 90
            "31123", // gera 31
            "45678",
            "88999",
          ],
          proximoSorteio: new Date(
            dataTeste.getTime() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          timestampProximoSorteio:
            dataTeste.getTime() + 7 * 24 * 60 * 60 * 1000,
        });

        setLoading(false);
        return;
      }

      // ============================
      // 🔵 MODO REAL (quando reverter)
      // ============================
      setLoading(false);
    }

    carregarResultado();
  }, []);

  const positionLabels = ["1º", "2º", "3º", "4º", "5º"];

  const temResultado =
    resultado?.premios &&
    resultado.premios.length === 5 &&
    resultado.premios.every(
      (p) => typeof p === "string" && p.length === 5
    );

  const dataResultado = resultado?.dataApuracao
    ? formatarData(new Date(resultado.dataApuracao))
    : null;

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

        {!loading && resultado && (
          <article className="rounded-2xl bg-white/10 border border-yellow-400/20 shadow-lg p-6 backdrop-blur-sm my-6">
            {temResultado ? (
              <>
                <h2 className="text-lg font-bold text-yellow-300 mb-4 text-center">
                  Resultado do dia {dataResultado}
                </h2>

                <div className="grid grid-cols-2 gap-4 items-center justify-items-center mb-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-sm text-blue-100 mb-2">
                        {positionLabels[idx]}
                      </span>
                      <div className="h-16 w-28 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-2xl font-bold shadow-md">
                        {resultado.premios?.[idx]}
                      </div>
                    </div>
                  ))}

                  <div className="col-span-2 flex flex-col items-center mt-2">
                    <span className="text-sm text-blue-100 mb-2">
                      {positionLabels[4]}
                    </span>
                    <div className="h-14 w-32 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-xl font-bold shadow-md">
                      {resultado.premios?.[4]}
                    </div>
                  </div>
                </div>

                {resultado.proximoSorteio && (
                  <p className="text-center text-xs text-blue-100/80 mt-4">
                    Próximo resultado em{" "}
                    <span className="text-yellow-300 font-semibold">
                      {new Date(
                        resultado.proximoSorteio
                      ).toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                )}
              </>
            ) : (
              <h2 className="text-lg font-bold text-yellow-300 text-center">
                Resultado indisponível
              </h2>
            )}
          </article>
        )}
      </main>

      <NavBottom />
    </div>
  );
}