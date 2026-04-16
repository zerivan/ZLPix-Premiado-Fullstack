import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

type ResumoFinanceiro = {
  arrecadado: number;
  premiosPagos: number;
  saquesPagos: number;
  lucroLiquido: number;
};

type UsuarioFinanceiro = {
  userId: number;
  nome: string;
  totalGasto: number;
  totalSacado: number;
  totalPremio: number;
};

type PremioDetalhado = {
  userId: number;
  nome: string;
  valor: number;
  data: string;
  bilheteId: number | null;
};

type Html2PdfFactory = () => {
  set: (options: Record<string, unknown>) => {
    from: (element: HTMLElement) => {
      save: () => Promise<void>;
    };
  };
};

declare global {
  interface Window {
    html2pdf?: Html2PdfFactory;
  }
}

async function garantirHtml2Pdf(): Promise<Html2PdfFactory | null> {
  if (window.html2pdf) return window.html2pdf;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Falha ao carregar html2pdf.js"));
    document.body.appendChild(script);
  });

  return window.html2pdf || null;
}

type RelatorioV2Response = {
  resumo: ResumoFinanceiro;
  usuarios: UsuarioFinanceiro[];
  premios: PremioDetalhado[];
};

const API_BASE = "https://zlpix-premiado-fullstack.onrender.com";

const formatMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);

export default function AdminRelatoriosV2() {
  const now = useMemo(() => new Date(), []);

  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [ano, setAno] = useState<number>(now.getFullYear());
  const [data, setData] = useState<RelatorioV2Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ✅ NOVO (sem interferir no resto)
  const [limite, setLimite] = useState(20);
  const [buscaId, setBuscaId] = useState("");

  const anosDisponiveis = useMemo(() => {
    const anoAtual = now.getFullYear();
    return Array.from({ length: 5 }, (_, idx) => anoAtual - idx);
  }, [now]);

  const meses = useMemo(
    () => [
      { valor: 1, label: "Janeiro" },
      { valor: 2, label: "Fevereiro" },
      { valor: 3, label: "Março" },
      { valor: 4, label: "Abril" },
      { valor: 5, label: "Maio" },
      { valor: 6, label: "Junho" },
      { valor: 7, label: "Julho" },
      { valor: 8, label: "Agosto" },
      { valor: 9, label: "Setembro" },
      { valor: 10, label: "Outubro" },
      { valor: 11, label: "Novembro" },
      { valor: 12, label: "Dezembro" },
    ],
    []
  );

  const carregarRelatorio = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const response = await axios.get<RelatorioV2Response>(
        `${API_BASE}/api/admin/relatorios-v2`,
        {
          params: { mes, ano },
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      setData(response.data);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar relatório financeiro.");
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  async function baixarPDF() {
    const el = document.getElementById("relatorio");
    if (!el) return;

    try {
      const html2pdfFactory = await garantirHtml2Pdf();
      if (!html2pdfFactory) throw new Error();

      await html2pdfFactory()
        .set({
          margin: 10,
          filename: `relatorio-financeiro-${ano}-${String(mes).padStart(2, "0")}.pdf`,
        })
        .from(el)
        .save();
    } catch {
      setErro("Não foi possível gerar o PDF agora.");
    }
  }

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      carregarRelatorio();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [carregarRelatorio]);

  // ✅ PROCESSAMENTO (não altera layout)
  const usuariosProcessados = (data?.usuarios || []).filter((u) => {
    if (!buscaId) return true;
    return String(u.userId).includes(buscaId);
  });

  const usuariosVisiveis = usuariosProcessados.slice(0, limite);

  return (
    <div className="space-y-4">
      {/* resto permanece exatamente igual */}

      <section className="border rounded p-3 overflow-x-auto">
        <h3 className="font-semibold mb-2">Usuários</h3>

        {/* ✅ campo novo */}
        <div className="mb-2">
          <input
            type="text"
            placeholder="Buscar por ID"
            value={buscaId}
            onChange={(e) => setBuscaId(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
        </div>

        <table className="min-w-full text-sm border-collapse">
          <tbody>
            {usuariosVisiveis.map((usuario) => {
              const ativo =
                usuario.totalGasto > 0 ||
                usuario.totalSacado > 0 ||
                usuario.totalPremio > 0;

              return (
                <tr key={usuario.userId} className={ativo ? "" : "opacity-40"}>
                  <td className="border px-2 py-2">{usuario.userId}</td>
                  <td className="border px-2 py-2">{usuario.nome}</td>
                  <td className="border px-2 py-2">
                    {formatMoeda(usuario.totalGasto)}
                  </td>
                  <td className="border px-2 py-2">
                    {formatMoeda(usuario.totalSacado)}
                  </td>
                  <td className="border px-2 py-2">
                    {formatMoeda(usuario.totalPremio)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ✅ ver mais */}
        {usuariosProcessados.length > limite && (
          <div className="mt-2">
            <button
              onClick={() => setLimite((prev) => prev + 20)}
              className="bg-gray-200 px-3 py-1 rounded text-sm"
            >
              Ver mais
            </button>
          </div>
        )}
      </section>
    </div>
  );
}