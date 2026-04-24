import { useEffect, useState } from "react";
import axios from "axios";

type Bilhete = {
id?: number;
dezenas: string;
status?: string;
};

type Usuario = {
userId?: number;
nome?: string;
bilhetes: Bilhete[];
};

function extrairUsuarios(data: any): Usuario[] {
// aceita múltiplos formatos sem quebrar contrato existente
if (Array.isArray(data?.usuarios)) return data.usuarios;
if (Array.isArray(data?.ganhadores)) return data.ganhadores;
if (Array.isArray(data?.data)) return data.data;
if (Array.isArray(data)) return data;

return [];
}

export default function AdminGanhadores() {
const [usuarios, setUsuarios] = useState<Usuario[]>([]);
const [listaTexto, setListaTexto] = useState("");

useEffect(() => {
carregar();
}, []);

async function carregar() {
try {
const res = await axios.get("/admin/ganhadores");

  const lista = extrairUsuarios(res.data);

  setUsuarios(lista);
  gerarLista(lista);

  console.log("GANHADORES RAW:", res.data);
} catch (err) {
  console.error("Erro ao carregar ganhadores", err);
}

}

function gerarLista(lista: Usuario[]) {
const linhas: string[] = [];

lista.forEach((user) => {
  user.bilhetes?.forEach((b) => {
    linhas.push(`${linhas.length + 1};${b.dezenas}`);
  });
});

setListaTexto(linhas.reverse().join("\n"));

}

function copiar() {
navigator.clipboard.writeText(listaTexto);
}

return (
<div className="p-4">
<h2 className="text-xl font-bold mb-4">Resultado do Sorteio</h2>

  {usuarios.map((user, index) => (
    <div key={index} className="mb-6 border rounded-lg p-3">
      <div className="font-semibold mb-2">
        #{user.userId ?? index + 1} — {user.nome ?? "Usuário"} ({user.bilhetes?.length || 0} bilhetes)
      </div>

      {user.bilhetes?.map((b, i) => (
        <div
          key={i}
          className="flex justify-between border p-2 rounded mb-2"
        >
          <span>{b.dezenas}</span>
          <span className="text-yellow-600 font-semibold">
            {b.status || "ATIVO"}
          </span>
        </div>
      ))}
    </div>
  ))}

  <div className="mt-6">
    <h3 className="font-semibold mb-2">
      Lista Numérica para Conferência Manual
    </h3>

    <div className="flex gap-2 mb-2">
      <button
        onClick={copiar}
        className="bg-blue-600 text-white px-3 py-2 rounded"
      >
        Copiar lista numérica
      </button>

      <button className="bg-yellow-500 text-white px-3 py-2 rounded">
        Baixar ativos (motor)
      </button>
    </div>

    <textarea
      value={listaTexto}
      readOnly
      className="w-full h-40 border p-2 rounded"
    />
  </div>
</div>

);
}