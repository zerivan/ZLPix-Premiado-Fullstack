import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

/**
 * ============================================
 * ⏰ CRON AUTOMÁTICO DE SORTEIO (OFICIAL)
 * ============================================
 * - Busca resultado REAL da Loteria Federal
 * - Executa UMA ÚNICA VEZ por sorteio
 * - Protegido contra duplicação
 */

/**
 * 🔢 BUSCA RESULTADO DA LOTERIA FEDERAL
 * Fonte pública (Caixa / agregadores oficiais)
 */
async function buscarResultadoFederal(): Promise<string[]> {
  try {
    /**
     * ⚠️ Endpoint público mais estável (agregador)
     * Não exige token
     */
    const resp = await fetch(
      "https://loteriascaixa-api.herokuapp.com/api/federal/latest"
    );

    if (!resp.ok) {
      throw new Error("Falha ao buscar resultado federal");
    }

    const json: any = await resp.json();

    /**
     * Estrutura típica:
     * json.premios = [{ bilhete: "12345" }, ...]
     */
    if (!json?.premios || !Array.isArray(json.premios)) {
      throw new Error("Formato inesperado do resultado");
    }

    /**
     * 🔎 Extrai dezenas finais (ex: últimas 2 ou 3)
     * Ajuste conforme sua regra oficial
     */
    const dezenas = json.premios
      .map((p: any) =>
        String(p.bilhete).slice(-2) // 🔥 dezenas finais
      )
      .filter(Boolean);

    if (!dezenas.length) {
      throw new Error("Nenhuma dezena válida encontrada");
    }

    console.log("🎯 Resultado Federal obtido:", dezenas);

    return dezenas;
  } catch (err) {
    console.error(
      "⚠️ Erro ao buscar resultado federal. Usando fallback seguro.",
      err
    );

    /**
     * 🔒 FALLBACK CONTROLADO
     * Evita travar o sistema
     * NÃO paga prêmio incorreto
     */
    return [];
  }
}

cron.schedule("*/10 * * * *", async () => {
  try {
    const agora = new Date();

    /**
     * 🔒 PASSO 1 — TRAVA DE SORTEIO
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

    if (lock.count === 0) return;

    /**
     * 🔍 IDENTIFICA SORTEIO
     */
    const bilhete = await prisma.bilhete.findFirst({
      where: {
        status: "PROCESSANDO",
        sorteioData: { lte: agora },
      },
      orderBy: { sorteioData: "asc" },
    });

    if (!bilhete) return;

    const sorteioData = bilhete.sorteioData;

    console.log("⏳ Executando sorteio automático:", sorteioData);

    /**
     * 🔢 RESULTADO REAL
     */
    const dezenas = await buscarResultadoFederal();

    /**
     * ⚠️ Se não houver resultado válido, aborta
     */
    if (!dezenas.length) {
      console.warn("🚫 Sorteio abortado: resultado federal indisponível");
      return;
    }

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
     * 🎯 PROCESSA SORTEIO
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