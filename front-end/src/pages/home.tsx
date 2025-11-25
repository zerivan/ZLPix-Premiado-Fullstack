import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-wrapper" style={{ paddingBottom: "90px" }}>
      <div className="page-card" style={{ paddingBottom: "40px" }}>

        {/* LOGO */}
        <div style={{ textAlign: "center" }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo"
            style={{
              width: "120px",
              margin: "0 auto",
              display: "block",
              marginBottom: "10px"
            }}
          />
        </div>

        {/* SEU SALDO */}
        <h2 className="page-title">Bem-vindo!</h2>
        <p className="page-subtitle">Acompanhe tudo sobre seus sorteios</p>

        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: "16px",
            padding: "14px 18px",
            marginBottom: "18px"
          }}
        >
          <p style={{ opacity: 0.8, fontSize: "14px" }}>Seu Saldo</p>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <p style={{ fontSize: "22px", fontWeight: "bold" }}>R$ 12,50</p>

            <button
              style={{
                background: "var(--gold)",
                color: "#222",
                padding: "8px 20px",
                borderRadius: "12px",
                fontWeight: "700",
                border: "none"
              }}
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* PRÓXIMO SORTEIO */}
        <div
          style={{
            background: "rgba(0,0,0,0.2)",
            borderRadius: "18px",
            padding: "20px",
            textAlign: "center",
            marginBottom: "20px"
          }}
        >
          <p style={{ color: "var(--gold)", fontSize: "13px", letterSpacing: 1 }}>Próximo Sorteio</p>

          <h3
            style={{
              fontSize: "42px",
              color: "white",
              fontWeight: "800",
              textShadow: "0px 3px 8px rgba(255,215,0,0.4)"
            }}
          >
            R$ 50.000
          </h3>

          <p style={{ opacity: 0.8, marginTop: "6px" }}>Termina em:</p>

          <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
            {[
              ["02", "Dias"],
              ["18", "Horas"],
              ["45", "Min"],
              ["33", "Seg"]
            ].map(([v, label], i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "10px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <p style={{ fontSize: "26px", fontWeight: "bold" }}>{v}</p>
                </div>
                <p style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <h3 className="page-title" style={{ fontSize: "20px", marginTop: "10px" }}>
          Como Funciona
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            {
              t: "Como participar?",
              d: "Adicione saldo, escolha suas dezenas e confirme sua aposta!"
            },
            {
              t: "Regulamento",
              d: "Baseado na Loteria Federal. Premiação paga via PIX."
            },
            {
              t: "Perguntas Frequentes",
              d: "Tire dúvidas sobre prêmios, pagamentos e segurança."
            }
          ].map((item, i) => (
            <details
              key={i}
              style={{
                background: "rgba(255,255,255,0.12)",
                padding: "12px 14px",
                borderRadius: "14px"
              }}
            >
              <summary style={{ fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                {item.t}
              </summary>

              <p style={{ marginTop: "10px", opacity: 0.8 }}>{item.d}</p>
            </details>
          ))}
        </div>
      </div>

      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.25)",
          padding: "12px 0",
          backdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "space-around"
        }}
      >
        <Link to="/" className="page-link" style={{ color: "var(--gold)" }}>
          Início
        </Link>

        <Link to="/bilhetes" className="page-link">
          Bilhetes
        </Link>

        <Link to="/resultados" className="page-link">
          Resultados
        </Link>

        <Link to="/perfil" className="page-link">
          Perfil
        </Link>
      </nav>
    </div>
  );
}