"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const pixroutes_1 = __importDefault(require("./routes/pixroutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Necessário para TypeScript
const __dirname = path_1.default.resolve();
// =============================
// 🔥 SERVE O FRONT-END BUILDADO
// =============================
app.use(express_1.default.static(path_1.default.join(__dirname, "front-end/dist")));
// 🔥 SERVE SUBPASTAS DO FRONT-END
app.use("/paginas", express_1.default.static(path_1.default.join(__dirname, "front-end/paginas")));
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "front-end/dist/assets")));
app.use("/img", express_1.default.static(path_1.default.join(__dirname, "front-end/img")));
app.use("/css", express_1.default.static(path_1.default.join(__dirname, "front-end/css")));
app.use("/js", express_1.default.static(path_1.default.join(__dirname, "front-end/js")));
// =============================
// 🔥 ROTAS DO BACKEND
// =============================
app.use("/pix", pixroutes_1.default);
// =============================
// 🔥 FALLBACK PARA SPA / HTML
// =============================
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "front-end/dist/index.html"));
});
// =============================
// 🔥 PORTA
// =============================
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
