import express from "express";
import { prisma } from "../lib/prisma";

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

// 🔥 CORREÇÃO: remove Caixa e adiciona fallback compatível
async function fetchFederal(signal: AbortSignal) {
  const urls = [
    "https://loteriascaixa-api.herokuapp.com/api/federal/latest", // principal
    "https://loteriascaixa-api.herokuapp.com/api/federal",        // fallback
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

      // 🔹 formato /latest
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

      // 🔹 formato lista
      if (Array.isArray(data) && data.length > 0) {
        const ultimo = data[0];

        if (ultimo?.listaDezenas) {
          return {
            dataApuracao: ultimo.dataApuracao,
            dezenas: ultimo.listaDezenas,
          };
        }

        if (ultimo?.dezenas) {
          return {
            dataApuracao: ultimo.data,
            dezenas: ultimo.dezenas,
          };
        }
      }

      console.warn("[FEDERAL] formato desconhecido:", url);
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