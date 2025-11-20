#!/bin/bash

echo "🧹 Limpando arquivos errados no front-end..."
rm -f ../front-end/src/jsondb.ts
rm -rf ../front-end/json

echo "📦 Criando estrutura correta no backend..."
mkdir -p json

if [ ! -f json/meta.json ]; then
  echo '{"prize_base":500,"accumulated":0}' > json/meta.json
fi

if [ ! -f json/tickets.json ]; then
  echo "[]" > json/tickets.json
fi

if [ ! -f json/draws.json ]; then
  echo "[]" > json/draws.json
fi

echo "✏️ Reescrevendo backend/src/jsondb.ts..."
cat << 'EOC' > src/jsondb.ts
import fs from "fs";

export function load(file: string) {
  const path = \`json/\${file}\`;
  if (!fs.existsSync(path)) return file.endsWith(".json") ? [] : {};
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

export function save(file: string, data: any) {
  const path = \`json/\${file}\`;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

export function loadMeta() {
  return load("meta.json");
}

export function saveMeta(data: any) {
  save("meta.json", data);
}
EOC

echo "🔧 Ajustando imports do server.ts..."
sed -i 's#../jsondb#./jsondb#' src/server.ts
sed -i 's#../jsondb.ts#./jsondb#' src/server.ts

echo "🏗 Recriando build do backend..."
rm -rf dist
npm run build

echo "✅ Backend corrigido com sucesso!"
echo "Agora rode:"
echo "git add -A && git commit -m \"fix: backend jsondb definitivo\" && git push --force"
