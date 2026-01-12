import { seedAppContentPages } from "./seed/appcontent.seed";

import "dotenv/config";
import express from "express";
import cors from "cors";

// ROTAS DO SITE
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";

// 🆕 PUSH NOTIFICATIONS
import pushRoutes from "./routes/push";

// ROTAS ADMIN (BANCO DE DADOS)
import adminUsuariosRoutes from "./routes/admin-usuarios";
import adminGanhadoresRoutes from "./routes/admin-ganhadores";
import adminRelatoriosRoutes from "./routes/admin-relatorios";
import adminCmsRoutes from "./routes/admin-cms";
import adminApuracaoRoutes from "./routes/admin-apuracao";
import adminConfiguracoesRoutes from "./routes/admin-configuracoes";

// ✅ IA CHATGPT DO PAINEL ADMIN
import devAssistenteRoutes from "./routes/dev-assistente";

// 🆕 CMS PÚBLICO (APP / CLIENTE)
import cmsPublicRoutes from "./routes/cms-public";

// 🆕 CMS PREVIEW (IFRAME)
import cmsPreviewRoutes from "./routes/cms-preview";

// Middleware ADMIN
import { adminAuth } from "./middlewares/adminAuth";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// HEALTHCHECK
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando!",
  });
});

// ============================
// ROTAS DO SITE (APP)
// ============================
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);
app.use("/pix", pixRoutes);
app.use("/pix/webhook", pixWebhookRoutes);
app.use("/bilhete", bilheteRoutes);

// ============================
// PUSH NOTIFICATIONS (APP)
// ============================
app.use("/", pushRoutes);

// ============================
// CMS PÚBLICO (APP / CLIENTE)
// ============================
app.use("/api/cms/public", cmsPublicRoutes);

// ============================
// CMS PREVIEW (IFRAME)
// ============================
app.use("/api/cms", cmsPreviewRoutes);

// ============================
// ROTAS ADMIN (PROTEGIDAS)
// ============================
app.use("/api/admin/usuarios", adminAuth, adminUsuariosRoutes);
app.use("/api/admin/ganhadores", adminAuth, adminGanhadoresRoutes);
app.use("/api/admin/relatorios", adminAuth, adminRelatoriosRoutes);
app.use("/api/admin/cms", adminAuth, adminCmsRoutes);
app.use("/api/admin/apuracao", adminAuth, adminApuracaoRoutes);
app.use(
  "/api/admin/configuracoes",
  adminAuth,
  adminConfiguracoesRoutes
);

// ✅ CHATGPT REAL DO PAINEL ADMIN
app.use(
  "/api/admin/ia/chat",
  adminAuth,
  devAssistenteRoutes
);

// ============================
// SEED AUTOMÁTICO (PRODUÇÃO)
// ============================
if (process.env.RUN_SEED === "true") {
  seedAppContentPages().catch((err) => {
    console.error("❌ Erro ao executar seed AppContent:", err);
  });
}

// START
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});