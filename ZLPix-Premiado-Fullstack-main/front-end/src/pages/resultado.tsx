import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";

type ResultadoAPI = {
  concurso: string;
  dataApuracao: string;
  premios: string[]; // array com 5 strings, já em ordem (1º..5º)
};

export default function Resultado() {
  const [resultados, setResultados] = useState<ResultadoAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function fetchFederal() {
      setLoading(true);
      try {
        const res = await fetch("https://zlpix-premiado-fullstack.onrender.com/api/federal");
        const json = await res.json();

        if (!json.ok) {
          setErro("Não foi possível carregar os resultados.");
          return;
        }

        // normaliza: garante que json.data.premios exista e tenha 5 itens
        const d = json.data || {};
        const premios = Array.isArray(d.premios) ? d.premios : [];

        // se tiver menos de 5, completa com "-----" para não quebrar layout
        while (premios.length < 5) premios.push("-----");

        setResultados([
          {
            concurso: d.concurso ?? "N/A",
            dataApuracao: d.dataApuracao ?? "N/A",
            premios: premios.slice(0, 5),
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

        {!loading && !erro && resultados.map((r, i) => (
          <article
            key={i}
            className="rounded-2xl bg-white/10 border border-yellow-400/20 shadow-lg p-6 backdrop-blur-sm my-6"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-1 text-center">
              Concurso {r.concurso} — {r.dataApuracao}
            </h2>

            <p className="text-center text-blue-100 mb-4">
              { /* local pode vir de backend se disponível */ }
              { (r as any).local || "Local não informado" }
            </p>

            {/* GRID com posição + número */}
            <div className="grid grid-cols-2 gap-4 items-center justify-items-center mb-4">
              {/* 1º e 2º em cima (col 1 e 2), 3º e 4º ao lado, 5º centralizado abaixo */}
              <div className="flex flex-col items-center">
                <span className="text-sm text-blue-100 mb-2">{positionLabels[0]}</span>
                <div className="h-16 w-28 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-2xl font-bold shadow-md">
                  {r.premios[0]}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm text-blue-100 mb-2">{positionLabels[1]}</span>
                <div className="h-16 w-28 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-2xl font-bold shadow-md">
                  {r.premios[1]}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm text-blue-100 mb-2">{positionLabels[2]}</span>
                <div className="h-16 w-28 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-2xl font-bold shadow-md">
                  {r.premios[2]}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm text-blue-100 mb-2">{positionLabels[3]}</span>
                <div className="h-16 w-28 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-2xl font-bold shadow-md">
                  {r.premios[3]}
                </div>
              </div>

              {/* 5º centralizado: ocupa duas colunas */}
              <div className="col-span-2 flex flex-col items-center mt-2">
                <span className="text-sm text-blue-100 mb-2">{positionLabels[4]}</span>
                <div className="h-14 w-32 flex items-center justify-center rounded-xl bg-yellow-400 text-blue-900 text-xl font-bold shadow-md">
                  {r.premios[4]}
                </div>
              </div>
            </div>

            {/* Lista legível com labels (Ajuste para acessibilidade) */}
            <div className="rounded-xl bg-white/5 p-3 border border-white/10 mt-4">
              <p className="text-yellow-300 font-semibold mb-3 text-center">💰 Premiação (ordem)</p>
              <div className="space-y-2">
                {r.premios.map((num, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-white/10 py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-300 text-blue-900 font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-blue-100"> {positionLabels[idx]} Prize</div>
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
        ))}
      </main>

      <NavBottom />
    </div>
  );
}