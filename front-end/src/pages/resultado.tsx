// src/pages/resultado.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

type ResultadoAPI = {
  dataApuracao?: string | null;
  premios?: string[];
  proximoSorteio?: string;
  timestampProximoSorteio?: number;
};

function formatarData(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

function calcularDataResultado(
  dataApuracao?: string | null,
  timestampProximoSorteio?: number
): string | null {
  if (dataApuracao) {
    const d = new Date(dataApuracao);
    if (!isNaN(d.getTime())) return formatarData(d);
  }

  if (timestampProximoSorteio) {
    const d = new Date(timestampProximoSorteio);
    d.setDate(d.getDate() - 7);
    return formatarData(d);
  }

  return null;
}

export default function Resultado() {
  const [resultado, setResultado] = useState<ResultadoAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarResultado() {
      setLoading(true);
      setErro("");

      try {
        const res = await api.get("/api/federal");

        if (!res.data?.ok) {
          setErro("Não foi possível carregar os resultados.");
          return;
        }

        const d = res.data.data || {};

        setResultado({
          dataApuracao: d.dataApuracao ?? null,
          premios: Array.isArray(d.premios) ? d.premios.slice(0, 5) : [],
          proximoSorteio: d.proximoSorteio,
          timestampProximoSorteio: d.timestampProximoSorteio,
        });
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

  // ✅ CORREÇÃO: aceitar 5 ou 6 dígitos
  const temResultado =
    resultado?.premios &&
    resultado.premios.length === 5 &&
    resultado.premios.every(
      (p) => typeof p === "string" && /^\d{5,6}$/.test(p)
    );

  const dataResultado = calcularDataResultado(
    resultado?.dataApuracao,
    resultado?.timestampProximoSorteio
  );

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

        {!loading && !erro && resultado && (
          <>
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
                        {new Date(resultado.proximoSorteio).toLocaleDateString(
                          "pt-BR"
                        )}
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

            <motion.div
              className="w-full rounded-xl bg-white/10 border border-yellow-300/30 p-4 mb-6 relative overflow-hidden"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 5.2, repeat: Infinity }}
            >
              <motion.span
                animate={{ x: ["-0%", "100%"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="absolute top-2 text-2xl"
              >
                🎉💰
              </motion.span>

              <p className="text-center text-yellow-300 font-semibold text-sm">
                Confira suas dezenas com atenção. Se você participou, este pode ser o seu momento!
                Acompanhe sempre os resultados oficiais e boa sorte no próximo sorteio.
              </p>
            </motion.div>
          </>
        )}
      </main>

      <NavBottom />
    </div>
  );
}