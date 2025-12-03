import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";

export default function Resultado() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchFederal() {
      setLoading(true);
      try {
        // Nova API funcional (sem bloqueio de CORS)
        const res = await fetch("https://loteriascaixa-api.vercel.app/api/federal/latest");
        const data = await res.json();

        // Adiciona resultado em array para map()
        setResultados([data]);
      } catch (err) {
        console.error("Erro ao buscar Loteria Federal:", err);
        setErro("Não foi possível carregar os resultados agora.");
      } finally {
        setLoading(false);
      }
    }

    fetchFederal();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display pb-24">
      {/* Cabeçalho */}
      <header className="text-center py-6">
        <h1 className="text-2xl font-bold text-yellow-300 drop-shadow-md">
          🎯 Loteria Federal — Resultados Oficiais
        </h1>
        <p className="text-sm text-blue-100">
          Atualizados automaticamente direto da Caixa
        </p>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-2xl mx-auto px-4 space-y-6">
        {loading && (
          <p className="text-center text-yellow-300 animate-pulse">
            Carregando resultados...
          </p>
        )}

        {erro && <p className="text-center text-red-400">{erro}</p>}

        {!loading &&
          !erro &&
          resultados.map((r, i) => (
            <article
              key={i}
              className="rounded-2xl bg-white/10 border border-yellow-400/20 shadow-lg p-5 backdrop-blur-sm"
            >
              <h2 className="text-lg font-bold text-yellow-300 mb-1 text-center">
                Concurso {r.concurso} — {r.dataApuracao}
              </h2>
              <p className="text-center text-blue-100 mb-3">
                {r.localSorteio || "Local não informado"}
              </p>

              <div className="flex justify-center flex-wrap gap-3 mb-4">
                {(r.dezenasSorteadasOrdemSorteio || []).map(
                  (num: string, idx: number) => (
                    <div
                      key={idx}
                      className="h-12 w-16 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-lg font-bold shadow-md"
                    >
                      {num}
                    </div>
                  )
                )}
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <p className="text-yellow-300 font-semibold mb-2 text-center">
                  💰 Premiação
                </p>
                {r.listaRateioPremio &&
                  r.listaRateioPremio.map((p: any, j: number) => (
                    <div
                      key={j}
                      className="flex justify-between text-sm border-b border-white/10 py-1"
                    >
                      <span>{p.descricaoFaixa}</span>
                      <span>
                        {p.numeroDeGanhadores} ganhador(es)
                      </span>
                      <span className="text-yellow-300 font-semibold">
                        R$ {Number(p.valorPremio).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </article>
          ))}
      </main>

      {/* Menu fixo — corrigido */}
      <NavBottom />
    </div>
  );
}