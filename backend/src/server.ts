import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
// import usersRoutes from "./routes/users"; // descomente quando o arquivo existir

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check / Test Route
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZLPix backend rodando no Render + Neon." });
});

// Routes
app.use("/auth", authRoutes);
// app.use("/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});