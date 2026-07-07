import React, { useEffect, useState, useRef } from "react";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

const DIAS_PERMANENCIA = 7;

export default function MeusBilhetes() {
  const [bilhetes, setBilhetes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 CORRIGIDO: Usar AbortController para cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  function resolveUserId(): string | null {
    try {
      const direct = localStorage.getItem("USER_ID");
      if (direct) return String(direct);

      const stored = localStorage.getItem("USER_ZLPIX");
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.user?.id) return String(parsed.user.id);

      return null;
    } catch {
      return null;
    }
  }

  const userId = resolveUserId();

  async function loadBilhetes() {
    try {
      if (!userId) {
        setLoading(false);
        return;
      }

      // 🔥 Usar api client (consistente com resto da app)
      const res = await api.get("/bilhete/meus", {
        headers: { "x-user-id": userId },
      });

      // 🔥 Verificar se foi abortado
      if (!abortControllerRef.current?.signal.aborted) {
        setBilhetes(res.data || []);
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal.aborted) {
        console.error("Erro ao carregar bilhetes:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 🔥 Criar novo AbortController para este efeito
    abortControllerRef.current = new AbortController();

    loadBilhetes();

    // 🔥 Cleanup: abortar request se componente desmontar
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [userId]);

  function baixarHistorico() {
    if (!bilhetes.length) return;

    const conteudo = bilhetes
      .map((b) => {
        return `
        <div style="margin-bottom:20px;">
          <strong>Bilhete #${b.id}</strong><br/>
          Criado: ${new Date(b.createdAt).toLocaleString("pt-BR")}<br/>
          Sorteio: ${new Date(b.sorteioData).toLocaleString("pt-BR")}<br/>
          Dezenas: ${b.dezenas}<br/>
          Valor: R$ ${Number(b.valor).toFixed(2)}<br/>
          Status: ${b.status}
        </div>
        `;
      })
      .join("");

    const janela = window.open("", "", "width=800,height=600");
    if (!janela) return;

    janela.document.write(`
      <html>
        <head>
          <title>Histórico de Bilhetes</title>
        </head>
        <body style="font-family: Arial; padding:20px;">
          <h2>ZLPIX PREMIADO - Histórico de Bilhetes</h2>
          ${conteudo}
        </body>
      </html>
    `);

    janela.document.close();
    janela.print();
  }

  function dataVirada(b: any): Date | null {
    if (!b.sorteioData) return null;
    return new Date(b.sorteioData);
  }

  function dentroDaPermanencia(b: any) {
    const virada = dataVirada(b);
    if (!virada) return false;

    const limite = new Date(virada);
    limite.setDate(limite.getDate() + DIAS_PERMANENCIA);

    return Date.now() <= limite.getTime();
  }

  // 🔧 CORREÇÃO CIRÚRGICA AQUI
  function isVisivel(b: any) {
    const virada = dataVirada(b);
    if (!virada) return false;

    const agora = Date.now();

    // Antes do sorteio → visível
    if (agora < virada.getTime()) {
      return true;
    }

    // Após sorteio:
    // mostra se já foi apurado OU ainda está dentro da janela
    if (b.apuradoEm) {
      return dentroDaPermanencia(b);
    }

    // fallback para bilhete não apurado (evita sumir indevidamente)
    return dentroDaPermanencia(b);
  }

  const bilhetesVisiveis = bilhetes.filter(isVisivel);

  function getStatusLabel(b: any) {
    switch (b.status) {
      case "PREMIADO":
        return { label: "Premiado", className: "bg-blue-500 text-white" };
      case "NAO_PREMIADO":
        return { label: "Não Premiado", className: "bg-red-500 text-white" };
      case "ATIVO":
        return { label: "Ativo", className: "bg-green-500 text-white" };
      default:
        return { label: b.status || "Pago", className: "bg-gray-500 text-white" };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white pb-24">
      <header className="text-center pt-5 pb-2">
        <h1 className="text-lg font-bold text-yellow-300">🎟️ Meus Bilhetes Digital</h1>
        <p className="text-xs text-blue-100">
          Bilhetes ativos e vencidos recentes
        </p>
      </header>

      {bilhetes.length > 0 && (
        <div className="text-center mt-3">
          <button
            onClick={baixarHistorico}
            className="bg-yellow-400 text-blue-900 font-bold px-5 py-2 rounded-full shadow-md"
          >
            ⬇️ Baixar Histórico (PDF)
          </button>
        </div>
      )}

      <main className="px-3 max-w-sm mx-auto space-y-3 pb-10 mt-4">
        {loading ? (
          <div className="text-center text-yellow-300 animate-pulse">
            Carregando bilhetes...
          </div>
        ) : bilhetesVisiveis.length === 0 ? (
          <div className="text-center text-gray-300">
            Nenhum bilhete disponível
          </div>
        ) : (
          bilhetesVisiveis.map((b: any) => {
            const status = getStatusLabel(b);

            return (
              <div
                key={b.id}
                className="relative overflow-hidden bg-white/10 border border-white/10 rounded-lg p-3 shadow-md"
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-4xl font-extrabold opacity-5 rotate-[-25deg] select-none text-center leading-tight">
                    ZLPIX<br />PREMIADO
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="mb-2 text-center">
                    <span className="text-yellow-300 text-sm font-extrabold tracking-wide">
                      ZLPIX PREMIADO
                    </span>
                  </div>

                  <div className="mb-2">
                    <h2 className="font-bold text-sm text-yellow-300">
                      Bilhete #{b.id}
                    </h2>
                    <p className="text-[10px] text-blue-100">
                      Criado: {new Date(b.createdAt).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-[10px] text-blue-100">
                      Sorteio: {new Date(b.sorteioData).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {b.dezenas.split(",").map((n: string, i: number) => (
                      <span
                        key={i}
                        className="h-7 w-7 flex items-center justify-center bg-yellow-400 text-blue-900 font-bold rounded-full shadow text-xs"
                      >
                        {n}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-green-400 font-semibold">
                      R$ {Number(b.valor).toFixed(2)}
                    </p>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      <NavBottom />
    </div>
  );
}