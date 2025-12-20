import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

function renderBlocks(blocks: any[]) {
  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading":
        return <h2 key={index} className="text-2xl font-bold mb-4">{block.text}</h2>;
      case "paragraph":
        return <p key={index} className="mb-4">{block.text}</p>;
      case "divider":
        return <hr key={index} className="my-6" />;
      default:
        return null;
    }
  });
}

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await api.get(`/api/admin/cms/content/${slug}`);
        if (res.data?.ok) setPage(res.data.data);
      } catch {
        setPage(null);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [slug]);

  if (loading) return <div className="p-6">Carregando página…</div>;
  if (!page) return <div className="p-6">Página não encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{page.title}</h1>

      {page.blocksJson && renderBlocks(page.blocksJson)}

      {!page.blocksJson && page.contentHtml && (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      )}
    </div>
  );
}
