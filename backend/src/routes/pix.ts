// src/routes/pix.ts
import { Router } from "express";
import axios from "axios";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();

// tenta as variáveis de ambiente do MP
const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error("❌ Nenhum Access Token do Mercado Pago foi encontrado!");
}

const MP_API_URL = "https://api.mercadopago.com/v1/payments";

/**
 * Body esperado:
 * {
 *   userId: "123",
 *   bilhetes: [{ id?: number, dezenas: "01,02,03", valor: 2.0, createdAt?: string }],
 *   amount: 10,
 *   description: "Pagamento de 5 bilhetes"
 * }
 */
router.post("/create", async (req, res) => {
  try {
    const { userId, bilhetes, amount, description } = req.body;

    if (!userId || !Array.isArray(bilhetes) || !amount || !description) {
      return res.status(400).json({ error: "userId, bilhetes, amount e description são obrigatórios." });
    }

    console.log("📤 Criando PIX em lote:", { userId, qtd: bilhetes.length, amount, description });

    // cria idempotency
    const idempotencyKey = crypto.randomUUID();

    const pagamento = {
      transaction_amount: Number(amount),
      description,
      payment_method_id: "pix",
      payer: {
        email: "test_user@test.com",
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
      console.error("❌ Mercado Pago não retornou transaction_data:", data);
      return res.status(500).json({ error: "Mercado Pago não retornou QR Code.", details: data });
    }

    const mpPaymentId = String(data.id);

    // para cada bilhete enviado:
    // - se id vier (numérico) usa o bilhete existente
    // - se não vier, cria o bilhete no banco (pago=false)
    // - depois cria uma transacao vinculada a esse bilhete, com mpPaymentId igual para todos
    for (const b of bilhetes) {
      let bilheteIdToUse: bigint;

      if (b.id && !isNaN(Number(b.id))) {
        // tenta usar existente
        try {
          const existing = await prisma.bilhete.findUnique({ where: { id: BigInt(Number(b.id)) } });
          if (existing) {
            bilheteIdToUse = BigInt(Number(b.id));
          } else {
            // cria novo se não existir
            const created = await prisma.bilhete.create({
              data: {
                userId: BigInt(Number(userId)),
                dezenas: String(b.dezenas),
                valor: Number(b.valor ?? amount / bilhetes.length),
                sorteioData: new Date(),
              },
            });
            bilheteIdToUse = BigInt(created.id);
          }
        } catch (e) {
          // se erro de conversão qualquer, cria novo
          const created = await prisma.bilhete.create({
            data: {
              userId: BigInt(Number(userId)),
              dezenas: String(b.dezenas),
              valor: Number(b.valor ?? amount / bilhetes.length),
              sorteioData: new Date(),
            },
          });
          bilheteIdToUse = BigInt(created.id);
        }
      } else {
        // cria novo bilhete
        const created = await prisma.bilhete.create({
          data: {
            userId: BigInt(Number(userId)),
            dezenas: String(b.dezenas),
            valor: Number(b.valor ?? amount / bilhetes.length),
            sorteioData: new Date(),
          },
        });
        bilheteIdToUse = BigInt(created.id);
      }

      // cria transacao para esse bilhete (mpPaymentId igual para todos)
      await prisma.transacao.create({
        data: {
          userId: BigInt(Number(userId)),
          bilheteId: bilheteIdToUse,
          valor: Number(b.valor ?? amount / bilhetes.length),
          status: "pending",
          mpPaymentId: mpPaymentId,
        } as any, // cast porque prisma/ts strict pode reclamar de bigint no objeto literal
      });
    }

    // responde com o QR do MP
    return res.json({
      status: data.status,
      id: mpPaymentId,
      qr_code: trx.qr_code,
      qr_code_base64: trx.qr_code_base64,
      copy_paste: trx.qr_code,
    });
  } catch (err: any) {
    console.log("❌ ERRO COMPLETO AO CRIAR PIX:");
    console.log("Mensagem:", err.message);
    console.log("Detalhes:", err.response?.data);

    return res.status(500).json({
      error: "Erro ao criar pagamento PIX",
      details: err.response?.data || err.message,
    });
  }
});

export default router;