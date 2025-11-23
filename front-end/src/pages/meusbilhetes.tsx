// src/pages/meusbilhetes.tsx
import React, { useState } from "react";
import Header from "../components/header";
import NavBottom from "../components/NavBottom";

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
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
      alert("Bilhete copiado para a área de transferência.");
    } catch {
      alert("Não foi possível copiar automaticamente. Segure e copie manualmente:\n\n" + text);
    }
  }

  async function shareTicket(t: Ticket) {
    const text = `Meu bilhete ${t.id}\nNúmeros: ${t.nums.join(
      ", "
    )}\nValor: ${formatCurrency(t.value)}\nGerado em: ${formatDate(
      t.createdAt
    )}`;
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Meu Bilhete", text });
      } catch {}
    } else {
      copyTicketText(t);
    }
  }

  function statusBadge(s: TicketStatus) {
    if (s === "premiado")
      return (
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-green-600" />
          <span className="text-xs font-medium text-green-700">Premiado</span>
        </div>
      );

    if (s === "pendente")
      return (
        <div className="flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-xs font-medium text-orange-700">Pendente</span>
        </div>
      );

    return (
      <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1">
        <span className="h-2 w-2 rounded-full bg-zinc-500" />
        <span className="text-xs font-medium text-zinc-700">Não premiado</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <Header />

      <main className="max-w-4xl mx-auto p-4 pb-32">
        <header className="mb-4">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Meus Bilhetes</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Veja aqui seus bilhetes gerados — toque para copiar ou compartilhar.
          </p>
        </header>

        <nav className="flex gap-3 mb-4 overflow-x-auto">
          <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-white px-4">
            <span className="text-sm font-medium">Todos</span>
          </button>

          <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-200 dark:bg-primary/20 px-4">
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Premiados
            </span>
          </button>

          <button className="flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-200 dark:bg-primary/20 px-4">
            <span className="text-sm font-medium text-zinc-700 dark:text-white">
              Pendentes
            </span>
          </button>
        </nav>

        <section className="flex flex-col gap-3">
          {tickets.map((t) => (
            <article
              key={t.id}
              className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-transparent"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex gap-2 items-center">
                    {t.nums.map((n, i) => (
                      <div
                        key={i}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white font-bold"
                      >
                        {n}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col">
                    <div className="text-sm text-slate-700 dark:text-slate-200 font-semibold">
                      {t.sorteio ?? "Sorteio"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Gerado em: {formatDate(t.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {statusBadge(t.status)}
                  <div className="text-sm font-medium text-slate-800 dark:text-white">
                    {formatCurrency(t.value)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  ID: #{t.id.slice(-6)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyTicketText(t)}
                    className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    Copiar
                  </button>

                  <button
                    onClick={() => shareTicket(t)}
                    className="flex items-center gap-2 rounded-full bg-primary text-white px-3 py-2 text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">share</span>
                    Compartilhar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {tickets.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Você ainda não possui bilhetes
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Gere seu primeiro bilhete na tela de apostas.
            </p>
          </div>
        )}
      </main>

      <NavBottom />
    </div>
  );
}