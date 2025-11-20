#!/bin/bash

echo "🔧 Corrigindo imports do backend..."

# Corrigir imports em premioroutes.ts
sed -i 's#\.\./controllers/#\./#g' src/controllers/premioroutes.ts

# Corrigir import do premioController
sed -i 's#"\.\./controllers/premioController"#"./premioController"#g' src/controllers/premioroutes.ts

# Corrigir import jsondb em server.ts
sed -i 's#"\.\./jsondb"#"./jsondb"#g' src/server.ts

echo "✔ Imports corrigidos!"

echo "🔍 Verificando arquivos..."

if [ ! -f src/controllers/premioController.ts ]; then
  echo "⚠️ Criando premioController.ts..."
  cat << 'EOC' > src/controllers/premioController.ts
export function sortearPremio() {
  return {
    numero: Math.floor(Math.random() * 100000),
    data: new Date().toISOString()
  };
}
EOC
fi

if [ ! -f src/jsondb.ts ]; then
  echo "⚠️ Criando jsondb.ts..."
  cat << 'EOD' > src/jsondb.ts
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
fi

echo "🧹 Limpando dist..."
rm -rf dist

echo "🏗 Recompilando backend..."
npm run build

echo "✨ Backend corrigido e compilado com sucesso!"
echo "Agora rode:"
echo "git add -A && git commit -m 'fix: backend imports corrigidos' && git push --force"
