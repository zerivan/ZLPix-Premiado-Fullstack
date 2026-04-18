import { useEffect, useState } from "react";
import axios from "axios";

type Usuario = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  pixKey?: string; // ✅ ADICIONADO
  createdAt: string;
};

export default function UsuariosControl() {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [total, setTotal] = useState<number>(0);
  const [buscaId, setBuscaId] = useState<string>("");

  async function loadUsuarios() {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await axios.get(
        "https://zlpix-premiado-fullstack.onrender.com/api/admin/usuarios",
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      if (res.data?.ok) {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
      } else {
        setErro("Resposta inválida do servidor.");
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarPorId() {
    if (!buscaId) return;

    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await axios.get(
        `https://zlpix-premiado-fullstack.onrender.com/api/admin/usuarios?id=${buscaId}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      if (res.data?.ok) {
        setData(res.data.data || []);
      } else {
        setErro("Usuário não encontrado.");
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao buscar usuário.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando usuários...
      </div>
    );
  }

  if (erro) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Usuários</h2>

      <div className="text-sm text-gray-500">
        Total de usuários: <strong>{total}</strong>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Buscar por ID"
          value={buscaId}
          onChange={(e) => setBuscaId(e.target.value)}
          className="flex-1 border rounded px-2 py-1 text-black"
        />

        <button
          onClick={buscarPorId}
          className="bg-blue-600 text-white px-3 rounded"
        >
          Buscar
        </button>

        <button
          onClick={loadUsuarios}
          className="bg-gray-500 text-white px-3 rounded"
        >
          Resetar
        </button>
      </div>

      {data.length === 0 && (
        <div className="text-sm text-gray-500">
          Nenhum usuário encontrado.
        </div>
      )}

      <div className="space-y-2">
        {data.map((u) => (
          <div
            key={u.id}
            className="rounded border p-3 text-sm space-y-1"
          >
            <div>
              <strong>ID:</strong> {u.id}
            </div>

            <div>
              <strong>Nome:</strong> {u.name}
            </div>

            <div>
              <strong>Email:</strong> {u.email}
            </div>

            {u.phone && (
              <div>
                <strong>Telefone:</strong> {u.phone}
              </div>
            )}

            <div>
              <strong>Chave PIX:</strong> {u.pixKey ?? "Não informado"}
            </div>

            <div className="text-xs text-gray-500">
              Cadastro: {new Date(u.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}