import axios from "axios";

/**

=====================================================

NOTIFY — SERVIÇO CENTRAL DE NOTIFICAÇÕES

=====================================================

ÚNICO ponto de disparo de push


Nenhuma lógica de evento fora daqui */



export type NotifyEvent = | { type: "BILHETE_CRIADO"; userId: string; codigo: string } | { type: "PIX_PAGO"; userId: string; valor: number } | { type: "PIX_PENDENTE"; userId: string; valor: number } | { type: "CARTEIRA_CREDITO"; userId: string; valor: number } | { type: "CARTEIRA_DEBITO"; userId: string; valor: number } | { type: "SAQUE_SOLICITADO"; userId: string; valor: number } | { type: "SAQUE_PAGO"; userId: string; valor: number } | { type: "SORTEIO_REALIZADO"; userId: string; ganhou: boolean; valor?: number } | { type: "AVISO_SISTEMA"; userId: string; mensagem: string; url?: string };

const BASE_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function notify(event: NotifyEvent): Promise<void> { try { const payload = montarMensagem(event); if (!payload) return;

await axios.post(`${BASE_URL}/push/send`, payload);

console.log("📲 PUSH ENVIADO:", event.type, payload.userId);

} catch (error) { console.error("❌ Erro ao disparar notificação:", error); } }

function montarMensagem(event: NotifyEvent): | { userId: string; title: string; body: string; url: string } | null { switch (event.type) { case "BILHETE_CRIADO": return { userId: event.userId, title: "🎟️ Bilhete criado", body: Seu bilhete ${event.codigo} foi gerado com sucesso, url: "/meus-bilhetes", };

case "PIX_PAGO":
  return {
    userId: event.userId,
    title: "💰 Pagamento confirmado",
    body: `PIX de R$ ${event.valor.toFixed(2)} aprovado`,
    url: "/carteira",
  };

case "PIX_PENDENTE":
  return {
    userId: event.userId,
    title: "⏳ PIX pendente",
    body: `Aguardando confirmação do PIX de R$ ${event.valor.toFixed(2)}`,
    url: "/carteira",
  };

case "CARTEIRA_CREDITO":
  return {
    userId: event.userId,
    title: "💳 Carteira creditada",
    body: `Você recebeu R$ ${event.valor.toFixed(2)} na carteira`,
    url: "/carteira",
  };

case "CARTEIRA_DEBITO":
  return {
    userId: event.userId,
    title: "💳 Carteira debitada",
    body: `Saiu R$ ${event.valor.toFixed(2)} da sua carteira`,
    url: "/carteira",
  };

case "SAQUE_SOLICITADO":
  return {
    userId: event.userId,
    title: "🏦 Saque solicitado",
    body: `Saque de R$ ${event.valor.toFixed(2)} em processamento`,
    url: "/carteira",
  };

case "SAQUE_PAGO":
  return {
    userId: event.userId,
    title: "✅ Saque realizado",
    body: `Seu saque de R$ ${event.valor.toFixed(2)} foi pago`,
    url: "/carteira",
  };

case "SORTEIO_REALIZADO":
  return {
    userId: event.userId,
    title: "🏆 Sorteio realizado",
    body: event.ganhou
      ? `Parabéns! Você ganhou R$ ${event.valor?.toFixed(2)}`
      : "O sorteio foi realizado. Confira o resultado!",
    url: "/resultado",
  };

case "AVISO_SISTEMA":
  return {
    userId: event.userId,
    title: "📢 Aviso do sistema",
    body: event.mensagem,
    url: event.url || "/",
  };

default:
  return null;

} }