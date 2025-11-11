"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortearPremio = void 0;
const sortearPremio = (req, res) => {
    const premios = [
        "💎 1 mês de assinatura Premium",
        "🎧 Fone de ouvido Bluetooth",
        "📱 Capa personalizada",
        "🎁 Vale-presente de R$50",
        "🏆 Sem prêmio dessa vez 😅"
    ];
    const sorteado = premios[Math.floor(Math.random() * premios.length)];
    res.json({ mensagem: "Sorteio realizado com sucesso!", premio: sorteado });
};
exports.sortearPremio = sortearPremio;
