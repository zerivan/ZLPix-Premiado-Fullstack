// src/routes/pix.ts
import { Router } from "express";
import axios from "axios";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN;

const MP_API_URL = "https://api.mercadopago.com/v1/payments";

/* ============================================================
   AUX: Buscar usuário
   ============================================================ */
async function getUser(userId: any) {
  return prisma.users.findUnique({
    where: { id: BigInt(String(userId)) },
  });
}

/* ============================================================
   AUX: Buscar bilhetes reais com dezenas
   ============================================================ */
async function getBilhetes(ids: string[]) {
  const list = [];
  for (const id of ids) {
    const b = await prisma.bilhete.findUnique({
      where: { id: BigInt(String(id)) },
    });
    if (b) list.push(b);
  }
  return list;
}

/* ============================================================
   AUX: Formatar dezenas dentro da “bolinha”
   ============================================================ */
function formatDezenas(dezenas: string) {
  return dezenas
    .split(",")
    .map((d) => `🟡 ${d.trim()}`)
    .join("  ");
}

/* ============================================================
   AUX: Montar descrição completa estilo “notinha fiscal”
   ============================================================ */
function montarDescricao(bilhetes: any[], total: number) {
  const data = new Date();
  const dia = data.toLocaleDateString("pt-BR");
  const hora = data.toLocaleTimeString("pt-BR");

  let texto = `Compra ZLPix – ${bilhetes.length} bilhete(s)\n`;
  texto += `Data: ${dia} ${hora}\n\n`;

  bilhetes.forEach((b, i) => {
    texto += `Bilhete ${i + 1} (R$ ${b.valor.toFixed(2)})\n`;
    texto += `${formatDezenas(b.dezenas)}\n\n`;
  });

  texto += `TOTAL: R$ ${total.toFixed(2)}`;

  return texto.substring(0, 250); // Mercado Pago aceita até 255 caracteres
}

/* ============================================================
   🔥 ROTA PIX EM LOTE (A PRINCIPAL)
   ============================================================ */
router.post("/create-lote", async (req, res) => {
  try {
    const { bilhetes, userId, amount } = req.body;

    if (!bilhetes || !Array.isArray(bilhetes)) {
      return res.status(400).json({ error: "Lista de bilhetes inválida." });
    }

    const user = await getUser(userId);
    if (!user) return res.status(400).json({ error: "Usuário não encontrado." });

    const bilhetesInfo = await getBilhetes(bilhetes);
    if (bilhetesInfo.length === 0)
      return res.status(400).json({ error: "Nenhum bilhete encontrado." });

    const total = Number(amount);

    const descricao = montarDescricao(bilhetesInfo, total);

    const idempotencyKey = crypto.randomUUID();

    const pagamento = {
      transaction_amount: total,
      description: descricao,
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name,
        phone: {
          area_code: user.phone?.slice(0, 2) || "00",
          number: user.phone?.slice(2) || "000000000",
        },
      },
    };

    const resposta = await axios.post(MP_API_URL, pagamento, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    const data = resposta.data;
    const trx = data?.point_of_interaction?.transaction_data;

    if (!trx) {
      return res.status(500).json({
        error: "Mercado Pago não retornou QR Code.",
        details: data,
      });
    }

    // Criar uma transação por bilhete
    for (const b of bilhetesInfo) {
      await prisma.transacao.create({
        data: {
          userId: BigInt(userId),
          bilheteId: BigInt(b.id),
          valor: b.valor,
          status: "pending",
          mpPaymentId: String(data.id),
        },
      });
    }

    return res.json({
      status: data.status,
      id: data.id,
      qr_code: trx.qr_code,
      qr_code_base64: trx.qr_code_base64,
      copy_paste: trx.qr_code,
    });
  } catch (err: any) {
    console.log("❌ ERRO PIX LOTE:", err.response?.data || err);
    return res.status(500).json({
      error: "Erro ao gerar PIX em lote",
      details: err.response?.data || err.message,
    });
  }
});

/* ============================================================
   🔥 ROTA PIX PARA 1 BILHETE (continua funcionando)
   ============================================================ */
router.post("/create", async (req, res) => {
  try {
    const { amount, description, bilheteId, userId } = req.body;

    const user = await getUser(userId);
    const bilhete = await prisma.bilhete.findUnique({
      where: { id: BigInt(String(bilheteId)) },
    });

    const descFinal =
      description ||
      `Bilhete único\n${formatDezenas(bilhete?.dezenas || "")}`;

    const idempotencyKey = crypto.randomUUID();

    const