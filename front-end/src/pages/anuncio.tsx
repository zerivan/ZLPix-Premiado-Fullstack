import { useEffect, useState } from "react";
import axios from "axios";

type CmsArea = {
  key: string;
  contentHtml: string;
};

export default function Anuncio() {
  const [html, setHtml] = useState<string>("");

  const BASE_URL = import.meta.env.VITE_API_URL;

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
  }, [BASE_URL]);

  return (
    <section className="anuncio-page min-h-screen bg-white flex flex-col">

      <header className="anuncio-header text-center py-8 bg-indigo-600 text-white">
        <h1 className="text-3xl font-bold">ZLPix Premiado</h1>
        <p className="text-sm opacity-90">
          seu jogo, sua chance, seu prêmio
        </p>
      </header>

      <section className="anuncio-hero text-center py-10 bg-yellow-100">
        <h2 className="text-2xl font-semibold">
          grande sorteio especial
        </h2>
        <p className="mt-2">
          o prêmio está acumulado e pode sair para você
        </p>
      </section>

      <section className="anuncio-content flex-1 max-w-4xl mx-auto p-6">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>

      <section className="anuncio-cta text-center py-8">
        <button
          onClick={() => (window.location.href = "/home")}
          className="bg-indigo-600 text-white px-6 py-3 rounded shadow"
        >
          acessar aplicativo
        </button>
      </section>

      <footer className="anuncio-footer text-center py-4 text-sm text-gray-500">
        © ZLPix Premiado
      </footer>

    </section>
  );
}