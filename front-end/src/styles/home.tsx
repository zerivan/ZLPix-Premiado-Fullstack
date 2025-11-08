import React, { useState } from "react";
import { NumeroButton } from "../components/NumeroButton";
import { BilheteCard } from "../components/BilheteCard";

export default function Home() {
  const [selecionadas, setSelecionadas] = useState<number[]>([]);

  const toggleNumero = (numero: number) => {
    if (selecionadas.includes(numero)) {
      setSelecionadas(selecionadas.filter((n) => n !== numero));
    } else if (selecionadas.length < 3) {
      setSelecionadas([...selecionadas, numero]);
    }
  };

  const gerarAutomatico = () => {
    const numeros: number[] = [];
    while (numeros.length < 3) {
      const n = Math.floor(Math.random() * 100);
      if (!numeros.includes(n)) numeros.push(n);
    }
    setSelecionadas(numeros);
  };

  const limpar = () => setSelecionadas([]);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gold mb-4">ZLPix Premiado 💰</h1>

      <div className="grid grid-cols-10 gap-2 max-w-md">
        {Array.from({ length: 100 }, (_, i) => (
          <NumeroButton
            key={i}
            numero={i}
            selecionado={selecionadas.includes(i)}
            onClick={() => toggleNumero(i)}
          />
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={gerarAutomatico}
          className="bg-gold text-black px-4 py-2 rounded font-bold hover:bg-yellow-400"
        >
          Gerar Automático
        </button>
        <button
          onClick={limpar}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Limpar
        </button>
      </div>

      {selecionadas.length === 3 && <BilheteCard dezenas={selecionadas} />}
    </div>
  );
        }
