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
      const dezenaInicial = milhar.slice(0, 2);
      const dezenaFinal = milhar.slice(2, 4);

      return [dezenaInicial, dezenaFinal];
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

    if (linhasBilhetes.length === 0) {
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
        bilhetes.push({
          id,
          dezenas: dezenasStr,
          status: "PREMIADO",
        });
      } else {
        bilhetes.push({
          id,
          dezenas: dezenasStr,
          status: "NAO_PREMIADO",
        });
      }
    }

    const premioIndividual =
      idsPremiados.length > 0
        ? premioTotal / idsPremiados.length
        : 0;

    setResultado({
      dezenasValidas,
      bilhetes,
      premioTotal,
      premioIndividual,
    });
  }

  const totalPremiados =
    resultado?.bilhetes.filter((b) => b.status === "PREMIADO").length || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        Motor de Conferência Manual
      </h2>

      <div>
        <p className="text-sm font-medium">
          Lista de Bilhetes (id;dezenas)
        </p>
        <textarea
          value={listaBilhetes}
          onChange={(e) => setListaBilhetes(e.target.value)}
          className="w-full h-40 p-2 border rounded text-xs"
          placeholder="12;59,36,80"
        />
      </div>

      <div>
        <p className="text-sm font-medium">
          Resultado da Federal (5 números)
        </p>
        <textarea
          value={resultadoFederal}
          onChange={(e) => setResultadoFederal(e.target.value)}
          className="w-full h-32 p-2 border rounded text-xs"
          placeholder="009593"
        />
      </div>

      <div>
        <p className="text-sm font-medium">
          Valor total do prêmio (R$)
        </p>
        <input
          type="text"
          value={valorPremio}
          onChange={(e) => setValorPremio(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          placeholder="1000.00"
        />
      </div>

      <button
        type="button"
        onClick={conferir}
        className="px-4 py-2 bg-green-600 text-white rounded text-sm"
      >
        Disparar Sorteio Manual
      </button>

      {resultado && (
        <div className="border-t pt-4 space-y-3 text-sm">
          <div>
            <strong>Dezenas válidas:</strong>{" "}
            {resultado.dezenasValidas.join(", ")}
          </div>

          <div>
            <strong>Total de ganhadores:</strong>{" "}
            {totalPremiados}
          </div>

          <div>
            <strong>Prêmio total:</strong>{" "}
            R$ {resultado.premioTotal.toFixed(2)}
          </div>

          <div>
            <strong>Prêmio individual:</strong>{" "}
            R$ {resultado.premioIndividual.toFixed(2)}
          </div>

          <div className="border-t pt-2 space-y-1">
            <strong>Resultado completo:</strong>
            {resultado.bilhetes.map((b) => (
              <div key={b.id}>
                #{b.id} — {b.dezenas} —{" "}
                {b.status === "PREMIADO"
                  ? `PREMIADO (R$ ${resultado.premioIndividual.toFixed(2)})`
                  : "NAO_PREMIADO"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}