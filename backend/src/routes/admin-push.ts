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

    // 🔒 Normalização explícita
    const normalizedUserId =
      userId !== undefined && userId !== null
        ? Number(userId)
        : null;

    const normalizedBroadcast =
      broadcast === true || broadcast === "true";

    console.log("🔎 normalizedUserId:", normalizedUserId, "typeof:", typeof normalizedUserId);
    console.log("🔎 normalizedBroadcast:", normalizedBroadcast);

    // 🔒 Bloqueia ambiguidade
    if (normalizedUserId && normalizedBroadcast) {
      console.log("❌ Envio ambíguo detectado");
      return res.status(400).json({
        error: "Envio ambíguo: informe userId OU broadcast",
      });
    }

    let tokens: { token: string }[] = [];

    // 🔹 ENVIO PARA UM USUÁRIO ESPECÍFICO
    if (normalizedUserId) {
      console.log("📤 Buscando tokens por userId:", normalizedUserId);

      tokens = await prisma.pushToken.findMany({
        where: { userId: normalizedUserId },
        select: { token: true },
      });
    }

    // 🔹 ENVIO PARA TODOS
    else if (normalizedBroadcast) {
      console.log("📤 Buscando tokens broadcast (todos)");

      tokens = await prisma.pushToken.findMany({
        select: { token: true },
      });
    }

    // 🔒 Nenhum método válido informado
    else {
      console.log("❌ Nenhum método válido informado");
      return res.status(400).json({
        error: "Informe userId ou broadcast",
      });
    }

    console.log("📱 Tokens encontrados:", tokens.length);

    if (tokens.length) {
      console.log(
        "🔑 Primeiro token:",
        tokens[0].token.substring(0, 25) + "..."
      );
    }

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