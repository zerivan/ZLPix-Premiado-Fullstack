import { useEffect, useState } from "react";

type Ganhador = {
  userId: number;
  nome: string;
  dezenas: string;
  premio: number;
};

function adminHeaders() {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function AdminGanhadores() {
  const [ganhadores, setGanhadores] = useState<Ganhador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadGanhadores() {
    try {
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/admin/ganhadores",
        { headers: adminHeaders() }
      );

      if (!res.ok) {
        throw new Error("Erro ao buscar ganhadores");
      }

      const json = await res.json();
      setGanhadores(json.data || []);
    } catch (e: any) {
      setErro(e.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGanhadores();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando ganhadores...</div>;
  }

  if (erro) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  if (ganhadores.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        Nenhum ganhador registrado neste sorteio.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ganhadores do Sorteio</h2>

      <div className="space-y-3">
        {ganhadores.map((g, i) => (
          <div
            key={i}
            className="rounded border bg-gray-50 p-3 text-sm space-y-1"
          >
            <div>
              <strong>Usuário:</strong> #{g.userId} — {g.nome}
            </div>

            <div>
              <strong>Dezenas:</strong> {g.dezenas}
            </div>

            <div>
              <strong>Prêmio:</strong> R$ {g.premio.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}