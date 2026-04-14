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

// 🔥 FETCH PADRÃO COM HEADERS (ANTI-BLOQUEIO)
async function safeFetch(url: string, signal: AbortSignal) {
  return fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "pt-BR,pt;q=0.9",
      Connection: "keep-alive",
    },
  });
}

router.get("/", async (_req, res) => {
  const controller = new AbortController();
  const timeoutMs = 12000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let json: any = null;

    // ============================
    // 🔹 1ª API (GUIDI)
    // ============================
    try {
      const response = await safeFetch(
        "https://api.guidi.dev.br/loteria/federal/ultimo",
        controller.signal
      );

      if (!response.ok) {
        throw new Error(`GUIDI_HTTP_${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("GUIDI_INVALID_RESPONSE");
      }

      const data = await response.json();

      json = {
        dataApuracao: data?.dataApuracao
          ? parseDataBR(data.dataApuracao)
          : null,
        dezenas:
          data?.premios?.map((p: any) => String(p.numero ?? p)) ||
          data?.listaDezenas ||
          [],
      };

      console.log("✅ Guidi OK");
    } catch (err) {
      console.error("❌ Guidi falhou:", err);

      // ============================
      // 🔹 2ª API (HEROKU)
      // ============================
      try {
        const response2 = await safeFetch(
          "https://loteriascaixa-api.herokuapp.com/api/federal/latest",
          controller.signal
        );

        if (!response2.ok) {
          throw new Error(`HEROKU_HTTP_${response2.status}`);
        }

        const data2 = await response2.json();

        json = {
          dataApuracao: data2?.data
            ? parseDataBR(data2.data)
            : null,
          dezenas: data2?.dezenas || [],
        };

        console.log("✅ Heroku OK");
      } catch (err2) {
        console.error("❌ Heroku também falhou:", err2);
        return res.json({ ok: false });
      }
    }

    const premios = (json.dezenas || [])
      .map((n: any) =>
        String(n).replace(/\D/g, "").padStart(6, "0")
      )
      .slice(0, 5);

    if (!premios.length) {
      console.warn("ℹ️ Nenhum resultado disponível");
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