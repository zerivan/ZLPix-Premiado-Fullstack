import { defineConfig } from "@prisma/config";
import { createPgAdapter } from "@prisma/adapter-pg";

export default defineConfig({
  datasource: {
    provider: "postgresql",
    adapter: createPgAdapter({
      connectionString: process.env.DATABASE_URL!,
    }),
  },
});
