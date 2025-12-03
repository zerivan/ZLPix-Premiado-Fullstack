// src/pages/meusbilhetes.tsx
import React, { useState } from "react";
import Header from "../components/header";
import NavBottom from "../components/navbottom";

type TicketStatus = "premiado" | "pendente" | "nao-premiado";

type Ticket = {
  id: string;
  nums: string[];
  value: number;
  createdAt: string;
  status: TicketStatus;
  sorteio?: string;
};

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function MeusBilhetes() {
  const [tickets] = useState<Ticket[]>([
    {
      id: "tkt_01_abcd12",
      nums: ["98", "56", "00"],
      value: 5,
      createdAt: "2023-10-28T14:30:00Z",
      status: "premiado",
      sorteio: "Sorteio #5678",
    },
    {
      id: "tkt_02_efgh34",
      nums: ["12", "34", "56"],
      value: 5,
      createdAt: "2023-10-27T11:15:00Z",
      status: "pendente",
      sorteio: "Sorteio #5677",
    },
    {
      id: "tkt_03_ijkl56",
      nums: ["78", "90", "11"],
      value: 5,
      createdAt: "2023-10-26T09:05:00Z",
      status: "nao-premiado",
      sorteio: "Sorteio #5676",
    },
  ]);

  async function copyTicketText(t: Ticket) {
    const text = `Bilhete ${t.id} — ${t.nums.join(", ")} — ${formatCurrency(
      t.value
    )} — ${formatDate(t.createdAt)}`;

    try {
      await navigator.clipboard.writeText(text);
      alert("Bilhete copiado!");
    } catch {
      alert(
        "Não foi possível copiar automaticamente. Copie manualmente:\n\n" +
          text
      );
    }
  }

  async function shareTicket(t: Ticket) {
    const text = `Meu bilhete ${t.id}
Números: ${t.nums.join(", ")}
Valor: ${formatCurrency(t.value)}
Gerado em: ${formatDate(t.createdAt)}`;

    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Bilhete ZLPix", text });
      } catch {}
    } else {
      copyTicketText(t);
    }
  }

  function statusBadge(s: TicketStatus) {
    if (s === "premiado")
      return (
        <div className="flex items-center gap-2 rounded-full bg-green-100/20 border border-green-400 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs font-medium text-green-300">Premiado</span>
        </div>
      );

    if (s === "pendente")
      return (
        <div className="flex items-center gap-2 rounded-full bg-yellow-100/20 border border-yellow-400 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="text-xs font-medium text-yellow-300">Pendente</span>
        </div>
      );

    return (
      <div className="flex items-center gap-2 rounded-full bg-gray-100/10 border border-gray-500 px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        <span className="text-xs font-medium text-gray-300">Não premiado</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1221] text-white font-display flex flex-col">
      {/* 🌈 Cabeçalho azul-verde com título */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-green-600 py-3 shadow-lg border-b border-green-400/30">
        <h1 className="text-center text-lg font-extrabold text-yellow-300 drop-shadow-sm">
          Meus Bilhetes 🎟️
        </h1>
        <p className="text-center text-sm text-blue-100 mt-1">
          Veja seus bilhetes, compartilhe ou copie para guardar
        </p>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-28">
        {/* Filtros */}
        <nav className="flex gap-3 mb-4 overflow-x-auto">
          <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-yellow-400 text-blue-900 px-4 font-bold">
            Todos
          </button>

          <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-blue-700 px-4 font-semibold">
            Premiados
          </button>

          <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-green-600 px-4 font-semibold">
            Pendentes
          </button>
        </nav>

        {/* Lista de bilhetes */}
        <section className="flex flex-col gap-3">
          {tickets.map((t) => (
            <article
              key={t.id}
              className="flex flex-col gap-3 bg-[#111a2e] p-4 rounded-lg border border-blue-900/30 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="flex gap-2 items-center">
                    {t.nums.map((n, i) => (
                      <div
                        key={i}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-blue-900 font-extrabold text-sm shadow-inner"
                      >
                        {n}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-yellow-300">
                      {t.sorteio}
                    </span>
                    <span className="text-xs text-gray-400">
                      Gerado em: {formatDate(t.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {statusBadge(t.status)}
                  <span className="text-sm font-bold text-green-400">
                    {formatCurrency(t.value)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-400">
                  ID: #{t.id.slice(-6)}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyTicketText(t)}
                    className="flex items-center gap-2 bg-blue-700 rounded-full px-3 py-2 text-xs text-white font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm">
                      content_copy
                    </span>
                    Copiar
                  </button>

                  <button
                    onClick={() => shareTicket(t)}
                    className="flex items-center gap-2 bg-green-600 rounded-full px-3 py-2 text-xs text-white font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm">
                      share
                    </span>
                    Compartilhar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Sem bilhetes */}
        {tickets.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-gray-600 p-8 text-center">
            <p className="text-lg font-semibold text-yellow-300">
              Você ainda não possui bilhetes
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Gere seu primeiro bilhete na tela de Apostas.
            </p>
          </div>
        )}
      </main>

      <NavBottom />
    </div>
  );
}