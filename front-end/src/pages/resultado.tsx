// src/pages/resultado.tsx
import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

type ResultadoAPI = {
  dataApuracao?: string;
  premios?: string[];
  proximoSorteio?: string;
  timestampProximoSorteio?: number;
};

function diasAte(timestamp?: number) {
  if (!timestamp) return null;
  const diff = timestamp - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatarData(data?: string) {
  if (!data) return null;
  const d = new Date(data);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR");
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
          dataApuracao: d.dataApuracao,
          premios: Array.isArray(d.premios) ? d.premios : [],
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

  const temResultado =
    resultado?.premios &&
    resultado.premios.length === 5 &&
    resultado.premios.every((p) => p && p !== "-----");

  const dataResultado = formatarData(resultado?.dataApuracao);
  const proximoResultado = formatarData(resultado?.proximoSorteio);
  const dias = diasAte(resultado?.timestampProximoSorteio);

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
          <article className="rounded-2xl bg-white/10 border border-yellow-400/20 shadow-lg p-6 backdrop-blur-sm my-6">
            {temResultado ? (
              <>
                <h2 className="text-lg font-bold text-yellow-300 mb-4 text-center">
                  {dataResultado
                    ? `Resultado do dia ${dataResultado}`
                    : "Resultado do sorteio"}
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

                {proximoResultado && (
                  <p className="text-center text-xs text-blue-100/80 mt-4">
                    Próximo resultado em{" "}
                    <span className="text-yellow-300 font-semibold">
                      {proximoResultado}
                    </span>
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-yellow-300 mb-2 text-center">
                  Aguardando resultado do sorteio
                </h2>

                {dias !== null && (
                  <p className="text-center text-sm text-blue-100">
                    ⏳ Próximo resultado em{" "}
                    <span className="text-yellow-300 font-semibold">
                      {dias} dias
                    </span>
                  </p>
                )}
              </>
            )}
          </article>
        )}
      </main>

      <NavBottom />
    </div>
  );
}