import { prisma } from "../lib/prisma";

export async function seedAppContentPages() {
  const contents = [
    // =========================
    // HOME — CONTEÚDO EDITÁVEL
    // =========================
    {
      key: "home_html",
      type: "content",
      title: "Home — Conteúdo HTML",
      contentHtml: "", // começa vazio, o ADM edita
      enabled: true,
    },

    // =========================
    // APARÊNCIA GLOBAL DO APP
    // =========================
    {
      key: "app_appearance",
      type: "config",
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

  for (const item of contents) {
    await prisma.appContent.upsert({
      where: { key: item.key },
      update: {
        title: item.title,
        contentHtml: item.contentHtml,
        enabled: item.enabled,
      },
      create: item,
    });
  }
}