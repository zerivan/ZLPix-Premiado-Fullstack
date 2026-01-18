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
  // recebe DD/MM/YYYY e devolve ISO
  const [d, m, y] = data.split("/");
  if (!d || !m || !y) return null;
  const iso = new Date(`${y}-${m}-${d}T20:00:00-03:00`);
  return isNaN(iso.getTime()) ? null : iso.toISOString();
}

router.get("/", async (_req, res) => {
  try {
    const response = await fetch(
      "https://loterias.caixa.gov.br/Paginas/Federal.aspx",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html",
        },
      }
    );

    const html = await response.text();

    // 🔹 DATA DO SORTEIO (IDENTIFICADOR REAL)
    let dataApuracaoISO: string | null = null;
    const dataMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dataMatch) {
      dataApuracaoISO = parseDataBR(dataMatch[1]);
    }

    // 🔹 NÚMEROS SORTEADOS (1º AO 5º)
    let numeros: string[] = [];
    const regex =
      /<td[^>]*>\s*\d{1}\s*<\/td>\s*<td[^>]*>\s*(\d{5})\s*<\/td>/g;

    let m;
    while ((m = regex.exec(html)) !== null) {
      numeros.push(m[1]);
    }

    if (numeros.length < 5) {
      numeros = [...html.matchAll(/(\d{5})/g)]
        .map(v => v[1])
        .slice(0, 5);
    }

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        dataApuracao: dataApuracaoISO, // ✅ ISO válido
        premios: numeros,              // ✅ string[]
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