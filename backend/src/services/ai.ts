/**
 * Serviço interno de diagnóstico técnico e análise conversacional
 * Seguro para produção
 * Não executa ações destrutivas
 */

export async function analisarErro(pergunta: string): Promise<string> {
  const texto = pergunta.toLowerCase();

  // ===============================
  // 🔹 MODO 1 — DIAGNÓSTICO DIRETO
  // ===============================
  if (texto.includes("404")) {
    return "Diagnóstico: Erro 404 indica rota inexistente ou não registrada no server.ts.";
  }

  if (texto.includes("401") || texto.includes("token")) {
    return "Diagnóstico: Erro de autenticação. Verifique TOKEN_ZLPIX_ADMIN e middleware adminAuth.";
  }

  if (texto.includes("prisma")) {
    return "Diagnóstico: Verifique conexão com banco de dados, migrations e schema Prisma.";
  }

  if (texto.includes("build")) {
    return "Diagnóstico: Erro de build. Verifique imports/exportações (default vs named), paths e case-sensitive.";
  }

  // ===============================
  // 🔹 MODO 2 — CONVERSACIONAL
  // ===============================
  // Perguntas abertas, análise de regras, arquitetura, fluxo
  return `
Análise técnica:

A pergunta não descreve um erro explícito (como 401, 404, build ou prisma),
portanto o problema deve estar relacionado a regra de negócio, fluxo do sistema
ou comportamento esperado que ainda não foi implementado ou está estático.

Sugestão de abordagem:
1. Identifique se o comportamento esperado depende de regra dinâmica (ex: prêmio acumulado).
2. Verifique se o valor vem de CMS, config.json ou código fixo.
3. Confirme se existe persistência de estado entre execuções (sorteios anteriores).
4. Localize o arquivo responsável pela regra antes de alterar qualquer coisa.

Se quiser, descreva:
- qual comportamento você espera
- onde isso aparece no sistema (tela/aba)
- se hoje o valor está fixo ou variável

Com isso, posso indicar exatamente a causa e o ponto de correção.
`.trim();
}
