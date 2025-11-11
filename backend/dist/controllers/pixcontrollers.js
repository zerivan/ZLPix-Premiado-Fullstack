"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarPix = gerarPix;
const qrcode_1 = __importDefault(require("qrcode"));
async function gerarPix(req, res) {
    try {
        const { chave, valor, descricao } = req.body;
        if (!chave || !valor) {
            return res.status(400).json({ erro: "Chave Pix e valor são obrigatórios." });
        }
        const payload = `00020126360014BR.GOV.BCB.PIX0114${chave}520400005303986540${valor.toFixed(2)}5802BR5914ZLPix Premiado6009SaoPaulo62070503***6304`;
        const qrCodeDataURL = await qrcode_1.default.toDataURL(payload);
        res.status(200).json({
            payload,
            qrCode: qrCodeDataURL,
            mensagem: "Pix gerado com sucesso ✅",
        });
    }
    catch (erro) {
        console.error("Erro ao gerar Pix:", erro);
        res.status(500).json({ erro: "Erro interno ao gerar o Pix" });
    }
}
