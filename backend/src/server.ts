import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * Extrai dezenas válidas do resultado federal
 * (início e fim de cada prêmio)
 */
function extrairDezenasFederais(premios: string[]): string[] {
  const dezenas: string[] = [];

  premios.slice(0, 5).forEach((premio) => {
    if (premio.length >= 2) {
      dezenas.push(premio.slice(0, 2)); // início
      dezenas.push(premio.slice(-2));   // fim
    }
  });

  return dezenas;
}

/**
 * ==========================================
 * ADMIN — GANHADORES (APENAS LEITURA)
 * GET /api/admin/ganhadores
 * ==========================================
 */
router.get("/", async (_req, res) => {
  try {
    // 1️⃣ Buscar resultado federal atual
    const federalRes = await fetch(
      "https://zlpix-premiado-backend.onrender.com/api/federal"
    );
    const federalJson = await federalRes.json();

    if (!federalJson?.ok) {
      return res.status(500).json({
        ok: false,
        error: "Não foi possível obter o resultado federal",
      });
    }

    const { concurso, dataApuracao, premios } = federalJson.data;

    const dezenasValidas = extrairDezenasFederais(premios);

    // 2️⃣ Buscar bilhetes pagos
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        pago: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 3️⃣ Verificar ganhadores
    const ganhadores = bilhetes.filter((b) => {
      const dezenasBilhete = b.dezenas.split(",");
      return dezenasBilhete.some((d) => dezenasValidas.includes(d));
    });

    // 4️⃣ Resposta para o painel
    return res.json({
      ok: true,
      concurso,
      dataApuracao,
      dezenasValidas,
      totalBilhetes: bilhetes.length,
      totalGanhadores: ganhadores.length,
      ganhadores: ganhadores.map((b) => ({
        bilheteId: b.id,
        dezenas: b.dezenas,
        valor: b.valor,
        usuario: b.user,
      })),
    });
  } catch (error) {
    console.error("Erro ao calcular ganhadores:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao calcular ganhadores",
    });
  }
});

export default router;