import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const DIAS_PERMANENCIA = 8;

/**

* =====================================================

* ADMIN — RESULTADO DO SORTEIO

* =====================================================

* REGRA:

* - Lista deve existir mesmo sem apuração

* - Permanece por 8 dias

* - Baseado em sorteioData (fallback: createdAt)

* - Apenas ESPELHA o banco
    */
    router.get("/", async (req, res) => {
    try {
    const { sorteioData } = req.query;
  
  const agora = new Date();
  
  const whereClause: any = {};
  
  // 🔒 Filtro opcional por data específica (se informado)
  if (sorteioData) {
  const data = new Date(String(sorteioData));
  if (!isNaN(data.getTime())) {
  whereClause.sorteioData = data;
  }
  }
  
  const bilhetes = await prisma.bilhete.findMany({
  where: whereClause,
  orderBy: {
  createdAt: "desc",
  },
  include: {
  user: {
  select: {
  id: true,
  name: true,
  email: true,
  phone: true,
  pixKey: true,
  },
  },
  transacao: {
  select: {
  id: true,
  status: true,
  },
  },
  },
  });
  
  // 🔥 Regra de permanência (8 dias)
  const bilhetesFiltrados = bilhetes.filter((b) => {
  const base = b.sorteioData || b.createdAt;
  if (!base) return false;
  
  const inicio = new Date(base);
  
  const limite = new Date(inicio);
  limite.setDate(limite.getDate() + DIAS_PERMANENCIA);
  
  return agora.getTime() <= limite.getTime();
  });
  
  // 🔥 AGRUPAMENTO (mantido)
  const agrupado: Record<number, any> = {};
  
  for (const b of bilhetesFiltrados) {
  const userId = b.user.id;
  
  if (!agrupado[userId]) {
  agrupado[userId] = {
  userId,
  nome: b.user.name,
  email: b.user.email,
  telefone: b.user.phone,
  pixKey: b.user.pixKey,
  bilhetes: [],
  };
  }
  
  agrupado[userId].bilhetes.push({
  id: b.id,
  dezenas: b.dezenas,
  status: b.status,
  premio: b.premioValor ?? 0,
  resultadoFederal: b.resultadoFederal,
  apuradoEm: b.apuradoEm,
  transacaoId: b.transacao?.id ?? null,
  transacaoStatus: b.transacao?.status ?? null,
  });
  }
  
  const usuarios = Object.values(agrupado);
  
  return res.json({
  ok: true,
  total: usuarios.length,
  usuarios,
  });
  } catch (error) {
  console.error("Erro admin resultado:", error);
  return res.status(500).json({
  ok: false,
  error: "Erro ao buscar resultado",
  });
  }
  });

export default router;