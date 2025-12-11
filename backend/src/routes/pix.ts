// backend/routes/pix.ts
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // ou global fetch se Node 18+
const { prisma } = require("../prismaClient"); // adapte conforme seu projeto

// Environment vars expected:
// process.env.MP_ACCESS_TOKEN
// process.env.MP_BASE_URL (https://api.mercadopago.com)

function toCents(reais) {
  return Math.round(Number(reais) * 100);
}

router.post("/create", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes, email, phone } = req.body;

    if (!amount || !bilhetes || !Array.isArray(bilhetes)) {
      return res.status(400).json({ error: "payload inválido" });
    }

    // 1) opcional: criar um registro temporário de "transação" no db (respeite seu schema)
    // NÃO alterar schema: tente gravar minimal: payment_id vazio até retornar do MP
    // Exemplo (ajuste ao seu schema):
    // const tx = await prisma.transaction.create({ data: { userId, amount, status: 'pending', metadata: { bilhetes } } });

    // 2) Chamar Mercado Pago (ou outro provedor) para criar cobrança PIX
    // Aqui deixo um esqueleto usando a API do Mercado Pago - substitua pelo SDK se preferir.
    const mpUrl = (process.env.MP_BASE_URL || "https://api.mercadopago.com") + "/v1/payments"; // exemplo
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (!mpToken) return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado" });

    // Mercado Pago aceita amount em centavos dependendo da API — ajuste conforme doc do MP.
    // Aqui vamos mandar um objeto genérico; adapte conforme API que você usa.
    const body = {
      transaction_amount: Number(amount),
      // OBS: dependendo da API do MP você deverá enviar em centavos e campos diferentes
      description: description,
      // metadata / external_reference: podemos enviar lista de bilhetes
      metadata: { bilhetes },
      // payer: se quiser informar email/phone para o MP identificar o cliente automaticamente
      payer: {
        email: email || undefined,
        phone: phone ? { area_code: phone.slice(0, 2), number: phone.slice(2) } : undefined,
      },
      // payment_method_id: 'pix' // dependendo do endpoint
    };

    // IMPORTANTE: este é um exemplo genérico. Se a API do MP que você usa requer endpoint diferente
    // ou formato diferente, substitua aqui. Recomendo usar o SDK oficial do Mercado Pago se possível.
    const mpResp = await fetch(mpUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const mpJson = await mpResp.json();

    if (!mpResp.ok) {
      console.error("MP create error", mpJson);
      return res.status(500).json({ error: "Erro ao criar cobrança com MP", details: mpJson });
    }

    // Dependendo da resposta do MP você vai extrair:
    // - id do pagamento (payment_id)
    // - qr_code / qr_code_base64
    // - copy_paste
    // Ajuste aqui conforme retorno do MP.

    // Exemplo genérico:
    const payment_id = mpJson.id || mpJson.data?.id || mpJson.payment_id || null;
    // procurar qr e copia e cola em mpJson (ajuste conforme MP)
    const qr_code_base64 = mpJson.point_of_interaction?.transaction_data?.qr_code_base64 || null;
    const copy_paste = mpJson.point_of_interaction?.transaction_data?.qr_code || mpJson.qr_code || null;

    // 3) Salvar transação (se desejar) - respeitando schema atual
    // Exemplo (ajuste):
    // await prisma.transaction.create({ data: { paymentId: payment_id, userId, amount, status: 'pending', metadata: JSON.stringify({ bilhetes }) } });

    return res.json({
      payment_id,
      qr_code_base64,
      copy_paste,
      raw: mpJson,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "erro interno", details: e.message });
  }
});

module.exports = router;