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
  const controller = new AbortController();
  const timeoutMs = 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let json: any;

    // 🔥 API OFICIAL CAIXA (COM HEADERS CORRETOS)
    const response = await fetch(
      "https://servicebus2.caixa.gov.br/portaldeloterias/api/federal",
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
        },
      }
    );

    if (!response.ok) {
      console.error("[FEDERAL] Erro HTTP Caixa:", response.status);
      return res.json({ ok: false });
    }

    const data: any = await response.json();

    json = {
      dataApuracao: data?.dataApuracao
        ? parseDataBR(data.dataApuracao)
        : null,
      dezenas: Array.isArray(data?.listaDezenas)
        ? data.listaDezenas
        : [],
    };

    const premios = (json.dezenas || [])
      .map((n: any) =>
        String(n).replace(/\D/g, "").padStart(6, "0")
      )
      .slice(0, 5);

    if (!premios.length) {
      console.warn("[FEDERAL] Nenhum resultado disponível");
      return res.json({ ok: false });
    }

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        dataApuracao: json.dataApuracao,
        premios,
        proximoSorteio: proximoSorteio.toISOString(),
        timestampProximoSorteio: proximoSorteio.getTime(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[FEDERAL] ERRO: timeout na API externa (8s)");
      return res.json({ ok: false });
    }

    console.error("[FEDERAL] ERRO REAL:", error);
    if (error instanceof Error) {
      console.error("[FEDERAL] Mensagem:", error.message);
      console.error("[FEDERAL] Stack:", error.stack?.substring(0, 500));
    }
    return res.json({ ok: false, error: String(error) });
  } finally {
    clearTimeout(timeoutId);
  }
});

export default router;