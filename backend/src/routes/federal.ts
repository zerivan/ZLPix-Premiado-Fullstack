import express from "express";

const router = express.Router();

function getSaoPauloDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    weekday: getPart("weekday"),
    hour: Number(getPart("hour")),
  };
}

function getNextWednesday(): Date {
  const now = new Date();
  const saoPauloNow = getSaoPauloDateParts(now);
  const weekdays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const day = weekdays[saoPauloNow.weekday];
  let diff = (3 - day + 7) % 7;

  if (diff === 0 && saoPauloNow.hour >= 20) {
    diff = 7;
  }

  const nextLocalDate = new Date(
    Date.UTC(saoPauloNow.year, saoPauloNow.month - 1, saoPauloNow.day)
  );
  nextLocalDate.setUTCDate(nextLocalDate.getUTCDate() + diff);

  const year = nextLocalDate.getUTCFullYear();
  const month = String(nextLocalDate.getUTCMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(nextLocalDate.getUTCDate()).padStart(2, "0");

  return new Date(`${year}-${month}-${dayOfMonth}T20:00:00-03:00`);
}

function parseDataBR(data: string): string | null {
  const [d, m, y] = data.split("/");
  if (!d || !m || !y) return null;
  const iso = new Date(`${y}-${m}-${d}T20:00:00-03:00`);
  return isNaN(iso.getTime()) ? null : iso.toISOString();
}

// 🔥 Busca o resultado da Federal a partir do GitHub Pages
async function fetchFederal(signal: AbortSignal) {
  const url = "https://zerivan.github.io/zlpix-federal-api/api/federal.json";
    try {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.warn("[FEDERAL] falhou:", response.status);
    return null;
  }

  const data: any = await response.json();

  return {
  dataApuracao: data.dataApuracao,
  dezenas: data.listaDezenas || data.dezenas,
};
} catch (error) {
  console.warn("[FEDERAL] erro:", error);
  return null;
}
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
