import { useEffect, useState } from "react";
import axios from "axios";

type CmsArea = {
  key: string;
  contentHtml: string;
};

export default function Anuncio() {
  const [html, setHtml] = useState<string>("");

  const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/cms/public/anuncio`
        );

        const area = res.data?.areas?.find(
          (a: CmsArea) => a.key === "anuncio_main"
        );

        if (area?.contentHtml) {
          setHtml(area.contentHtml);
        }
      } catch (error) {
        console.error("Erro ao carregar anúncio:", error);
      }
    }

    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-700 flex flex-col">

      {/* HEADER */}
      <header className="text-center py-10 text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">
          ZLPix Premiado
        </h1>
        <p className="mt-2 text-sm opacity-90">
          Sua chance real de ganhar prêmios todos os dias
        </p>
      </header>

      {/* HERO CARD */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Grande Sorteio Especial
            </h2>
            <p className="mt-3 text-gray-600">
              Participe agora e aumente suas chances de ganhar.
            </p>
          </div>

          {/* CONTEÚDO DINÂMICO CMS */}
          <div className="prose max-w-none text-gray-700">
            <div
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <button
              onClick={() => (window.location.href = "/home")}
              className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-lg"
            >
              Acessar Aplicativo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 py-6 text-center text-white text-sm opacity-80">
        © {new Date().getFullYear()} ZLPix Premiado. Todos os direitos reservados.
      </footer>
    </div>
  );
}