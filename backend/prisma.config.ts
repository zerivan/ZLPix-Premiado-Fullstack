import { defineConfig } from "@prisma/config";

async function getConfig() {
  const pg = await import("@prisma/adapter-pg");

  // ✅ Função correta para Prisma 7+
  const adapter = pg.createPgAdapter({
    connectionString: process.env.DATABASE_URL!,
  });

  return defineConfig({
    datasource: {
      provider: "postgresql",
      adapter,
    },
  });
}

export default await getConfig();
