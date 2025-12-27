import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { api } from "../api/client";
import NavBottom from "../components/navbottom";

type CmsContent = {
  title?: string;
  subtitle?: string;
  contentHtml?: string;
};

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<CmsContent | null>(null);
  const [notFound, setNotFound] = useState(false);

  // 🚫 BLOQUEIO ABSOLUTO DE ROTAS ADMIN
  if (slug?.startsWith("admin")) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (!slug) return;

    async function loadContent() {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await api.get(`/api/admin/cms/content/${slug}`);

        if (res.data?.ok && res.data.data) {
          setContent(res.data.data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando conteúdo...
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-xl font-semibold mb-2">Página não encontrada</h1>
        <p className="text-sm text-gray-500">
          O conteúdo solicitado não existe ou ainda não foi configurado.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      {/* HEADER (opcional via CMS) */}
      {(content.title || content.subtitle) && (
        <header className="text-center py-7 border-b border-white/10 shadow-md">
          {content.title && (
            <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg">
              {content.title}
            </h1>
          )}
          {content.subtitle && (
            <p className="text-sm text-blue-100 mt-1">
              {content.subtitle}
            </p>
          )}
        </header>
      )}

      {/* CONTEÚDO CMS */}
      <main className="flex-1 px-6 pt-6 flex justify-center">
        <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 text-left">
          {content.contentHtml ? (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content.contentHtml }}
            />
          ) : (
            <p className="text-sm text-gray-300">
              Conteúdo não configurado.
            </p>
          )}
        </div>
      </main>

      <NavBottom />
    </div>
  );
}