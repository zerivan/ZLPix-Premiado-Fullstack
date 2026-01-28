// backend/src/routes/assistant.ts

import { Router, Request, Response } from "express";
import { AssistantEngine } from "../services/assistant-engine";

const router = Router();

/**
 * POST /assistant/chat
 * Body: { message: string }
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Mensagem inválida."
      });
    }

    const response = await AssistantEngine.process(message);

    return res.status(200).json(response);
  } catch (error) {
    console.error("Erro no assistant:", error);
    return res.status(500).json({
      error: "Erro interno do assistente."
    });
  }
});

export default router;