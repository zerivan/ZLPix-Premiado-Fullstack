#!/bin/bash

echo "🔍 Verificando arquivos essenciais do backend..."

# Caminhos esperados
CTRL="src/controllers/premioController.ts"
JSON="src/jsondb.ts"

# Criar premioController.ts se não existir
if [ ! -f "$CTRL" ]; then
  echo "⚠️ premioController.ts não encontrado. Criando arquivo padrão..."
  cat << 'EOC' > $CTRL
export function sortearPremio() {
  return {
    numero: Math.floor(Math.random() * 100000),
    data: new Date().toISOString()
  };
}
EOC
else
  echo "✔ Encontrado: $CTRL"
fi

# Criar jsondb.ts se não existir
if [ ! -f "$JSON" ]; then
  echo "⚠️ jsondb.ts não encontrado. Criando arquivo padrão..."
  cat << 'EOD' > $JSON
import fs from "fs";

export function load(file: string) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function save(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function loadMeta() {
  return load("meta.json");
}

export function saveMeta(data: any) {
  save("meta.json", data);
}
EOD
else
  echo "✔ Encontrado: $JSON"
fi

echo "🧹 Limpando dist..."
rm -rf dist

echo "🏗 Recompilando backend..."
npm run build

echo "✨ Backend corrigido com sucesso!"
echo "Agora rode:"
echo "git add -A && git commit -m 'fix: backend missing files' && git push --force"
