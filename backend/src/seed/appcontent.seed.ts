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

    // 👇 APARÊNCIA GLOBAL DO APP (ESPELHO DO FRONT)
    {
      key: "app_appearance",
      type: "config",
      slug: "app-appearance",
      title: "Aparência do App",
      contentHtml: JSON.stringify({
        primaryColor: "#4f46e5",
        secondaryColor: "#6366f1",
        accentColor: "#f59e0b",
        backgroundColor: "#ffffff",
        themeMode: "light",
        fontPrimary: "Inter",
        fontHeading: "Inter",
      }),
      enabled: true,
    },
  ];

  for (const page of pages) {
    await prisma.appContent.upsert({
      where: { key: page.key },
      update: {
        title: page.title,
        contentHtml: page.contentHtml,
        enabled: page.enabled,
      },
      create: page,
    });
  }
}