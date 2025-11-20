#!/bin/bash

echo "🔧 Corrigindo jsondb.ts ..."

cat << 'EOC' > src/jsondb.ts
import fs from "fs";
import path from "path";

// 📌 Diretório fixo onde ficarão os JSON (Render + local)
const DB_DIR = path.join(__dirname, "..", "json");

// Garante a pasta
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function full(pathFile: string) {
  return path.join(DB_DIR, pathFile);
}

export function load(file: string) {
  const p = full(file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function save(file: string, data: any) {
  const p = full(file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

export function loadMeta() {
  return load("meta.json");
}

export function saveMeta(data: any) {
  save("meta.json", data);
}
EOC

echo "📦 Criando pasta json/"
mkdir -p json

echo "{}" > json/meta.json
echo "[]" > json/tickets.json
echo "[]" > json/draws.json

echo "✨ jsondb.ts corrigido!"
echo "Agora rode:"
echo "npm run build"
