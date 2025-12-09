import React, { useState } from "react";
import NavBottom from "../components/navbottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

type Bet = {
  id: string; // corrigido — bigint quebrava tudo
  dezenas: string[];
  valor: number;
  data: string;
};

export default function ApostaPainel() {
  const [selected, setSelected] = useState<string[]>([]);
  const [history, setHistory] = useState<Bet[]>([]);
  const navigate = useNavigate();

  const userId = localStorage.getItem("USER_ID");

  const numbers = Array.from({ length: 100 }).map((_, i) =>
    String(i).padStart(2, "0")
  );

  // ----------------------------------------------------------
  // Selecionar dezenas
  // ----------------------------------------------------------
  function toggle(n: string) {
    setSelected((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 3) return prev;
      return [...prev, n].sort();
    });
  }

  // ----------------------------------------------------------
  // Gerar dezenas automaticamente
  // ----------------------------------------------------------
  function autoGenerate() {
    const picks = new Set<string>();
    while (picks.size < 3) {
      const r = numbers[Math.floor(Math.random() * numbers.length)];
      picks.add(r);
    }
    setSelected(Array.from(picks).sort());
  }

  // ----------------------------------------------------------
  // Desfazer seleção
  // ----------------------------------------------------------
  function undo() {
    setSelected([]);
  }

  // ----------------------------------------------------------
  // CONFIRMAR → cria bilhete REAL no BACKEND (corrigido)
  // ----------------------------------------------------------
  async function confirmTicket() {
    if (selected.length !== 3)
      return alert("Selecione 3 dezenas antes de confirmar.");

    if (!userId)
      return alert("Erro: usuário não identificado. Faça login novamente.");

    try {
      const body = {
        userId,
        dezenas: selected.join(","),
        valor: 2,
        sorteioData: new Date().toISOString(),
      };

      const res = await axios.post(`${API}/bilhete/criar`, body);

      const bilhete = res.data.bilhete;

      // backend deve retornar string. Mas convertendo caso não retorne.
      const idCorrigido = String(bilhete.id);

      // adiciona no histórico local
      setHistory((h) => [
        {
          id: idCorrigido,
          dezenas: selected.slice(),
          valor: 2,
          data: new Date().toLocaleString(),
        },
        ...h,
      ]);

      setSelected([]);
      alert("Bilhete criado! Agora clique em Pagar Agora.");

    } catch (err) {
      console.error(err);
      alert("Erro ao gerar bilhete. O servidor recusou o BIGINT.");
    }
  }

  // ----------------------------------------------------------
  // PAGAR AGORA → leva para PIX (corrigido)
  // ----------------------------------------------------------
  function pagarAgora() {
    if (history.length === 0)
      return alert("Crie um bilhete antes de pagar.");

    const ultimo = history[0];

    navigate(`/pagamento?bilheteId=${String(ultimo.id)}&userId=${userId}`);
  }

  // ----------------------------------------------------------
  // LAYOUT (NÃO ALTERADO)
  // ----------------------------------------------------------
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="ticket-info">
        <h2>Sistema de Apostas</h2>
        <p className="small-muted">Escolha 3 dezenas — Pagamento via Pix</p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <div className="summary center">
          Dezenas selecionadas:{" "}
          <strong>{selected.join(", ") || "—"}</strong>
        </div>

        {/* GRID DE DEZENAS */}
        <div className="numbers-grid" aria-label="grade-dezenas">
          {numbers.map((n) => (
            <button
              key={n}
              className={"number-btn " + (selected.includes(n) ? "selected" : "")}
              onClick={() => toggle(n)}
            >
              {n}
            </button>
          ))}
        </div>

        {/* BOTÕES */}
        <div className="actions-row">
          <button className="btn gray" onClick={autoGenerate}>
            Gerar
          </button>

          <button className="btn warn" onClick={undo}>
            Desfazer
          </button>

          <button className="btn primary" onClick={confirmTicket}>
            Confirmar
          </button>
        </div>

        {/* PAGAR AGORA */}
        <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
          <button className="btn primary" onClick={pagarAgora}>
            💸 Pagar agora
          </button>

          <div style={{ flex: 1 }} />
        </div>

        {/* HISTÓRICO */}
        <div style={{ marginTop: 16 }}>
          <h4>Histórico</h4>

          {history.length === 0 ? (
            <p className="small-muted">Nenhum bilhete ainda.</p>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                style={{
                  padding: 10,
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div>
                  <strong>{h.dezenas.join(", ")}</strong>
                </div>

                <div className="small-muted">
                  R$ {h.valor.toFixed(2)} • {h.data}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NavBottom />
    </div>
  );
}