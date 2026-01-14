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
   TOOLBAR PADRÃO
========================= */
const QUILL_MODULES = {
  toolbar: [
    [{ font: Font.whitelist }],
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
  /** contexto vindo do CMS */
  page: string;
  areaKey: string;
  areaTitle: string;

  /** conteúdo inicial */
  initialHtml: string;

  /** callbacks */
  onChange?: (html: string) => void;
  onSave?: (html: string) => Promise<void> | void;
};

export default function EditorQuill({
  page,
  areaKey,
  areaTitle,
  initialHtml,
  onChange,
  onSave,
}: EditorProps) {
  const [html, setHtml] = useState<string>(initialHtml || "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  /* 🔄 Atualiza conteúdo quando CMS trocar área */
  useEffect(() => {
    setHtml(initialHtml || "");
    setDirty(false);
  }, [initialHtml, areaKey]);

  function handleChange(value: string) {
    setHtml(value);
    setDirty(true);
    onChange?.(value);
  }

  async function handleSave() {
    if (!onSave) return;

    try {
      setSaving(true);
      await onSave(html);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  return (
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

      <ReactQuill
        theme="snow"
        value={html}
        onChange={handleChange}
        modules={QUILL_MODULES}
      />

      {dirty && (
        <p className="text-xs text-yellow-600">
          ⚠️ Conteúdo alterado e ainda não salvo
        </p>
      )}
    </div>
  );
}