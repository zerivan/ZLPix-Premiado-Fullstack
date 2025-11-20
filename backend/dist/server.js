"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const jsondb_1 = require("./jsondb");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = 4000;
const ADMIN_TOKEN = "zlpix-admin-token";
// ====== Funções auxiliares ======
const now = () => Math.floor(Date.now() / 1000);
function extractCandidates(prizes) {
    const out = new Set();
    for (const p of prizes) {
        if (!p || p.length !== 5)
            continue;
        out.add(p.slice(0, 2)); // primeiras 2 dezenas
        out.add(p.slice(3, 5)); // últimas 2 dezenas
    }
    return [...out];
}
// ====== Meta inicial ======
let meta = (0, jsondb_1.loadMeta)();
if (!meta.prize_base)
    meta.prize_base = 500;
if (!meta.accumulated)
    meta.accumulated = 0;
(0, jsondb_1.saveMeta)(meta);
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
    const m = (0, jsondb_1.loadMeta)();
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
    const code = crypto_1.default.randomBytes(4).toString("hex").toUpperCase();
    const tickets = (0, jsondb_1.load)("tickets.json");
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
    (0, jsondb_1.save)("tickets.json", tickets);
    res.json({ ok: true, code });
});
// ====== PAGAR TICKET ======
app.post("/api/pay/:code", (req, res) => {
    const tickets = (0, jsondb_1.load)("tickets.json");
    const t = tickets.find((x) => x.code === req.params.code);
    if (!t)
        return res.status(404).json({ error: "not found" });
    t.status = "confirmed";
    t.paid_at = now();
    (0, jsondb_1.save)("tickets.json", tickets);
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
    const hash = crypto_1.default
        .createHash("sha256")
        .update(arr.join("|"))
        .digest("hex");
    const draws = (0, jsondb_1.load)("draws.json");
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
    (0, jsondb_1.save)("draws.json", draws);
    res.json({ ok: true, hash });
});
// ====== ADMIN: PROCESSAR PREMIAÇÃO ======
app.post("/api/admin/run-check", (req, res) => {
    if (req.headers["x-admin-token"] !== ADMIN_TOKEN)
        return res.status(401).json({ error: "unauthorized" });
    const draws = (0, jsondb_1.load)("draws.json");
    if (draws.length === 0)
        return res.status(400).json({ error: "no draws" });
    const d = draws[draws.length - 1];
    const prizes = [d.raw1, d.raw2, d.raw3, d.raw4, d.raw5];
    const cand = extractCandidates(prizes);
    const tickets = (0, jsondb_1.load)("tickets.json");
    const winners = tickets.filter((t) => t.status === "confirmed" &&
        cand.includes(t.dez1) &&
        cand.includes(t.dez2) &&
        cand.includes(t.dez3));
    const meta = (0, jsondb_1.loadMeta)();
    const total = meta.prize_base + meta.accumulated;
    if (winners.length === 0) {
        meta.accumulated += meta.prize_base;
        (0, jsondb_1.saveMeta)(meta);
        return res.json({
            ok: true,
            winners: 0,
            accumulated: meta.accumulated
        });
    }
    const per = total / winners.length;
    winners.forEach((w) => {
        w.status = "awarded";
        w.award_amount = per;
    });
    meta.accumulated = 0;
    (0, jsondb_1.saveMeta)(meta);
    (0, jsondb_1.save)("tickets.json", tickets);
    res.json({
        ok: true,
        winners: winners.length,
        per,
        codes: winners.map((x) => x.code)
    });
});
// ====== INICIAR SERVIDOR ======
app.listen(PORT, () => {
    console.log("🔥 ZLPix Backend rodando na porta", PORT);
});
