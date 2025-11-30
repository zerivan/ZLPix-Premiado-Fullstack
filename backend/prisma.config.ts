import { defineConfig } from "@prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

// ✅ Garante que o .env é carregado ANTES de ler a variável
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ Variável DATABASE_URL não encontrada no ambiente.");
}

if (!connectionString.startsWith("postgresql://")) {
  throw new Error("❌ DATABASE_URL inválida. Valor atual: " + connectionString);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export default defineConfig({
  datasource: {
    provider: "postgresql",
    adapter,
  },
});
