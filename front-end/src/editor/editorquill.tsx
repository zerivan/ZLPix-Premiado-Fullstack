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
    [{ list: "ordered" }, { list: "bullet"] },
    ["link", "image"], // ✅ imagem liberada
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
      console.log("🚀 Tentando enviar push...");
      setSendingPush(true);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
      console.log("🔐 Token encontrado:", !!token);

      if (!token) {
        alert("Token admin não encontrado.");
        return;
      }

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

      console.log("📦 Payload:", payload);

      const response = await fetch(
        `${API_URL}/api/admin/push/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("📡 Status:", response.status);

      const data = await response.json().catch(() => null);
      console.log("📡 Response:", data);

      setShowPushModal(false);
      setUserId("");

    } catch (err) {
      console.error("❌ Erro no envio:", err);
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
                type="button"
                onClick={() => setShowPushModal(true)}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Disparar Push
              </button>
            )}

            <button
              type="button"
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

      {showPushModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md space-y-4">
            <h4 className="font-semibold text-lg">
              Disparar notificação
            </h4>

            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={pushType === "broadcast"}
                  onChange={() => setPushType("broadcast")}
                />
                Enviar para todos
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={pushType === "user"}
                  onChange={() => setPushType("user")}
                />
                Usuário específico
              </label>

              {pushType === "user" && (
                <input
                  type="number"
                  placeholder="ID do usuário"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPushModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSendPush}
                disabled={sendingPush}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {sendingPush ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}