import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";

/* =========================
   FONTES CUSTOMIZADAS
========================= */
const Font = Quill.import("formats/font");

Font.whitelist = [
  "inter",
  "poppins",
  "montserrat",
  "bebas",
  "oswald",
  "roboto",
];

Quill.register(Font, true);

/* =========================
   TOOLBAR PADRÃO (CORRIGIDO)
========================= */
const QUILL_MODULES = {
  toolbar: [
    [{ font: ["inter", "poppins", "montserrat", "bebas", "oswald", "roboto"] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

type EditorProps = {
  page: string;
  areaKey: string;
  areaTitle: string;
  initialHtml: string;
  onSave?: (html: string) => Promise<void> | void;
};

export default function EditorQuill({
  page,
  areaKey,
  areaTitle,
  initialHtml,
  onSave,
}: EditorProps) {
  const [html, setHtml] = useState<string>(initialHtml || "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const SITE_URL = window.location.origin;

  /* =========================
     🔤 CARREGA FONTES (EDITOR ISOLADO)
  ========================= */
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Poppins:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Oswald:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  /* =========================
     🔄 Atualiza conteúdo ao trocar área
  ========================= */
  useEffect(() => {
    setHtml(initialHtml || "");
    setDirty(false);
  }, [initialHtml, areaKey]);

  function handleChange(value: string) {
    setHtml(value);
    setDirty(true);
  }

  async function handleSave() {
    if (!onSave) return;

    try {
      setSaving(true);
      await onSave(html);
      setDirty(false);
      setIframeKey((k) => k + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ================= EDITOR ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{areaTitle}</h3>
            <p className="text-xs text-gray-500">
              Página: <strong>{page}</strong> • Área:{" "}
              <strong>{areaKey}</strong>
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`px-4 py-2 rounded text-white ${
              dirty
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        {/* 👇 FONTE FORÇADA NO QUILL */}
        <div
          style={{
            fontFamily:
              "'Inter','Poppins','Montserrat','Roboto','Oswald',system-ui",
          }}
        >
          <ReactQuill
            theme="snow"
            value={html}
            onChange={handleChange}
            modules={QUILL_MODULES}
          />
        </div>

        {dirty && (
          <p className="text-xs text-yellow-600">
            ⚠️ Conteúdo alterado e ainda não salvo
          </p>
        )}
      </div>

      {/* ================= PREVIEW REAL ================= */}
      <div className="relative border rounded overflow-hidden">
        <div className="bg-gray-800 text-white text-xs px-3 py-2 flex justify-between">
          <span>Preview real da página</span>
          <span className="text-yellow-300 font-semibold">
            Área ativa: {areaKey}
          </span>
        </div>

        <iframe
          key={iframeKey}
          src={`${SITE_URL}/?preview=1`}
          className="w-full h-[80vh] bg-white"
        />

        <div className="pointer-events-none absolute inset-0 border-4 border-yellow-400 rounded opacity-80">
          <div className="absolute top-4 left-4 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded shadow">
            ✏️ Editando: {areaTitle}
          </div>
        </div>
      </div>
    </div>
  );
}