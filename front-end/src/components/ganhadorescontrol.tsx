import { useEffect, useState } from "react";

type Ganhador = {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  dezenas: string;
  valor: number;
  sorteioData: string;
  createdAt: string;
};

function adminHeaders() {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function GanhadoresControl() {
  const [ganhadores, setGanhadores] = useState<Ganhador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadGanhadores() {
    try {
      setLoading(true);
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/admin/ganhadores",
        { headers: adminHeaders() }
      );

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json?.erro || "Erro ao carregar ganhadores");
      }

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
        Nenhum ganhador registrado até o momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ganhadores</h2>

      <div className="space-y-3">
        {ganhadores.map((g) => (
          <div
            key={g.id}
            className="rounded-lg border p-3 bg-gray-50 text-sm space-y-1"
          >
            <div>
              <strong>Usuário:</strong> {g.user.name} ({g.user.email})
            </div>

            <div>
              <strong>Dezenas:</strong> {g.dezenas}
            </div>

            <div>
              <strong>Valor:</strong> R$ {g.valor.toFixed(2)}
            </div>

            <div className="text-xs text-gray-500">
              Sorteio:{" "}
              {new Date(g.sorteioData).toLocaleDateString("pt-BR")} •
              Registrado em{" "}
              {new Date(g.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}