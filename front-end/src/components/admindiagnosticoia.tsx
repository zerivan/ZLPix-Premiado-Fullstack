import { useEffect, useState } from "react";

type Diagnostico = {
  status: "ok" | "alerta" | "erro";
  mensagem: string;
};

export default function AdminDiagnosticoIA() {
  const [status, setStatus] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔎 Diagnóstico SIMULADO (painel não mexe no fluxo)
    setTimeout(() => {
      setStatus([
        {
          status: "ok",
          mensagem: "Backend online e respondendo",
        },
        {
          status: "ok",
          mensagem: "Banco de dados acessível",
        },
        {
          status: "alerta",
          mensagem:
            "Regra de ganhadores precisa ser revisada (bilhetes marcados como premiados)",
        },
      ]);

      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Executando diagnóstico do sistema...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Diagnóstico do Sistema
      </h2>

      <div className="space-y-2">
        {status.map((item, i) => (
          <div
            key={i}
            className={`rounded border p-3 text-sm ${
              item.status === "ok"
                ? "bg-green-50 border-green-300 text-green-800"
                : item.status === "alerta"
                ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {item.mensagem}
          </div>
        ))}
      </div>
    </div>
  );
}