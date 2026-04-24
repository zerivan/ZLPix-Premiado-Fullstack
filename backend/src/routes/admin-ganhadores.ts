import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
try {
const bilhetes = await prisma.bilhete.findMany({
where: {
pago: true,
},
include: {
user: true,
},
orderBy: {
id: "desc",
},
});

const agrupado: Record<number, any> = {};

for (const b of bilhetes) {
  if (!agrupado[b.userId]) {
    agrupado[b.userId] = {
      userId: b.userId,
      nome: b.user?.nome || "Usuário",
      bilhetes: [],
    };
  }

  agrupado[b.userId].bilhetes.push({
    id: b.id,
    dezenas: b.dezenas,
    status: b.status,
  });
}

const usuarios = Object.values(agrupado);

console.log("📊 [ADMIN-GANHADORES]");
console.log("Total:", bilhetes.length);
console.log("Usuários:", usuarios.length);

return res.json({
  usuarios,
});

} catch (error) {
console.error("Erro admin-ganhadores:", error);
return res.status(500).json({
ok: false,
error: "Erro ao buscar ganhadores",
});
}
});

export default router;