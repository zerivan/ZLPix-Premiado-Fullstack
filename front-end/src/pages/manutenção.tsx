import { useEffect } from "react";

export default function Manutencao() {
  useEffect(() => {
    document.title = "Em manutenção - ZLPix";
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-card" style={{ textAlign: "center" }}>
        <h1 className="page-title">🚧 Em manutenção</h1>

        <p className="page-subtitle" style={{ marginTop: 10 }}>
          Estamos realizando ajustes no sistema.
        </p>

        <p
          style={{
            marginTop: 8,
            fontSize: "0.9rem",
            color: "#ccc",
          }}
        >
          Tente novamente em alguns minutos.
        </p>
      </div>
    </div>
  );
}