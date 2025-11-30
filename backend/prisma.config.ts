import { defineConfig } from "@prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_7HWgkJ3QCAXy@ep-dawn-wind-ahjcrny3-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!connectionString.startsWith("postgresql://")) {
  throw new Error("❌ DATABASE_URL inválida ou não detectada.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export default defineConfig({
  datasource: {
    provider: "postgresql",
    adapter,
  },
});
