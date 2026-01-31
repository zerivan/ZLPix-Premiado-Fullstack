import { useState } from "react";

type Resultado = {
  dezenasValidas: string[];
  ganhadores: number[];
  valorPorGanhador: number;
};

export default function AdminMotorManual() {
  const [listaBilhetes, setListaBilhetes] = useState("");
  const [resultadoFederal, setResultadoFederal] = useState("");
  const [premioTotal, setPremioTotal] = useState("");
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
    const linhasBilhetes = listaBilhetes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const numerosFederal = normalizarNumerosFederal(resultadoFederal);

    if (numerosFederal.length !== 5) {
      alert("Informe exatamente 5 números válidos da Federal.");
      return;
    }

    const dezenasValidas = extrairDezenasValidas(numerosFederal);

    const ganhadores: number[] = [];

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

      if (
        dezenasBilhete.length === 3 &&
        dezenasBilhete.every((d) => dezenasValidas.includes(d))
      ) {
        ganhadores.push(id);
      }
    }

    const premioNumero = Number(premioTotal.replace(",", "."));
    const valorPorGanhador =
      ganhadores.length > 0 && premioNumero > 0
        ? premioNumero / ganhadores.length
        : 0;

    setResultado({
      dezenasValidas,
      ganhadores,
      valorPorGanhador,
    });
  }

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
          Prêmio Total (R$)
        </p>
        <input
          type="text"
          value={premioTotal}
          onChange={(e) => setPremioTotal(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          placeholder="500"
        />
      </div>

      <button
        onClick={conferir}
        className="px-4 py-2 bg-green-600 text-white rounded text-sm"
      >
        Conferir Sorteio
      </button>

      {resultado && (
        <div className="border-t pt-4 space-y-2 text-sm">
          <div>
            <strong>Dezenas válidas:</strong>{" "}
            {resultado.dezenasValidas.join(", ")}
          </div>

          <div>
            <strong>Total de ganhadores:</strong>{" "}
            {resultado.ganhadores.length}
          </div>

          <div>
            <strong>Valor por ganhador:</strong>{" "}
            R$ {resultado.valorPorGanhador.toFixed(2)}
          </div>

          <div>
            <strong>IDs premiados:</strong>{" "}
            {resultado.ganhadores.length
              ? resultado.ganhadores.join(", ")
              : "Nenhum"}
          </div>
        </div>
      )}
    </div>
  );
}