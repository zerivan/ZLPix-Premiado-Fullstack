diff --git a/backend/src/server.ts b/backend/src/server.ts
index cf16a1cc32826c7675098a6e2c68ae4661a07407..068e8b8a2d43b65f92ac2aff1ea0d97ff911ca8c 100644
--- a/backend/src/server.ts
+++ b/backend/src/server.ts
@@ -1,50 +1,51 @@
 import "dotenv/config";
 import express from "express";
 import cors from "cors";
 
 // 🔥 IMPORTA O CRON DO SORTEIO (AUTO-EXECUÇÃO)
 import "./jobs/sorteio-cron";
 
 // ROTAS DO SITE
 import authRoutes from "./routes/auth";
 import federalRoutes from "./routes/federal";
 import pixRoutes from "./routes/pix";
 import pixWebhookRoutes from "./routes/pixwebhook";
 import bilheteRoutes from "./routes/bilhetes";
 import walletRoutes from "./routes/wallet";
 
 // PUSH
 import pushRoutes from "./routes/push";
 
 // 🔥 NOVO: ADMIN PUSH MANUAL
 import adminPushRoutes from "./routes/admin-push";
 
 // ROTAS ADMIN
 import adminUsuariosRoutes from "./routes/admin-usuarios";
 import adminGanhadoresRoutes from "./routes/admin-ganhadores";
 import adminRelatoriosRoutes from "./routes/admin-relatorios";
+import adminRelatoriosV2Routes from "./routes/admin-relatorios-v2";
 import adminCmsRoutes from "./routes/admin-cms";
 import adminApuracaoRoutes from "./routes/admin-apuracao";
 import adminConfiguracoesRoutes from "./routes/admin-configuracoes";
 import adminSaquesRoutes from "./routes/admin-saques";
 import adminSorteioRoutes from "./routes/admin-sorteio";
 
 // IA ADMIN
 import devAssistenteRoutes from "./routes/dev-assistente";
 
 // 🔥 NOVO: ASSISTENTE CLIENTE
 import assistantRoutes from "./routes/assistant";
 
 // CMS
 import cmsPublicRoutes from "./routes/cms-public";
 import cmsPreviewRoutes from "./routes/cms-preview";
 
 // Middleware ADMIN
 import { adminAuth } from "./middlewares/adminAuth";
 
 // 🔥 PRISMA
 import { prisma } from "./lib/prisma";
 
 const app = express();
 const PORT = Number(process.env.PORT) || 4000;
 
@@ -150,47 +151,48 @@ app.get("/", (_req, res) => {
 app.use("/auth", authRoutes);
 
 // 🔥 FEDERAL — DUPLA ROTA
 app.use("/api/federal", federalRoutes);
 app.use("/federal", federalRoutes);
 
 app.use("/pix/webhook", pixWebhookRoutes);
 app.use("/pix", pixRoutes);
 app.use("/bilhete", bilheteRoutes);
 app.use("/wallet", walletRoutes);
 app.use("/push", pushRoutes);
 
 // 🔥 ASSISTENTE
 app.use("/api/assistant", assistantRoutes);
 
 // CMS
 app.use("/api/cms/public", cmsPublicRoutes);
 app.use("/api/cms", cmsPreviewRoutes);
 
 // ============================
 // ROTAS ADMIN
 // ============================
 app.use("/api/admin/usuarios", adminAuth, adminUsuariosRoutes);
 app.use("/api/admin/ganhadores", adminAuth, adminGanhadoresRoutes);
 app.use("/api/admin/relatorios", adminAuth, adminRelatoriosRoutes);
+app.use("/api/admin/relatorios-v2", adminAuth, adminRelatoriosV2Routes);
 app.use("/api/admin/cms", adminAuth, adminCmsRoutes);
 app.use("/api/admin/apuracao", adminAuth, adminApuracaoRoutes);
 app.use("/api/admin/configuracoes", adminAuth, adminConfiguracoesRoutes);
 app.use("/api/admin/saques", adminAuth, adminSaquesRoutes);
 app.use("/api/admin/sorteio", adminAuth, adminSorteioRoutes);
 
 // 🔥 ADMIN PUSH
 app.use("/api/admin/push", adminAuth, adminPushRoutes);
 
 // IA ADMIN
 app.use(
   "/api/admin/ia/chat",
   adminAuth,
   devAssistenteRoutes
 );
 
 // ============================
 // START
 // ============================
 app.listen(PORT, "0.0.0.0", () => {
   console.log(`🔥 Servidor rodando na porta ${PORT}`);
 });
\ No newline at end of file
