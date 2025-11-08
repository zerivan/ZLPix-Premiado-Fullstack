// backend/fix-config.js
import { writeFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("🧩 Corrigindo tsconfig.build.json...");

const config = {
  compilerOptions: {
    target: "ES2020",
    module: "CommonJS",
    moduleResolution: "node",
    outDir: "dist",
    rootDir: "src",
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    strict: true,
    skipLibCheck: true,
    resolveJsonModule: true,
    typeRoots: ["./node_modules/@types"],
    types: ["node"]
  },
  include: ["src/**/*"],
  exclude: ["node_modules", "dist"]
};

writeFileSync(
  join(__dirname, "tsconfig.build.json"),
  JSON.stringify(config, null, 2)
);

console.log("✅ tsconfig.build.json recriado com sucesso!");

console.log("📦 Instalando pacotes de tipos...");
execSync("npm install --save-dev @types/node @types/express @types/cors @types/qrcode", { stdio: "inherit" });

console.log("✨ Tudo pronto! Faça commit e push para o GitHub.");execSync("npm install --save-dev @types/node @types/express @types/cors @types/qrcode", { stdio: "inherit" });

console.log("✨ Tudo pronto! Faça commit e push para o GitHub.");
