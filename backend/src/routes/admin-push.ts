import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getMessaging } from "../lib/firebase";

const router = Router();

/**
 * =========================================
 * ADMIN PUSH MANUAL
 * POST /api/admin/push/send
 * =========================================
 */
router.post("/send", async (req, res) => {
  try {
    const { title, body, url, userId, broadcast } = req.body;

    console.log("🔎 [ADMIN PUSH] Body recebido:", req.body);

    if (!title || !body) {
      return res.status(400).json({
        error: "title e body são obrigatórios",
      });
    }

    const normalizedUserId =
      userId !== undefined && userId !== null
        ? Number(userId)
        : null;

    const normalizedBroadcast =
      broadcast === true || broadcast === "true";

    console.log(
      "🔎 normalizedUserId:",
      normalizedUserId,
      "typeof:",
      typeof normalizedUserId
    );
    console.log("🔎 normalizedBroadcast:", normalizedBroadcast);

    if (normalizedUserId && normalizedBroadcast) {
      console.log("❌ Envio ambíguo detectado");
      return res.status(400).json({
        error: "Envio ambíguo: informe userId OU broadcast",
      });
    }

    let tokens: { token: string }[] = [];

    if (normalizedUserId) {
      console.log("📤 Buscando tokens por userId:", normalizedUserId);

      tokens = await prisma.pushToken.findMany({
        where: { userId: normalizedUserId },
        select: { token: true },
      });
    } else if (normalizedBroadcast) {
      console.log("📤 Buscando tokens broadcast (todos)");

      tokens = await prisma.pushToken.findMany({
        select: { token: true },
      });
    } else {
      console.log("❌ Nenhum método válido informado");
      return res.status(400).json({
        error: "Informe userId ou broadcast",
      });
    }

    console.log("📱 Tokens encontrados:", tokens.length);

    if (!tokens.length) {
      return res.json({
        ok: false,
        message: "Nenhum token encontrado",
      });
    }

    const messaging = getMessaging();

    const response = await messaging.sendEachForMulticast({
      notification: {
        title,
        body,
      },
      data: {
        url: url || "/",
      },
      tokens: tokens.map((t) => t.token),
    });

    console.log(
      "📊 Firebase response:",
      "success:",
      response.successCount,
      "failure:",
      response.failureCount
    );

    // 🔥 REMOÇÃO AUTOMÁTICA DE TOKENS INVÁLIDOS
    const invalidTokens: string[] = [];

    response.responses.forEach((r, idx) => {
      if (!r.success) {
        invalidTokens.push(tokens[idx].token);
        console.warn(
          "⚠️ Token inválido:",
          tokens[idx].token.substring(0, 25) + "...",
          "-",
          r.error?.message
        );
      }
    });

    if (invalidTokens.length) {
      await prisma.pushToken.deleteMany({
        where: { token: { in: invalidTokens } },
      });

      console.log(
        `🧹 ${invalidTokens.length} token(s) inválido(s) removido(s)`
      );
    }

    return res.json({
      ok: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("❌ Erro admin push:", error);
    return res.status(500).json({
      error: "Erro ao enviar push",
    });
  }
});

export default router;