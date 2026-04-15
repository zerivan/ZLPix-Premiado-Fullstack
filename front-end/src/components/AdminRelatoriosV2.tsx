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
  if (window.html2pdf) {
    return window.html2pdf;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar html2pdf.js"));
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
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
    if (!el) {
      return;
    }

    try {
      const html2pdfFactory = await garantirHtml2Pdf();
      if (!html2pdfFactory) {
        throw new Error("Biblioteca html2pdf indisponível");
      }

      await html2pdfFactory()
        .set({
          margin: 10,
          filename: `relatorio-financeiro-${ano}-${String(mes).padStart(2, "0")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .save();
    } catch (error) {
      console.error(error);
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

    return () => {
      window.clearInterval(interval);
    };
  }, [carregarRelatorio]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Relatórios Financeiros V2</h2>
          <p className="text-xs text-gray-500">Controle mensal com auditoria por usuário</p>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Mês</span>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="border rounded px-2 py-2 bg-white"
            >
              {meses.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="block text-xs text-gray-600 mb-1">Ano</span>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="border rounded px-2 py-2 bg-white"
            >
              {anosDisponiveis.map((anoItem) => (
                <option key={anoItem} value={anoItem}>
                  {anoItem}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={carregarRelatorio}
            className="bg-indigo-600 text-white px-3 py-2 rounded text-sm"
          >
            Atualizar relatório
          </button>

          <button
            onClick={baixarPDF}
            className="bg-emerald-600 text-white px-3 py-2 rounded text-sm"
          >
            Baixar PDF
          </button>
        </div>
      </div>

      {erro && <div className="text-sm text-red-600">{erro}</div>}

      <div id="relatorio" className="space-y-4">
        <section className="border rounded p-3">
          <h3 className="font-semibold mb-2">Resumo financeiro</h3>

          {loading && !data ? (
            <div className="text-sm text-gray-500 animate-pulse">Carregando resumo...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="border rounded p-3 bg-gray-50">
                <strong>Arrecadado</strong>
                <div>{formatMoeda(data?.resumo.arrecadado || 0)}</div>
              </div>
              <div className="border rounded p-3 bg-gray-50">
                <strong>Prêmios pagos</strong>
                <div>{formatMoeda(data?.resumo.premiosPagos || 0)}</div>
              </div>
              <div className="border rounded p-3 bg-gray-50">
                <strong>Saques pagos</strong>
                <div>{formatMoeda(data?.resumo.saquesPagos || 0)}</div>
              </div>
              <div className="border rounded p-3 bg-gray-50">
                <strong>Lucro líquido</strong>
                <div>{formatMoeda(data?.resumo.lucroLiquido || 0)}</div>
              </div>
            </div>
          )}
        </section>

        <section className="border rounded p-3 overflow-x-auto">
          <h3 className="font-semibold mb-2">Usuários</h3>
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-2 text-left">User ID</th>
                <th className="border px-2 py-2 text-left">Nome</th>
                <th className="border px-2 py-2 text-left">Gastou</th>
                <th className="border px-2 py-2 text-left">Sacou</th>
                <th className="border px-2 py-2 text-left">Ganhou</th>
              </tr>
            </thead>
            <tbody>
              {(data?.usuarios || []).map((usuario) => (
                <tr key={usuario.userId}>
                  <td className="border px-2 py-2">{usuario.userId}</td>
                  <td className="border px-2 py-2">{usuario.nome}</td>
                  <td className="border px-2 py-2">{formatMoeda(usuario.totalGasto)}</td>
                  <td className="border px-2 py-2">{formatMoeda(usuario.totalSacado)}</td>
                  <td className="border px-2 py-2">{formatMoeda(usuario.totalPremio)}</td>
                </tr>
              ))}
              {(!data?.usuarios || data.usuarios.length === 0) && (
                <tr>
                  <td colSpan={5} className="border px-2 py-3 text-center text-gray-500">
                    Nenhum movimento encontrado para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="border rounded p-3">
          <h3 className="font-semibold mb-2">Prêmios</h3>
          <ul className="space-y-2 text-sm">
            {(data?.premios || []).map((premio, idx) => (
              <li key={`${premio.userId}-${premio.data}-${idx}`} className="border rounded p-2 bg-gray-50">
                <span className="font-medium">{premio.nome}</span> ganhou {formatMoeda(premio.valor)}
                {premio.bilheteId ? ` no bilhete ${premio.bilheteId}` : " em prêmio sem bilhete vinculado"} —{" "}
                {new Date(premio.data).toLocaleString("pt-BR")}
              </li>
            ))}
            {(!data?.premios || data.premios.length === 0) && (
              <li className="text-gray-500">Nenhum prêmio pago no período selecionado.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
