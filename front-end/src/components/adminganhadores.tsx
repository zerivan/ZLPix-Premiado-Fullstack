import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";

type Ganhador = {
  userId: number;
  nome: string;
  dezenas: string;
  premio: number;
};

export default function AdminGanhadores() {
  const [ganhadores, setGanhadores] = useState<Ganhador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadGanhadores() {
    try {
      setLoading(true);
      setErro(null);

      const res = await adminApi.get("/api/admin/ganhadores");

      if (res.data?.ok) {
        setGanhadores(res.data.data || []);
      } else {
        setErro("Resposta inválida do servidor.");
      }
    } catch (e: any) {
      console.error("Erro ganhadores:", e);
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
      <div className="text-sm text-gray-500">
        Carregando ganhadores...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="text-sm text-red-600">
        {erro}
      </div>
    );
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
      <h2 className="text-lg font-semibold">
        Ganhadores do Sorteio
      </h2>

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