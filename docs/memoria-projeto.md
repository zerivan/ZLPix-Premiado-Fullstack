# 🧠 Memória Viva do Projeto — ZLPix Premiado

Este arquivo registra o CONTEXTO REAL do projeto.
Não é documentação genérica. É memória operacional.

Qualquer pessoa ou IA que leia isto deve entender:
- o que o projeto é
- como funciona
- como trabalhamos
- e o que NÃO pode ser feito sem autorização

---

## 🔑 Identidade

Projeto: ZLPix Premiado  
Autor: Zerivan Lima  

Stack:
- Front-end: React + Vite + Tailwind
- Backend: Node.js + Express
- Banco: Prisma
- Pagamentos: PIX
- Dev local: Termux (Android)
- Deploy oficial: Render

---

## 🧠 Regra de Ouro (NÃO QUEBRAR)

1. Nada é criado sem confirmação
2. Nada é “melhorado” por iniciativa própria
3. Alterações são cirúrgicas
4. Um arquivo por vez
5. Um comando por vez
6. Layout NÃO pode ser alterado sem autorização
7. Código final sempre pronto para colar

Improvisar quebra o projeto.

---

## 🎯 Objetivo

Sistema de apostas com:
- Bilhetes
- Sorteios
- Pagamento PIX
- Área do usuário
- Painel administrativo completo

O **Painel Administrativo é crítico**.

---

## 🛠️ Painel Administrativo (FOCO ATUAL)

Arquivo central:
front-end/src/admindashboard.tsx

Características:
- NÃO usa rotas para trocar conteúdo
- Usa abas internas (state)
- Renderização depende 100% do front

Se o painel não renderiza:
- erro NÃO está no layout
- erro NÃO está no JSX
- erro quase sempre está:
  - em rotas do front
  - fallback (*) pegando antes
  - import errado
  - endpoint errado

---

## 🔗 CMS (Conteúdo / Aparência)

Backend:
- Tudo fica em /api/admin/cms

Front:
- Aparência usa admin-cms
- Conteúdo usa admin-cms
- Nunca usar rota pública para CMS admin

---

## 🚨 Problemas já enfrentados

- 404 silencioso por rota dinâmica mal posicionada
- Fallback interceptando CMS
- Import default vs named quebrando build
- Cache enganando testes
- Prisma NÃO funciona no Android (ignorar local)

---

## 📱 Regra do Termux

No Android:
- Prisma quebra
- Backend local NÃO é referência
- O que importa:
  - build passar
  - front renderizar
  - lógica correta

Teste real = Render.

---

## 🤖 IA Interna do Projeto

Existe um módulo de diagnóstico.

Ela deve:
- analisar código real
- evitar respostas genéricas
- perguntar antes de alterar arquivos
- nunca decidir sozinha

Ela é assistente, não chefe.

---

## 🧠 Filosofia

Se não foi testado, não está pronto.
Se funciona mas não foi entendido, não está finalizado.
Prova vale mais que suposição.

---

Fim da memória viva.
