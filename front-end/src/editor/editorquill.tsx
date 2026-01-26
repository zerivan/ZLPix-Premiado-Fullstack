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

  const [showPushModal, setShowPushModal] = useState(false);
  const [pushType, setPushType] = useState<"broadcast" | "user">("broadcast");
  const [userId, setUserId] = useState("");
  const [sendingPush, setSendingPush] = useState(false);

  const SITE_URL = window.location.origin;

  // 🔥 URL FIXA DO BACKEND (CORREÇÃO DEFINITIVA)
  const API_URL = "https://zlpix-premiado-fullstack.onrender.com";

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

  async function handleSendPush() {
    try {
      setSendingPush(true);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
      if (!token) return;

      const payload: any = {
        title: "ZLPix Premiado",
        body: "Nova atualização disponível",
        url: "/anuncio",
      };

      if (pushType === "broadcast") {
        payload.broadcast = true;
      } else {
        payload.userId = Number(userId);
      }

      await fetch(`${API_URL}/api/admin/push/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setShowPushModal(false);
      setUserId("");
    } finally {
      setSendingPush(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-semibold text-lg">{areaTitle}</h3>
            <p className="text-xs text-gray-500">
              Página: <strong>{page}</strong> • Área:{" "}
              <strong>{areaKey}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            {page === "anuncio" && (
              <button
                onClick={() => setShowPushModal(true)}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Disparar Push
              </button>
            )}

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
        </div>

        <ReactQuill
          theme="snow"
          value={html}
          onChange={handleChange}
          modules={QUILL_MODULES}
        />

        {dirty && (
          <p className="text-xs text-yellow-600">
            Conteúdo alterado e ainda não salvo
          </p>
        )}
      </div>

      <div className="relative border rounded overflow-hidden">
        <div className="bg-gray-800 text-white text-xs px-3 py-2 flex justify-between">
          <span>Preview real da página</span>
          <span className="text-yellow-300 font-semibold">
            Área ativa: {areaKey}
          </span>
        </div>

        <iframe
          key={iframeKey}
          src={`${SITE_URL}/${page}?preview=1`}
          className="w-full h-[80vh] bg-white"
        />
      </div>
    </div>
  );
}