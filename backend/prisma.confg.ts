import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    // Aqui fica a URL do banco agora
    url: process.env.DATABASE_URL!,
  },
});