import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type FederalData = {
  dataApuracao: string | null;
  premios: string[];
};

type BilheteElegivel = {
  id: number;
  dezenas: string;
  sorteioData?: string;
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

  // 🔒 VALIDAÇÃO NOVA (CIRÚRGICA)
  function validarPremiosFederal(premios: string[]): boolean {
    if (!Array.isArray(premios) || premios.length !== 5) return false;
    return premios.every((p) => /^\d{5,6}$/.test(String(p)));
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

      const federal = await axios.get(`${BASE_URL}/api/federal`);

      if (federal.data?.ok && federal.data?.data) {
        setFederalData({
          dataApuracao: federal.data.data.dataApuracao || null,
          premios: Array.isArray(federal.data.data.premios)
            ? federal.data.data.premios.slice(0, 5)
            : [],
        });
      }

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
      if (!token) {
        setErroPrevia("❌ Token admin ausente para carregar bilhetes elegíveis.");
        return;
      }

      const ganhadores = await axios.get(`${BASE_URL}/api/admin/ganhadores`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log("GANHADORES", ganhadores.data);

      const dataSelecionada = dataSorteio ? new Date(dataSorteio) : null;
      if (dataSelecionada) {
        dataSelecionada.setHours(0, 0, 0, 0);
      }

      const elegiveis = Array.isArray(ganhadores.data?.data)
        ? ganhadores.data.data.filter((b: any) => {
            if (b.status !== "ATIVO") return false;
            if (b.apuradoEm) return false;
            if (!b.sorteioData) return false;

            if (!dataSelecionada) return true;

            const dataBilhete = new Date(b.sorteioData);
            dataBilhete.setHours(0, 0, 0, 0);

            return dataBilhete.getTime() === dataSelecionada.getTime();
          })
        : [];

      setBilhetesElegiveis(
        elegiveis.map((b: any) => ({
          id: Number(b.id),
          dezenas: String(b.dezenas || ""),
          sorteioData: b.sorteioData ? String(b.sorteioData) : undefined,
        }))
      );

      if (elegiveis.length === 0) {
        setErroPrevia("⚠️ Nenhum bilhete elegível encontrado para os critérios atuais.");
      }
    } catch (error) {
      console.error(error);
      setErroPrevia("❌ Erro ao carregar resultado da Federal.");
    } finally {
      setCarregandoPrevia(false);
    }
  }

  const podeDisparar = useMemo(() => {
    const temFederal =
      !!federalData && validarPremiosFederal(federalData.premios);
    const temBilhetes = bilhetesElegiveis.length > 0;
    return temFederal && temBilhetes && !loading;
  }, [federalData, bilhetesElegiveis.length, loading]);

  async function dispararSorteio() {
    const temFederal =
      !!federalData && validarPremiosFederal(federalData.premios);
    const temBilhetes = bilhetesElegiveis.length > 0;

    if (!temFederal) {
      setStatus("❌ Resultado da Federal inválido.");
      return;
    }

    if (!temBilhetes) {
      setStatus(
        "❌ Não há bilhetes elegíveis disponíveis para apuração com os critérios exigidos."
      );
      return;
    }

    const ok = confirm(
      "⚠️ ATENÇÃO!\n\n" +
        "Esta ação irá:\n" +
        "- Apurar os bilhetes\n" +
        "- Identificar ganhadores\n" +
        "- Distribuir prêmios\n" +
        "- Creditar carteiras\n\n" +
        "Essa ação NÃO PODE ser desfeita.\n\n" +
        "Deseja continuar?"
    );

    if (!ok) return;

    try {
      setLoading(true);
      setStatus(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
      if (!token) {
        setStatus("❌ Token admin ausente.");
        return;
      }

      const dataFinal = dataSorteio
        ? new Date(dataSorteio).toISOString()
        : new Date().toISOString();

      const payload = {
        sorteioData: dataFinal,
        premiosFederal: federalData.premios,
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
      } else {
        setStatus(
          `⚠️ ${res.data?.error || "Resposta inesperada do servidor."}`
        );
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

      <p className="text-sm text-gray-600">
        Esta ação executa a APURAÇÃO REAL:
        <br />• Cruza bilhetes
        <br />• Marca premiados
        <br />• Credita carteiras
      </p>

      <input
        type="date"
        value={dataSorteio}
        onChange={(e) => setDataSorteio(e.target.value)}
        className="border px-2 py-1 rounded text-black"
      />

      <div className="text-sm text-gray-700 space-y-1">
        <div className="font-semibold">Resultado da Federal:</div>
        {federalData ? (
          <>
            <div>
              Data da extração:{" "}
              {federalData.dataApuracao
                ? new Date(federalData.dataApuracao).toLocaleDateString("pt-BR")
                : "N/D"}
            </div>
            {federalData.premios.map((premio, index) => (
              <div key={`${premio}-${index}`}>
                {index + 1}º prêmio: {premio}
              </div>
            ))}
          </>
        ) : (
          <div>Sem resultado disponível.</div>
        )}
      </div>

      <div className="text-sm text-gray-700 space-y-1">
        <div className="font-semibold">Bilhetes que participarão do sorteio:</div>
        {bilhetesElegiveis.length > 0 ? (
          bilhetesElegiveis.map((bilhete) => (
            <div key={bilhete.id}>
              ID #{bilhete.id} — dezenas: {bilhete.dezenas}
            </div>
          ))
        ) : (
          <div>Nenhum bilhete elegível encontrado.</div>
        )}
      </div>

      {carregandoPrevia && (
        <div className="text-xs text-gray-500">Carregando prévia...</div>
      )}

      {erroPrevia && <div className="text-xs text-amber-700">{erroPrevia}</div>}

      <button
        onClick={dispararSorteio}
        disabled={!podeDisparar}
        className="bg-red-600 text-white px-4 py-2 rounded font-bold disabled:opacity-60"
      >
        {loading ? "Processando..." : "🔴 DISPARAR APURAÇÃO"}
      </button>

      {status && <div className="text-sm font-semibold">{status}</div>}
    </div>
  );
}