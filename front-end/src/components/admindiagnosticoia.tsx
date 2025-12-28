import { useEffect, useState } from "react";
import axios from "axios";

type Diagnostico = {
  status: "ok" | "alerta" | "erro";
  mensagem: string;
};

const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";

export default function AdminDiagnosticoIA() {
  const [status, setStatus] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function executarDiagnostico() {
      const resultados: Diagnostico[] = [];

      // 1️⃣ Backend online
      try {
        await axios.get(`${BASE_URL}/`);
        resultados.push({
          status: "ok",
          mensagem: "Backend online e respondendo",
        });
      } catch {
        resultados.push({
          status: "erro",
          mensagem: "Backend não está respondendo",
        });
      }

      // 2️⃣ API Federal
      try {
        const r = await axios.get(`${BASE_URL}/api/federal`);
        if (r.data?.ok) {
          resultados.push({
            status: "ok",
            mensagem: "API da Loteria Federal respondendo",
          });
        } else {
          resultados.push({
            status: "alerta",
            mensagem: "API Federal respondeu, mas sem dados válidos",
          });
        }
      } catch {
        resultados.push({
          status: "erro",
          mensagem: "Falha ao acessar API da Loteria Federal",
        });
      }

      // 3️⃣ Prêmio atual
      try {
        const r = await axios.get(
          `${BASE_URL}/api/admin/cms/public/premio`
        );
        if (r.data?.ok) {
          resultados.push({
            status: "ok",
            mensagem: `Prêmio atual carregado: R$ ${r.data.premio}`,
          });
        } else {
          resultados.push({
            status: "alerta",
            mensagem: "Prêmio não encontrado, usando valor padrão",
          });
        }
      } catch {
        resultados.push({
          status: "alerta",
          mensagem: "Endpoint de prêmio público indisponível",
        });
      }

      // 4️⃣ Configurações do sistema
      try {
        const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
        if (token) {
          const r = await axios.get(
            `${BASE_URL}/api/admin/configuracoes`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (r.data?.ok) {
            resultados.push({
              status: "ok",
              mensagem: "Configurações do sistema carregadas",
            });
          } else {
            resultados.push({
              status: "alerta",
              mensagem: "Configurações existem, mas retorno inválido",
            });
          }
        } else {
          resultados.push({
            status: "alerta",
            mensagem: "Token admin ausente (configurações não verificadas)",
          });
        }
      } catch {
        resultados.push({
          status: "erro",
          mensagem: "Erro ao acessar configurações do sistema",
        });
      }

      // 5️⃣ CMS básico
      try {
        const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
        if (token) {
          const r = await axios.get(`${BASE_URL}/api/admin/cms`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (r.data?.ok && Array.isArray(r.data.data)) {
            resultados.push({
              status: "ok",
              mensagem: "CMS carregado com sucesso",
            });
          } else {
            resultados.push({
              status: "alerta",
              mensagem: "CMS respondeu, mas sem conteúdos",
            });
          }
        }
      } catch {
        resultados.push({
          status: "alerta",
          mensagem: "CMS indisponível ou com erro",
        });
      }

      setStatus(resultados);
      setLoading(false);
    }

    executarDiagnostico();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Executando diagnóstico inteligente do sistema...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Diagnóstico Inteligente do Sistema
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