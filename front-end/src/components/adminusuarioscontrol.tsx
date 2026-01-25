import { useEffect, useState } from "react";
import axios from "axios";

type Usuario = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
};

export default function UsuariosControl() {
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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
            {/* 🔥 ID ADICIONADO */}
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

            <div className="text-xs text-gray-500">
              Cadastro: {new Date(u.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}