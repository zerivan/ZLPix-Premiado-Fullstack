import express from "express";
import cors from "cors";
import crypto from "crypto";
import { load, save, loadMeta, saveMeta } from "../jsondb";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const ADMIN_TOKEN = "zlpix-admin-token";

// ====== Funções auxiliares ======
const now = () => Math.floor(Date.now() / 1000);

function extractCandidates(prizes: string[]) {
  const out = new Set<string>();
  for (const p of prizes) {
    if (!p || p.length !== 5) continue;
    out.add(p.slice(0, 2)); // primeiras 2 dezenas
    out.add(p.slice(3, 5)); // últimas 2 dezenas
  }
  return [...out];
}

// ====== Meta inicial ======
let meta = loadMeta();
if (!meta.prize_base) meta.prize_base = 500;
if (!meta.accumulated) meta.accumulated = 0;
saveMeta(meta);

// ====== Rota para teste do backend ======
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "🔥 Backend do ZLPix funcionando!",
    timestamp: now()
  });
});

// ====== STATUS DO SISTEMA ======
app.get("/api/status", (req, res) => {
  const m = loadMeta();
  res.json({
    ok: true,
    prize_base: m.prize_base,
    accumulated: m.accumulated
  });
});

// ====== CRIAR TICKET ======
app.post("/api/tickets", (req, res) => {
  const { user, dez1, dez2, dez3 } = req.body;

  if (!user || !dez1 || !dez2 || !dez3) {
    return res.status(400).json({ error: "missing" });
  }

  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  const tickets = load("tickets.json");

  tickets.push({
    id: tickets.length + 1,
    code,
    user,
    dez1,
    dez2,
    dez3,
    status: "pending_paid",
    created_at: now(),
    paid_at: null,
    award_amount: null
  });

  save("tickets.json", tickets);

  res.json({ ok: true, code });
});

// ====== PAGAR TICKET ======
app.post("/api/pay/:code", (req, res) => {
  const tickets = load("tickets.json");
  const t = tickets.find((x: any) => x.code === req.params.code);

  if (!t) return res.status(404).json({ error: "not found" });

  t.status = "confirmed";
  t.paid_at = now();
  save("tickets.json", tickets);

  res.json({ ok: true });
});

// ====== ADMIN: INSERIR SORTEIO MANUAL ======
app.post("/api/admin/draw", (req, res) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN)
    return res.status(401).json({ error: "unauthorized" });

  const { raw1, raw2, raw3, raw4, raw5 } = req.body;
  const arr = [raw1, raw2, raw3, raw4, raw5];

  if (arr.some((p) => !p || p.length !== 5))
    return res.status(400).json({ error: "invalid" });

  const hash = crypto
    .createHash("sha256")
    .update(arr.join("|"))
    .digest("hex");

  const draws = load("draws.json");

  draws.push({
    id: draws.length + 1,
    source: "manual",
    raw1,
    raw2,
    raw3,
    raw4,
    raw5,
    created_at: now(),
    hash
  });

  save("draws.json", draws);

  res.json({ ok: true, hash });
});

// ====== ADMIN: PROCESSAR PREMIAÇÃO ======
app.post("/api/admin/run-check", (req, res) => {
  if (req.headers["x-admin-token"] !== ADMIN_TOKEN)
    return res.status(401).json({ error: "unauthorized" });

  const draws = load("draws.json");

  if (draws.length === 0)
    return res.status(400).json({ error: "no draws" });

  const d = draws[draws.length - 1];
  const prizes = [d.raw1, d.raw2, d.raw3, d.raw4, d.raw5];

  const cand = extractCandidates(prizes);
  const tickets = load("tickets.json");
  const winners = tickets.filter(
    (t: any) =>
      t.status === "confirmed" &&
      cand.includes(t.dez1) &&
      cand.includes(t.dez2) &&
      cand.includes(t.dez3)
  );

  const meta = loadMeta();
  const total = meta.prize_base + meta.accumulated;

  if (winners.length === 0) {
    meta.accumulated += meta.prize_base;
    saveMeta(meta);
    return res.json({
      ok: true,
      winners: 0,
      accumulated: meta.accumulated
    });
  }

  const per = total / winners.length;

  winners.forEach((w: any) => {
    w.status = "awarded";
    w.award_amount = per;
  });

  meta.accumulated = 0;
  saveMeta(meta);
  save("tickets.json", tickets);

  res.json({
    ok: true,
    winners: winners.length,
    per,
    codes: winners.map((x: any) => x.code)
  });
});

// ====== INICIAR SERVIDOR ======
app.listen(PORT, () => {
  console.log("🔥 ZLPix Backend rodando na porta", PORT);
});