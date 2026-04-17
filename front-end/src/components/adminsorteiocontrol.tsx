import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type FederalData = {
  dataApuracao: string | null;
  premios: string[];
};

type BilheteElegivel = {
  id: number;
  dezenas: string;
  status?: string;
  apuradoEm?: string | null;
  sorteioData?: string;
  transacaoStatus?: string | null;
};

export default function AdminSorteioControl() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [dataSorteio, setDataSorteio] = useState("");

  const [carregandoPrevia, setCarregandoPrevia] = useState(false);
  const [federalData, setFederalData] = useState<FederalData | null>(null);
  const [bilhetesElegiveis, setBilhetesElegiveis] = useState<BilheteElegivel[]>([]);
  const [erroPrevia, setErroPrevia] = useState<string | null>(null);

  const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";

  function dentro7Dias(apuradoEm?: string | null) {
    if (!apuradoEm) return false;

    const data = new Date(apuradoEm);
    if (isNaN(data.getTime())) return false;

    const limite = new Date(data);
    limite.setDate(limite.getDate() + 7);

    return new Date() <= limite;
  }

  function mesmaData(sorteioData?: string, data?: string) {
    if (!sorteioData || !data) return false;
    return new Date(sorteioData).toISOString().slice(0, 10) === data;
  }

  useEffect(() => {
    void carregarPrevia();
  }, [dataSorteio]);

  async function carregarPrevia() {
    try {
      setCarregandoPrevia(true);
      setErroPrevia(null);
      setFederalData(null);
      setBilhetesElegiveis([]);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const [federal, bilhetesRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/federal`),
        axios.get(`${BASE_URL}/api/admin/ganhadores`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      ]);

      // Federal
      if (federal.data?.ok && federal.data?.data) {
        setFederalData({
          dataApuracao: federal.data.data.dataApuracao || null,
          premios: Array.isArray(federal.data.data.premios)
            ? federal.data.data.premios.slice(0, 5)
            : [],
        });
      }

      const lista = Array.isArray(bilhetesRes.data?.data)
        ? bilhetesRes.data.data
        : [];

      const bilhetesDaData = lista.filter((b: BilheteElegivel) =>
        mesmaData(b.sorteioData, dataSorteio)
      );

      // 🔥 PRÉ-SORTEIO
      const ativos = bilhetesDaData.filter(
        (b) =>
          b.status === "ATIVO" &&
          !b.apuradoEm &&
          b.transacaoStatus === "paid"
      );

      if (ativos.length > 0) {
        setBilhetesElegiveis(ativos);
        return;
      }

      // 🔥 PÓS-SORTEIO (com retenção de 7 dias)
      const historico = bilhetesDaData.filter(
        (b) => b.apuradoEm && dentro7Dias(b.apuradoEm)
      );

      setBilhetesElegiveis(historico);
    } catch (error) {
      console.error(error);
      setErroPrevia("❌ Erro ao carregar dados do sorteio.");
    } finally {
      setCarregandoPrevia(false);
    }
  }

  const podeDisparar = useMemo(() => {
    const temFederal = !!federalData && federalData.premios.length === 5;

    const temBilhetesAtivos = bilhetesElegiveis.some(
      (b) => b.status === "ATIVO" && !b.apuradoEm
    );

    return temFederal && temBilhetesAtivos && !loading;
  }, [federalData, bilhetesElegiveis, loading]);

  async function dispararSorteio() {
    const temFederal = !!federalData && federalData.premios.length === 5;

    const temBilhetesAtivos = bilhetesElegiveis.some(
      (b) => b.status === "ATIVO" && !b.apuradoEm
    );

    if (!temFederal) {
      setStatus("❌ Não foi possível obter resultado da Federal.");
      return;
    }

    if (!temBilhetesAtivos) {
      setStatus("❌ Não há bilhetes ATIVOS para apuração.");
      return;
    }

    const ok = confirm("Deseja realmente executar a apuração?");
    if (!ok) return;

    try {
      setLoading(true);
      setStatus(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
      if (!token) {
        setStatus("❌ Token admin ausente.");
        return;
      }

      const payload = {
        sorteioData: new Date(dataSorteio).toISOString(),
        premiosFederal: federalData!.premios,
      };

      const res = await axios.post(
        `${BASE_URL}/api/admin/apuracao/apurar`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.ok) {
        setStatus("✅ Apuração executada com sucesso.");
        await carregarPrevia();
      } else {
        setStatus("⚠️ Erro na resposta do servidor.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao executar a apuração.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-red-600">
        🎯 Apurar Sorteio (ADMIN)
      </h2>

      <input
        type="date"
        value={dataSorteio}
        onChange={(e) => setDataSorteio(e.target.value)}
        className="border px-2 py-1 rounded text-black"
      />

      <div className="text-sm space-y-1">
        <div>Data da extração: {federalData?.dataApuracao || "-"}</div>
        {federalData?.premios.map((p, i) => (
          <div key={i}>{i + 1}º prêmio: {p}</div>
        ))}
      </div>

      <div className="text-sm space-y-1">
        <div>Bilhetes:</div>
        {bilhetesElegiveis.map((b) => (
          <div key={b.id}>
            #{b.id} — {b.dezenas}
            {b.status && ` — ${b.status}`}
          </div>
        ))}
      </div>

      <button
        onClick={dispararSorteio}
        disabled={!podeDisparar}
        className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processando..." : "DISPARAR"}
      </button>

      {status && <div>{status}</div>}
    </div>
  );
}