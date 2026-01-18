// backend/src/routes/federal.ts
import express from "express";

const router = express.Router();

/**
 * ============================
 * 🔧 MODO TESTE CONTROLADO
 * ============================
 * Federal FAKE para simular
 * sorteio do dia 21/01/2026
 */
const TESTE_FEDERAL = true;

router.get("/", async (_req, res) => {
  try {
    // ============================
    // 🔥 RESULTADO DE TESTE
    // ============================
    if (TESTE_FEDERAL) {
      const dataSorteio = new Date("2026-01-21T17:00:00-03:00");

      return res.json({
        ok: true,
        data: {
          dataApuracao: dataSorteio.toISOString(),
          premios: [
            "71900", // 71
            "90311", // 90
            "31123", // 31
            "45678",
            "88999",
          ],
          proximoSorteio: new Date(
            dataSorteio.getTime() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          timestampProximoSorteio:
            dataSorteio.getTime() + 7 * 24 * 60 * 60 * 1000,
        },
      });
    }

    // ============================
    // 🔵 MODO REAL (desligado agora)
    // ============================
    return res.status(503).json({
      ok: false,
      error: "Federal real temporariamente desativada",
    });
  } catch (error) {
    console.error("Erro Federal:", error);
    return res.status(500).json({ ok: false });
  }
});

export default router;