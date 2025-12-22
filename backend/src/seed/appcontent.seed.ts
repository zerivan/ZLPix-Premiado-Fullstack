import { prisma } from "../lib/prisma";

export async function seedAppContentPages() {
  const pages = [
    {
      key: "home",
      type: "page",
      slug: "home",
      title: "Página Inicial",
      contentHtml: "<h1>Bem-vindo ao ZLPix</h1>",
      enabled: true,
    },
    {
      key: "sobre",
      type: "page",
      slug: "sobre",
      title: "Sobre o ZLPix",
      contentHtml: "<p>Informações sobre a plataforma.</p>",
      enabled: true,
    },
    {
      key: "ajuda",
      type: "page",
      slug: "ajuda",
      title: "Ajuda",
      contentHtml: "<p>Central de ajuda do sistema.</p>",
      enabled: true,
    },
  ];

  for (const page of pages) {
    await prisma.appContent.upsert({
      where: { key: page.key },
      update: {},
      create: page,
    });
  }
}
