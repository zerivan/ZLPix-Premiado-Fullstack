import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const TIPO_EXCLUIR_DADOS = "Excluir conta e dados permitidos";
const TIPO_MANTER_DADOS_LEGAIS = "Excluir conta mantendo dados exigidos por lei";

export default function ExclusaoConta() {
const [nome, setNome] = useState("");
const [email, setEmail] = useState("");
const [motivo, setMotivo] = useState("");
const [tipo, setTipo] = useState(TIPO_EXCLUIR_DADOS);
const [mensagem, setMensagem] = useState("");
const [erro, setErro] = useState("");
const [enviando, setEnviando] = useState(false);
const [confirmando, setConfirmando] = useState(false);

const token = new URLSearchParams(window.location.search).get("token");

useEffect(() => {
if (!token) return;

async function confirmarExclusao() {
setConfirmando(true);
setMensagem("");
setErro("");

try {
const response = await api.post("/auth/confirm-account-deletion", {
token,
});

setMensagem(
response.data?.message || "Solicitação confirmada com sucesso."
);
} catch (error: any) {
setErro(
error?.response?.data?.message ||
"Não foi possível confirmar a solicitação. O link pode estar inválido ou expirado."
);
} finally {
setConfirmando(false);
}
}

confirmarExclusao();
}, [token]);

async function enviarSolicitacao() {
if (enviando) return;

setEnviando(true);
setMensagem("");
setErro("");

try {
const response = await api.post("/auth/request-account-deletion", {
nome,
email,
tipo,
motivo,
});

setMensagem(
  "Sua solicitação foi registrada. Verifique seu e-mail para confirmar a exclusão da conta. Você será redirecionado para a tela de login."
);

setNome("");
setEmail("");
setMotivo("");
setTipo(TIPO_EXCLUIR_DADOS);

setTimeout(() => {
  window.location.href = "/login";
}, 8000);
} catch (error: any) {
setErro(
error?.response?.data?.message ||
"Não foi possível enviar a solicitação. Tente novamente."
);
} finally {
setEnviando(false);
}
}

return (
<div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 flex items-center justify-center p-6 text-white font-display">
<div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-2xl border border-green-400/30">

    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-yellow-300">
        Solicitação de Exclusão de Conta
      </h1>
    </div>

    {token ? (
      <div className="space-y-4 text-sm text-blue-100">
        {confirmando && (
          <p className="text-center">
            Confirmando solicitação de exclusão de conta...
          </p>
        )}

        {mensagem && (
          <div className="bg-green-500/20 border border-green-300/40 rounded-lg p-4 text-green-100">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="bg-red-500/20 border border-red-300/40 rounded-lg p-4 text-red-100">
            {erro}
          </div>
        )}
      </div>
    ) : (
      <>
    <div className="space-y-4 text-sm text-blue-100 mb-6">

      <p>
        O ZLPix Premiado respeita os direitos dos usuários previstos
        na Lei Geral de Proteção de Dados (LGPD).
      </p>

      <p>
        Após o envio da solicitação, sua conta será encaminhada para
        análise da equipe responsável.
      </p>

      <p>
        O processo poderá levar até 90 dias para conclusão.
      </p>

      <p>
        Alguns dados poderão permanecer armazenados pelo período
        exigido por lei, especialmente para fins fiscais,
        contábeis, prevenção a fraudes, segurança da plataforma
        e cumprimento de obrigações legais.
      </p>

    </div>

    <div className="space-y-4">

      <input
        type="text"
        placeholder="Nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        disabled={enviando}
        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white"
      />

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={enviando}
        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white"
      />

      <div className="bg-white/10 rounded-lg p-4">

        <label className="block mb-3">
          <input
            type="radio"
            checked={tipo === TIPO_EXCLUIR_DADOS}
            onChange={() => setTipo(TIPO_EXCLUIR_DADOS)}
            disabled={enviando}
          />
          <span className="ml-2">
            Excluir conta e dados pessoais permitidos pela legislação
          </span>
        </label>

        <label className="block">
          <input
            type="radio"
            checked={tipo === TIPO_MANTER_DADOS_LEGAIS}
            onChange={() =>
              setTipo(
                TIPO_MANTER_DADOS_LEGAIS
              )
            }
            disabled={enviando}
          />
          <span className="ml-2">
            Excluir conta mantendo apenas os dados obrigatórios
          </span>
        </label>

      </div>

      <textarea
        rows={5}
        placeholder="Motivo da solicitação"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        disabled={enviando}
        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white"
      />

      {mensagem && (
        <div className="bg-green-500/20 border border-green-300/40 rounded-lg p-4 text-green-100 text-sm">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="bg-red-500/20 border border-red-300/40 rounded-lg p-4 text-red-100 text-sm">
          {erro}
        </div>
      )}

      <button
        onClick={enviarSolicitacao}
        disabled={enviando}
        className={`w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-full shadow-lg ${
          enviando ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {enviando ? "Enviando..." : "Enviar Solicitação"}
      </button>

    </div>
    </>
    )}

  </div>
</div>

);
}