import { defineConfig } from "@prisma/config";
import { createPostgresAdapter } from "@prisma/adapter-pg";

export default defineConfig({
  datasource: {
    provider: "postgresql",
    adapter: createPostgresAdapter({
      connectionString: process.env.DATABASE_URL!,
    }),
  },
});
