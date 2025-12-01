import { defineConfig } from "@prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Usa a variável de ambiente ou um fallback seguro (apenas para build)
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://fallback_user:fallback_password@localhost:5432/fallbackdb?sslmode=disable";

console.log("🔌 Prisma config: usando DATABASE_URL =>", process.env.DATABASE_URL ? "definida" : "fallback");

const pool = new pg.Pool({
  connectionString,
  ssl:
    connectionString.includes("neon.tech") ||
    connectionString.includes("render.com") ||
    connectionString.includes("prisma.io")
      ? { rejectUnauthorized: false }
      : false,
});

const adapter = new PrismaPg(pool);

export default defineConfig({
  datasource: {
    provider: "postgresql",
    adapter,
  },
});
