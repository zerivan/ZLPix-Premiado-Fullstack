"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Rota simples para simular o sorteio de prêmio
router.get("/premio", (req, res) => {
    const premios = ["Pix R$50", "Pix R$100", "Pix R$200", "Nada ainda 😅"];
    const premio = premios[Math.floor(Math.random() * premios.length)];
    res.json({ sucesso: true, premio });
});
exports.default = router;
