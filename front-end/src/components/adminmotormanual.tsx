import { useState } from "react";

type BilheteResultado = {
  id: number;
  dezenas: string;
  status: "PREMIADO" | "NAO_PREMIADO";
};

type Resultado = {
  dezenasValidas: string[];
  bilhetes: BilheteResultado[];
  premioTotal: number;
  premioIndividual: number;
};

export default function AdminMotorManual() {
  const [listaBilhetes, setListaBilhetes] = useState("");
  const [resultadoFederal, setResultadoFederal] = useState("");
  const [valorPremio, setValorPremio] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function extrairDezenasValidas(numeros: string[]): string[] {
    const dezenas = numeros.flatMap((numero) => {
      const n = numero.trim();
      if (!/^\d{5,6}$/.test(n)) return [];

      const milhar = n.slice(-4);
      return [milhar.slice(0, 2), milhar.slice(2, 4)];
    });

    return Array.from(new Set(dezenas));
  }

  function normalizarNumerosFederal(input: string): string[] {
    return input
      .split(/[\n,;\s]+/)
      .map((n) => n.trim())
      .filter((n) => /^\d{5,6}$/.test(n));
  }

  function conferir() {
    setResultado(null);

    const linhasBilhetes = listaBilhetes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!linhasBilhetes.length) {
      alert("Informe ao menos um bilhete.");
      return;
    }

    const numerosFederal = normalizarNumerosFederal(resultadoFederal);

    if (numerosFederal.length !== 5) {
      alert("Informe exatamente 5 números válidos da Federal.");
      return;
    }

    const premioTotal = Number(valorPremio.replace(",", "."));

    if (!premioTotal || premioTotal <= 0) {
      alert("Informe um valor de prêmio válido.");
      return;
    }

    const dezenasValidas = extrairDezenasValidas(numerosFederal);

    const bilhetes: BilheteResultado[] = [];
    const idsPremiados: number[] = [];

    for (const linha of linhasBilhetes) {
      const partes = linha.split(";");
      if (partes.length !== 2) continue;

      const id = Number(partes[0].trim());
      const dezenasStr = partes[1].trim();

      if (!id || !dezenasStr) continue;

      const dezenasBilhete = dezenasStr
        .split(",")
        .map((d) => d.trim())
        .filter((d) => /^\d{2}$/.test(d));

      const premiado =
        dezenasBilhete.length === 3 &&
        dezenasBilhete.every((d) => dezenasValidas.includes(d));

      if (premiado) {
        idsPremiados.push(id);
        bilhetes.push({ id, dezenas: dezenasStr, status: "PREMIADO" });
      } else {
        bilhetes.push({ id, dezenas: dezenasStr, status: "NAO_PREMIADO" });
      }
    }

    const premioIndividual =
      idsPremiados.length > 0
        ? premioTotal / idsPremiados.length
        : 0;

    const resultadoFinal = {
      dezenasValidas,
      bilhetes,
      premioTotal,
      premioIndividual,
    };

    setResultado(resultadoFinal);

    // 🔥 LIMPAR CAMPOS AUTOMÁTICO
    setListaBilhetes("");
    setResultadoFederal("");
    setValorPremio("");
  }

  function baixarResultado() {
    if (!resultado) return;

    const data = new Date().toISOString().slice(0, 10);

    const linhas = resultado.bilhetes.map((b) => {
      return `${b.id};${b.dezenas};${b.status}`;
    });

    const conteudo = [
      `DATA: ${data}`,
      `PREMIO_TOTAL: ${resultado.premioTotal}`,
      `PREMIO_INDIVIDUAL: ${resultado.premioIndividual}`,
      "",
      ...linhas,
    ].join("\n");

    const blob = new Blob([conteudo], {
      type: "text/plain;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `resultado-${data}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const totalPremiados =
    resultado?.bilhetes.filter((b) => b.status === "PREMIADO").length || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        Motor de Conferência Manual
      </h2>

      <textarea
        value={listaBilhetes}
        onChange={(e) => setListaBilhetes(e.target.value)}
        className="w-full h-40 p-2 border rounded text-xs"
        placeholder="1;67,53,47"
      />

      <textarea
        value={resultadoFederal}
        onChange={(e) => setResultadoFederal(e.target.value)}
        className="w-full h-32 p-2 border rounded text-xs"
        placeholder="67547"
      />

      <input
        type="text"
        value={valorPremio}
        onChange={(e) => setValorPremio(e.target.value)}
        className="w-full p-2 border rounded text-sm"
        placeholder="1000.00"
      />

      <div className="flex gap-2">
        <button
          onClick={conferir}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm"
        >
          Disparar Sorteio Manual
        </button>

        {/* 🔥 NOVO BOTÃO */}
        <button
          onClick={baixarResultado}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Baixar Resultado
        </button>
      </div>

      {resultado && (
        <div className="text-sm space-y-2">
          <div>Ganhadores: {totalPremiados}</div>
          <div>Prêmio individual: R$ {resultado.premioIndividual.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}