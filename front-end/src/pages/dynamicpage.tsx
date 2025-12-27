import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { api } from "../api/client";
import NavBottom from "../components/navbottom";

function renderBlocks(blocks: any[]) {
  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading":
        return (
          <h2 key={index} className="text-2xl font-bold mb-4">
            {block.text}
          </h2>
        );
      case "paragraph":
        return (
          <p key={index} className="mb-4">
            {block.text}
          </p>
        );
      case "divider":
        return <hr key={index} className="my-6" />;
      default:
        return null;
    }
  });
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();

  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 🚫 BLOQUEIO ABSOLUTO DE ROTAS ADMIN
  if (slug?.startsWith("admin")) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function loadPage() {
      try {
        const res = await api.get(`/api/admin/cms/content/${slug}`);

        if (res.data?.ok && res.data.data) {
          setPage(res.data.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [slug]);

  if (loading) {
    return <div className="p-6">Carregando página…</div>;
  }

  if (notFound || !page) {
    return <div className="p-6">Página não encontrada.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <main className="flex-1 px-6 pt-6 flex justify-center">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
          {page.title && (
            <h1 className="text-2xl font-bold mb-6">{page.title}</h1>
          )}

          {page.blocksJson && renderBlocks(page.blocksJson)}

          {!page.blocksJson && page.contentHtml && (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: page.contentHtml }}
            />
          )}
        </div>
      </main>

      <NavBottom />
    </div>
  );
}