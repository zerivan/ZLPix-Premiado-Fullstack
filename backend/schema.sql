-- SQL de sincronização manual para tabela User
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  pixKey TEXT,
  passwordHash TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
