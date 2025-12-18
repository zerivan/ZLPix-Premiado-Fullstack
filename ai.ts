looking for funding
  run `npm fund` for details
7 vulnerabilities (3 low, 4 high)
To address issues that do not require attention, run:
  npm audit fix
To address all issues, run:
  npm audit fix --force
Run `npm audit` for details.
> zlpix-backend@1.0.0 build
> PRISMA_CLIENT_ENGINE_TYPE=wasm npx prisma generate && tsc -p tsconfig.json
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.15.0) to ./node_modules/@prisma/client in 501ms
Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
```
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```
or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
```
import { PrismaClient } from '@prisma/client/edge'
const prisma = new PrismaClient()
```
See other ways of importing Prisma Client: http://pris.ly/d/importing-client
┌─────────────────────────────────────────────────────────────┐
│  Deploying your app to serverless or edge functions?        │
│  Try Prisma Accelerate for connection pooling and caching.  │
│  https://pris.ly/cli/--accelerate                           │
└─────────────────────────────────────────────────────────────┘
src/routes/diagnóstico.ts(2,29): error TS2307: Cannot find module '../services/ai' or its corresponding type declarations.
src/server.ts(11,31): error TS2307: Cannot find module './routes/diagnostico' or its corresponding type declarations.
src/services/aí.ts(1,20): error TS2307: Cannot find module 'openai' or its corresponding type declarations.
==> Build failed 😞
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
Need better ways to work with logs? Try theRender CLI, Render MCP Server, or set up a log stream integration 
