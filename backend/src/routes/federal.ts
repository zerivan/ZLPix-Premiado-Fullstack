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

function extrairDezenas(numero: string) {
  const chars = numero.split("");
  const inicio: string[] = [];
  const fim: string[] = [];

  for (let i = 0; i < chars.length - 1; i++) {
    inicio.push(chars[i] + chars[i + 1]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    fim.push(chars[i - 1] + chars[i]);
  }

  return { inicio, fim };
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

    let concurso = "N/A";
    const concursoMatch = html.match(/Concurso[^0-9]*([0-9]{3,6})/i);
    if (concursoMatch) concurso = concursoMatch[1];

    let dataApuracao = "N/A";
    const dataMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dataMatch) dataApuracao = dataMatch[1];

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

    // 🔥 CONTRATO ORIGINAL DO FRONT
    const premiosFrontend = numeros;

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        concurso,
        dataApuracao,
        premios: premiosFrontend, // ✅ string[]
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