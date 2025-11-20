"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsondb_js_1 = require("./jsondb.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 4000;
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
let meta = (0, jsondb_js_1.loadMeta)();
if (!meta.prize_base)
    meta.prize_base = 500;
if (!meta.accumulated)
    meta.accumulated = 0;
(0, jsondb_js_1.saveMeta)(meta);
// ====== Rota para teste ======
app.get("/", (req, res) => {
    res.json({
        ok: true,
        message: "🔥 Backend do ZLPix funcionando!",
        timestamp: now(),
    });
});
// ====== Iniciar servidor ======
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
