// reset-db.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("🔄 RESET do banco Neon iniciado...");

  try {
    console.log("🧹 Removendo tabelas antigas (DROP IF EXISTS)...");
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Transacao" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Bilhete" CASCADE`);

    console.log("🏗️ Recriando tabelas...");

    // TABELA BILHETE
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Bilhete" (
        id BIGSERIAL PRIMARY KEY,
        userId BIGINT NOT NULL,
        dezenas TEXT NOT NULL,
        valor DOUBLE PRECISION NOT NULL,
        pago BOOLEAN DEFAULT FALSE,
        sorteioData TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "Users"(id)
      );
    `);

    // TABELA TRANSACAO
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Transacao" (
        id BIGSERIAL PRIMARY KEY,
        userId BIGINT NOT NULL,
        bilheteId BIGINT UNIQUE NOT NULL,
        valor DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'pending',
        mpPaymentId TEXT UNIQUE NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_user_trans FOREIGN KEY ("userId") REFERENCES "Users"(id),
        CONSTRAINT fk_bilhete FOREIGN KEY ("bilheteId") REFERENCES "Bilhete"(id)
      );
    `);

    console.log("✅ Tabelas criadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao resetar banco:", err);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();