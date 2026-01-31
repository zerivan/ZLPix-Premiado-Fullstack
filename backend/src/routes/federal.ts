import() + diff);
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
      "https dataApuracaoISO = json?.dataApuracao
      ? parseDataBR(json.dataApuracao)
      : null;

    let premios: string[] = [];

    if (Array.isArray(json?.premios)) {
      premios = json.premios
        .map((p: any) => String(p.numero ?? p))
        .filter((n: string) => /^\d{5,6}$/.test(n))
        .slice(0, 5);
    }

    if (Array.isArray(json?.listaDezenas)) {
      premios = json.listaDezenas
        .map((n ausente na fonte oficial. Essa mensagem é normal caso o sorteio ainda não tenha sido publicado ou em caso de alteração na estrutura da API de dados externa."
      );
      return res.json({ ok: false });
    }

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        dataApuracao: dataApuracaoISO,
        premios,
        proximoSorteio: proximoSorteio.toISOString(),
        timestampProximoSorteio: proximoSorteio.getTime()
      }
    });
  } catch (error) {
    console