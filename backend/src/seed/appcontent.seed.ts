import { prisma } from "../lib/prisma";

export async function seedAppContentPages() {
  const contents = [
    {
      key: "home_info",
      type: "content",
      slug: "home_info",
      title: "Home – Texto Informativo",
      contentHtml: "",
      enabled: true,
    },
    {
      key: "home_footer",
      type: "content",
      slug: "home_footer",
      title: "Home – Rodapé",
      contentHtml: "",
      enabled: true,
    },
    {
      key: "resultado_info",
      type: "content",
      slug: "resultado_info",
      title: "Resultado – Informações",
      contentHtml: "",
      enabled: true,
    },
    {
      key: "pix_info",
      type: "content",
      slug: "pix_info",
      title: "PIX – Informações",
      contentHtml: "",
      enabled: true,
    },
    {
      key: "perfil_info",
      type: "content",
      slug: "perfil_info",
      title: "Perfil – Informações",
      contentHtml: "",
      enabled: true,
    },
    {
      key: "carteira_info",
      type: "content",
      slug: "carteira_info",
      title: "Carteira – Informações",
      contentHtml: "",
      enabled: true,
    },
    {
      key: "app_appearance",
      type: "config",
      slug: "app_appearance",
      title: "Aparência do App",
      contentHtml: JSON.stringify({
        primaryColor: "#facc15",
        secondaryColor: "#16a34a",
        accentColor: "#f59e0b",
        backgroundColor: "#0f172a",
        themeMode: "dark",
        fontPrimary: "Inter",
        fontHeading: "Inter",
      }),
      enabled: true,
    },
    {
      key: "configuracoes_gerais",
      type: "config",
      slug: "configuracoes_gerais",
      title: "Configurações do Sistema",
      contentHtml: JSON.stringify({
        modoManutencao: false,
        diagnosticoIA: true,
        painelFinanceiro: true,
      }),
      enabled: true,
    },
    {
      key: "premio_atual",
      type: "config",
      slug: "premio_atual",
      title: "Prêmio Atual",
      contentHtml: "500",
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
        type: item.type,
      },
      create: item,
    });
  }
}