import "dotenv/config";
import express from "express";
import cors from "cors";

// Rotas públicas / core
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";

// Admin
import diagnosticoRoutes from "./routes/diagnostico";
import devAssistenteRoutes from "./routes/dev-assistente";
import adminGanhadoresRoutes from "./routes/admin-ganhadores";
import adminRelatoriosRoutes from "./routes/admin-relatorios";

// CMS ADMIN
import adminCmsRoutes from "./routes/admin-cms";

// Middleware admin
import { adminAuth } from "./middlewares/adminAuth";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// =============================
// CORS
// =============================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// =============================
// Healthcheck
// =============================
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando!",
  });
});

// =============================
// ROTAS PÚBLICAS
// =============================
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);

app.use("/pix", pixRoutes);
app.use("/pix/webhook", pixWebhookRoutes);
app.use("/bilhete", bilheteRoutes);

// =============================
// ROTAS ADMIN
// =============================
app.use("/api/admin/diagnostico", adminAuth, diagnosticoRoutes);
app.use("/api/admin/ganhadores", adminAuth, adminGanhadoresRoutes);
app.use("/api/admin/relatorios", adminAuth, adminRelatoriosRoutes);
app.use("/api/admin/dev-assistente", adminAuth, devAssistenteRoutes);
app.use("/api/admin/cms", adminAuth, adminCmsRoutes);

// =============================
// START
// =============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});