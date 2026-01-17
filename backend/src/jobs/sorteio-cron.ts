import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

/**
 * ============================================
 * ⏰ CRON AUTOMÁTICO DE SORTEIO (SEGURO)
 * ============================================
 * - Roda automaticamente
 * - Executa UMA ÚNICA VEZ por sorteio
 * - Protegido contra duplicação
 */

async function buscarResultadoFederal(): Promise<string[]> {
  /**
   * ⚠️ SIMULAÇÃO CONTROLADA
   * Futuro:
   * - API Loteria Federal
   * - ou input via admin
   */
  return ["12", "45", "98"];
}

cron.schedule("*/10 * * * *", async () => {
  try {
    const agora = new Date();

    /**
     * 🔒 PASSO 1 — TENTAR “TRAVAR” UM SORTEIO
     * Atualiza UM bilhete ATIVO → PROCESSANDO
     * Se não atualizar ninguém, outro processo já pegou
     */
    const lock = await prisma.bilhete.updateMany({
      where: {
        status: "ATIVO",
        sorteioData: { lte: agora },
      },
      data: {
        status: "PROCESSANDO",
      },
      take: 1,
    });

    if (lock.count === 0) {
      return;
    }

    /**
     * 🔍 PASSO 2 — IDENTIFICAR QUAL SORTEIO FOI TRAVADO
     */
    const bilhete = await prisma.bilhete.findFirst({
      where: {
        status: "PROCESSANDO",
        sorteioData: { lte: agora },
      },
      orderBy: { sorteioData: "asc" },
    });

    if (!bilhete) {
      return;
    }

    const sorteioData = bilhete.sorteioData;

    console.log("⏳ Executando sorteio automático:", sorteioData);

    /**
     * 🔢 RESULTADO OFICIAL
     */
    const dezenas = await buscarResultadoFederal();

    /**
     * 💰 SOMA DO PRÊMIO
     */
    const premioTotal = await prisma.bilhete.aggregate({
      where: {
        sorteioData,
        status: { in: ["ATIVO", "PROCESSANDO"] },
      },
      _sum: {
        valor: true,
      },
    });

    /**
     * 🎯 PROCESSAMENTO PRINCIPAL
     */
    await processarSorteio(sorteioData, {
      dezenas,
      premioTotal: Number(premioTotal._sum.valor || 0),
    });

    console.log("✅ Sorteio automático finalizado com sucesso");
  } catch (err) {
    console.error("❌ Erro no CRON de sorteio:", err);
  }
});