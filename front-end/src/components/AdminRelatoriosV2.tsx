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
  const [atualizado, setAtualizado] = useState(false);

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
      setAtualizado(false);

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

      setAtualizado(true);
      setTimeout(() => setAtualizado(false), 2000);
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
          filename: `relatorio-${ano}-${String(mes).padStart(2, "0")}.pdf`,
        })
        .from(el)
        .save();
    } catch {
      setErro("Erro ao gerar PDF");
    }
  }

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <button
          onClick={carregarRelatorio}
          className={`px-3 py-2 rounded text-sm text-white ${
            loading ? "bg-gray-400" : "bg-indigo-600"
          }`}
        >
          {loading ? "Atualizando..." : "Atualizar relatório"}
        </button>

        <button
          onClick={baixarPDF}
          className="bg-emerald-600 text-white px-3 py-2 rounded text-sm"
        >
          Baixar PDF
        </button>
      </div>

      {atualizado && (
        <div className="text-green-600 text-xs font-semibold">
          ✔ Relatório atualizado
        </div>
      )}

      {erro && <div className="text-red-600 text-sm">{erro}</div>}

      {/* resto do arquivo permanece igual */}
    </div>
  );
}