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

async function fetchHeroku(signal: AbortSignal) {
  const response = await fetch(
    "https://loteriascaixa-api.herokuapp.com/api/federal/latest",
    { signal }
  );

  if (!response.ok) {
    throw new Error(`HEROKU_HTTP_${response.status}`);
  }

  const json: any = await response.json();

  return {
    dataApuracao: json?.data ? parseDataBR(json.data) : null,
    dezenas: json?.dezenas || [],
  };
}

router.get("/", async (_req, res) => {
  const controller = new AbortController();
  const timeoutMs = 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    let json: any;

    // 🔥 PRIMEIRA TENTATIVA → GUIDI
    try {
      response = await fetch(
        "https://api.guidi.dev.br/loteria/federal/ultimo",
        {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`GUIDI_HTTP_${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`GUIDI_INVALID_CONTENT_${contentType}`);
      }

      json = await response.json();

      json = {
        dataApuracao: json?.dataApuracao
          ? parseDataBR(json.dataApuracao)
          : null,
        dezenas:
          json?.premios?.map((p: any) => String(p.numero ?? p)) ||
          json?.listaDezenas ||
          [],
      };
    } catch (err) {
      console.error("❌ Guidi falhou:", err);

      // 🔥 SEGUNDA TENTATIVA → HEROKU
      try {
        json = await fetchHeroku(controller.signal);
      } catch (err2) {
        console.error("❌ Heroku também falhou:", err2);
        return res.json({ ok: false });
      }
    }

    const premios = (json.dezenas || [])
      .map((n: string) => String(n).replace(/\D/g, ""))
      .filter((n: string) => /^\d{5,6}$/.test(n))
      .slice(0, 5);

    if (premios.length !== 5) {
      console.warn(
        "ℹ️ [ZLPix-Premiado] Resultado inválido ou incompleto"
      );
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
      console.error("Erro Federal: timeout na API externa");
      return res.json({ ok: false });
    }

    console.error("Erro Federal:", error);
    return res.json({ ok: false });
  } finally {
    clearTimeout(timeoutId);
  }
});

export default router;