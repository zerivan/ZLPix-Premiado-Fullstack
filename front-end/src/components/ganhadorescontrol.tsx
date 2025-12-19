import { useEffect, useState } from "react";
import { api } from "../api/client";

type Ganhador = {
  id: number;
  dezenas: string;
  valor: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

export default function GanhadoresControl() {
  const [data, setData] = useState<Ganhador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadGanhadores() {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/ganhadores");

      if (res.data?.ok) {
        setData(res.data.data || []);
      }
    } catch {
      setErro("Erro ao carregar ganhadores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGanhadores();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando ganhadores...
      </div>
    );
  }

  if (erro) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Ganhadores</h2>

      {data.length === 0 && (
        <div className="text-sm text-gray-500">
          Nenhum ganhador registrado ainda.
        </div>
      )}

      <div className="space-y-2">
        {data.map((g) => (
          <div
            key={g.id}
            className="rounded border p-3 text-sm space-y-1"
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
              {new Date(g.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}