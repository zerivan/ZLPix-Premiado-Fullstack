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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}