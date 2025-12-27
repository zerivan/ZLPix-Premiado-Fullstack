import { prisma } from "../lib/prisma";

export async function seedAppContentPages() {
  const contents = [
    {
      key: "home_info",
      type: "content",
      slug: "home",
      title: "Home – Texto Informativo",
      contentHtml: "", // ← ADM edita
      enabled: true,
    },
    {
      key: "home_footer",
      type: "content",
      slug: "home",
      title: "Home – Rodapé Informativo",
      contentHtml: "", // ← ADM edita
      enabled: true,
    },

    // 🎨 aparência (já funciona)
    {
      key: "app_appearance",
      type: "config",
      slug: "app-appearance",
      title: "Aparência do App",
      contentHtml: JSON.stringify({
        primaryColor: "#facc15",
        secondaryColor: "#16a34a",
        backgroundGradient:
          "from-blue-900 via-blue-800 to-green-800",
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