/**
 * Serviço interno de diagnóstico técnico
 * NÃO depende de serviços externos
 * NÃO quebra o backend
 * Seguro para produção
 */

export async function analisarErro(pergunta: string): Promise<string> {
  const texto = pergunta.toLowerCase();

  if (texto.includes("404")) {
    return "Diagnóstico: Erro 404 indica rota inexistente ou não registrada no server.ts.";
  }

  if (texto.includes("401") || texto.includes("token")) {
    return "Diagnóstico: Erro de autenticação. Verifique TOKEN_ZLPIX_ADMIN e middleware adminAuth.";
  }

  if (texto.includes("prisma")) {
    return "Diagnóstico: Verifique conexão com banco e schema Prisma.";
  }

  if (texto.includes("build")) {
    return "Diagnóstico: Erro de build. Verifique imports e exports (default vs named).";
  }

  return "Diagnóstico automático: Nenhum padrão crítico identificado. Verifique logs do backend.";
}
