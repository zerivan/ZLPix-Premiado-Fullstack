function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(
          `https://zlpix-premiado-backend.onrender.com/api/admin/pages/${slug}`
        );

        if (!res.ok) {
          setPage(null);
          return;
        }

        const json = await res.json();
        if (json?.ok) setPage(json.data);
        else setPage(null);
      } catch {
        setPage(null);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando página...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen">
        Página não encontrada.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{page.title}</h1>

      {/* CMS HTML SIMPLES (SEM BLOCOS) */}
      {page.contentHtml && (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.contentHtml }}
        />
      )}
    </div>
  );
}