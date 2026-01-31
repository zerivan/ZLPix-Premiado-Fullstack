import { useEffect, useState } from "react";
import axios from "axios";

type Ganhador = {
  id: number;
  userId: number;
  nome: string;
  dezenas: string;
  premio: number;
  status: string;
};

export default function AdminGanhadores() {
  const [ganhadores, setGanhadores] = useState<Ganhador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadGanhadores() {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await axios.get(
        "https://zlpix-premiado-fullstack.onrender.com/api/admin/ganhadores",
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

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

  function copiarLista() {
    const texto = ganhadores
      .map((g) => `${g.id};${g.dezenas}`)
      .join("\n");

    navigator.clipboard.writeText(texto);
  }

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
        Nenhum bilhete apurado neste sorteio.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Resultado do Sorteio
      </h2>

      <button
        onClick={copiarLista}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
      >
        Copiar lista numérica
      </button>

      <div className="space-y-3">
        {ganhadores.map((g) => (
          <div
            key={g.id}
            className="rounded border bg-gray-50 p-3 text-sm space-y-1"
          >
            <div>
              <strong>Usuário:</strong> #{g.userId} — {g.nome}
            </div>

            <div>
              <strong>Dezenas:</strong> {g.dezenas}
            </div>

            <div>
              <strong>Status:</strong> {g.status}
            </div>

            <div>
              <strong>Prêmio:</strong> R$ {Number(g.premio || 0).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}