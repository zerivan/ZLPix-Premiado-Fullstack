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

// 🔥 NOVO: função isolada de fetch (sem refatorar resto)
async function fetchFederal(signal: AbortSignal) {
  const urls = [
    "https://servicebus2.caixa.gov.br/portaldeloterias/api/federal", // oficial
    "https://loteriascaixa-api.herokuapp.com/api/federal/latest",   // fallback
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        console.warn("[FEDERAL] falhou:", url, response.status);
        continue;
      }

      const data: any = await response.json();

      // adapta formatos diferentes
      if (data?.listaDezenas) {
        return {
          dataApuracao: data.dataApuracao,
          dezenas: data.listaDezenas,
        };
      }

      if (data?.dezenas) {
        return {
          dataApuracao: data.data,
          dezenas: data.dezenas,
        };
      }
    } catch {
      console.warn("[FEDERAL] erro ao tentar:", url);
    }
  }

  return null;
}

router.get("/", async (_req, res) => {
  const controller = new AbortController();
  const timeoutMs = 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const data = await fetchFederal(controller.signal);

    if (!data) {
      return res.json({ ok: false });
    }

    const json = {
      dataApuracao: data.dataApuracao
        ? parseDataBR(data.dataApuracao)
        : null,
      dezenas: Array.isArray(data.dezenas)
        ? data.dezenas
        : [],
    };

    const premios = (json.dezenas || [])
      .map((n: any) =>
        String(n).replace(/\D/g, "").padStart(6, "0")
      )
      .slice(0, 5);

    if (!premios.length) {
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
      console.error("[FEDERAL] timeout");
      return res.json({ ok: false });
    }

    console.error("[FEDERAL] erro real:", error);
    return res.json({ ok: false });
  } finally {
    clearTimeout(timeoutId);
  }
});

export default router;