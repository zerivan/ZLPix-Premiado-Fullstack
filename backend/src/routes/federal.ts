// backend/src/routes/federal.ts
import express from "express";

const router = express.Router();

function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

function parseDataBR(data: string): string | null {
  const [d, m, y] = data.split("/");
  if (!d || !m || !y) return null;

  const iso = new Date(`${y}-${m}-${d}T20:00:00-03:00`);
  return isNaN(iso.getTime()) ? null : iso.toISOString();
}

router.get("/", async (_req, res) => {
  try {
    const response = await fetch(
      "https://api.guidi.dev.br/loteria/federal/ultimo",
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Erro HTTP Federal API alternativa:", response.status);
      return res.status(500).json({ ok: false });
    }

    const json: any = await response.json();

    // DEBUG controlado para validar estrutura real
    console.log("DEBUG FEDERAL JSON:", JSON.stringify(json));

    const dataApuracaoISO = json?.dataApuracao
      ? parseDataBR(json.dataApuracao)
      : null;

    let premios: string[] = [];

    // 🔹 FORMATO 1: premios = ["12345", ...]
    if (Array.isArray(json?.premios) && typeof json.premios[0] === "string") {
      premios = json.premios
        .filter((n: string) => /^\d{5}$/.test(n))
        .slice(0, 5);
    }

    // 🔹 FORMATO 2: premios = [{ numero: "12345" }]
    else if (Array.isArray(json?.premios)) {
      premios = json.premios
        .map((p: any) => String(p.numero))
        .filter((n: string) => /^\d{5}$/.test(n))
        .slice(0, 5);
    }

    // 🔹 FORMATO 3: listaDezenas = ["12345", ...]
    else if (Array.isArray(json?.listaDezenas)) {
      premios = json.listaDezenas
        .filter((n: string) => /^\d{5}$/.test(n))
        .slice(0, 5);
    }

    if (premios.length !== 5) {
      console.warn("⚠️ Resultado da Federal inválido ou incompleto");
      return res.json({ ok: false });
    }

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        dataApuracao: dataApuracaoISO,
        premios,
        proximoSorteio: proximoSorteio.toISOString(),
        timestampProximoSorteio: proximoSorteio.getTime(),
      },
    });
  } catch (error) {
    console.error("Erro Federal:", error);
    return res.status(500).json({ ok: false });
  }
});

export default router;