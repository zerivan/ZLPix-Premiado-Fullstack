import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";

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

const QUILL_MODULES = {
  toolbar: [
    [{ font: ["inter", "poppins", "montserrat", "bebas", "oswald", "roboto"] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
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
      setSendingPush(true);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

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
        const normalizedUserId = Number(userId);

        if (!userId || Number.isNaN(normalizedUserId) || normalizedUserId <= 0) {
          alert("Informe um userId válido.");
          return;
        }

        payload.userId = normalizedUserId;
      }

      const response = await fetch(`${API_URL}/api/admin/push/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.ok === false) {
        throw new Error(data?.error || data?.message || "Falha no push");
      }

      alert(
        `Sucesso: ${data?.successCount ?? 0} | Falha: ${data?.failureCount ?? 0}`
      );

      setShowPushModal(false);
      setUserId("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro no push");
    } finally {
      setSendingPush(false);
    }
  }

  return null; // JSX mantido fora para não poluir
}