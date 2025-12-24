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

function formatarData(data?: string) {
  if (!data) return null;
  const d = new Date(data);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR");
}

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
      try {
        const res = await api.get("/api/federal");
        if (!res.data?.ok) {
          setErro("Erro ao carregar resultado.");
          return;
        }

        const d = res.data.data || {};
        setResultado({
          dataApuracao: d.dataApuracao,
          premios: Array.isArray(d.premios) ? d.premios : [],
          proximoSorteio: d.proximoSorteio,
          timestampProximoSorteio: d.timestampProximoSorteio,
        });
      } catch {
        setErro("Falha ao conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    }

    carregarResultado();
  }, []);

  const temResultado =
    resultado?.premios &&
    resultado.premios.length === 5 &&
    resultado.premios.every((p) => p && p !== "-----");

  const dataResultado = formatarData(resultado?.dataApuracao);
  const proximoResultado = formatarData(resultado?.proximoSorteio);
  const dias = diasAte(resultado?.timestampProximoSorteio);

  const positionLabels = ["1º", "2º", "3º", "4º", "5º"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white pb-24">
      <header className="text-center py-6">
        <h1 className="text-2xl font-extrabold text-yellow-300">
          🎯 Loteria Federal — Resultados Oficiais
        </h1>
        <p className="text-sm text-blue-100">Fonte oficial do sistema</p>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {loading && (
          <p className="text-center text-yellow-300 py-8">Carregando...</p>
        )}

        {erro && <p className="text-center text-red-400">{erro}</p>}

        {!loading && !erro && resultado && (
          <article className="rounded-2xl bg-white/10 border border-yellow-400/20 p-6 my-6">
            {temResultado ? (
              <>
                <h2 className="text-lg font-bold text-yellow-300 text-center mb-4">
                  {dataResultado
                    ? `Resultado do dia ${dataResultado}`
                    : "Resultado indisponível"}
                </h2>

                <div className="grid grid-cols-2 gap-4 justify-items-center mb-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                      <div className="text-sm text-blue-100 mb-1">
                        {positionLabels[i]}
                      </div>
                      <div className="h-16 w-28 flex items-center justify-center bg-yellow-400 text-blue-900 text-2xl font-bold rounded-xl">
                        {resultado.premios?.[i]}
                      </div>
                    </div>
                  ))}

                  <div className="col-span-2 text-center">
                    <div className="text-sm text-blue-100 mb-1">5º</div>
                    <div className="h-14 w-32 mx-auto flex items-center justify-center bg-yellow-400 text-blue-900 text-xl font-bold rounded-xl">
                      {resultado.premios?.[4]}
                    </div>
                  </div>
                </div>

                {proximoResultado && (
                  <p className="text-center text-xs text-blue-100">
                    Próximo resultado em{" "}
                    <span className="text-yellow-300 font-semibold">
                      {proximoResultado}
                    </span>
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-yellow-300 text-center mb-2">
                  Aguardando resultado do sorteio
                </h2>

                {dias !== null && (
                  <p className="text-center text-blue-100">
                    Próximo resultado em{" "}
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