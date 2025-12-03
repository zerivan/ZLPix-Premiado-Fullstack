// src/pages/meusbilhetes.tsx
import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";

export default function MeusBilhetes() {
  const [bilhetes, setBilhetes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("todos");

  // 🧹 Carrega bilhetes e remove os com mais de 15 dias
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("BILHETES_USER") || "[]");

    const agora = Date.now();
    const quinzeDias = 15 * 24 * 60 * 60 * 1000; // 15 dias em milissegundos

    const filtrados = stored.filter((b: any) => {
      const data = new Date(b.createdAt).getTime();
      return agora - data <= quinzeDias;
    });

    // Salva apenas os recentes novamente
    localStorage.setItem("BILHETES_USER", JSON.stringify(filtrados));
    setBilhetes(filtrados);
  }, []);

  // 🧼 Limpar manualmente
  const limparHistorico = () => {
    if (window.confirm("Tem certeza que deseja limpar seu histórico de bilhetes?")) {
      localStorage.removeItem("BILHETES_USER");
      setBilhetes([]);
      alert("🧹 Histórico de bilhetes limpo com sucesso!");
    }
  };

  // 🔍 Filtro de exibição
  const bilhetesFiltrados = bilhetes.filter((b) => {
    if (filtro === "premiados") return b.status === "premiado";
    if (filtro === "pendentes") return b.status === "pendente";
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display pb-24">
      {/* Cabeçalho */}
      <header className="text-center pt-6 pb-2">
        <h1 className="text-2xl font-bold text-yellow-300">🎟️ Meus Bilhetes</h1>
        <p className="text-sm text-blue-100">
          Veja seus bilhetes, compartilhe ou copie para guardar.
        </p>

        {/* ⚠️ Aviso automático */}
        <p className="text-xs text-yellow-300 mt-2 px-6">
          ⚠️ Bilhetes com mais de <strong>15 dias</strong> são removidos automaticamente
          para manter o aplicativo leve e rápido.
        </p>
      </header>

      {/* Filtros */}
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

      {/* Botão limpar */}
      <div className="flex justify-end max-w-lg mx-auto px-4 mb-4">
        <button
          onClick={limparHistorico}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full text-sm font-semibold shadow-md transition"
        >
          🧹 Limpar Histórico
        </button>
      </div>

      {/* Lista de bilhetes */}
      <main className="px-4 max-w-lg mx-auto space-y-4 pb-10">
        {bilhetesFiltrados.length === 0 ? (
          <p className="text-center text-white/70 mt-10">
            Nenhum bilhete encontrado.
          </p>
        ) : (
          bilhetesFiltrados.map((b, i) => (
            <div
              key={i}
              className="bg-white/10 border border-white/10 rounded-2xl p-4 shadow-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-bold text-lg text-yellow-300">
                    Sorteio #{b.sorteioId || "----"}
                  </h2>
                  <p className="text-xs text-blue-100">
                    Gerado em:{" "}
                    {new Date(b.createdAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    b.status === "premiado"
                      ? "bg-green-500 text-white"
                      : b.status === "pendente"
                      ? "bg-yellow-400 text-blue-900"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {b.status === "premiado"
                    ? "Premiado"
                    : b.status === "pendente"
                    ? "Pendente"
                    : "Não premiado"}
                </span>
              </div>

              {/* Dezenas */}
              <div className="flex gap-2 mb-3">
                {b.dezenas?.map((n: string, idx: number) => (
                  <span
                    key={idx}
                    className="h-10 w-10 flex items-center justify-center bg-yellow-400 text-blue-900 font-bold rounded-full shadow-md"
                  >
                    {n}
                  </span>
                ))}
              </div>

              {/* Valor e ações */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-green-400 font-semibold">
                  R$ {b.valor?.toFixed(2) || "5,00"}
                </p>

                <div className="flex gap-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      content_copy
                    </span>
                    Copiar
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      share
                    </span>
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Rodapé fixo */}
      <NavBottom />
    </div>
  );
}