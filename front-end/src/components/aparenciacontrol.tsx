import { useEffect, useState } from "react";
import { api } from "../api/client";

const GOOGLE_FONTS = [
  "Inter",
  "Poppins",
  "Manrope",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Nunito",
  "Playfair Display",
  "DM Sans",
];

type AppAppearance = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  themeMode: "light" | "dark";
  fontPrimary: string;
  fontHeading: string;
};

const DEFAULT_APPEARANCE: AppAppearance = {
  primaryColor: "#4f46e5",
  secondaryColor: "#6366f1",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  themeMode: "light",
  fontPrimary: "Inter",
  fontHeading: "Inter",
};

export default function AparenciaControl() {
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function applyPreview(data: AppAppearance) {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", data.primaryColor);
    root.style.setProperty("--color-secondary", data.secondaryColor);
    root.style.setProperty("--color-accent", data.accentColor);
    root.style.setProperty("--color-background", data.backgroundColor);

    document.body.style.fontFamily = data.fontPrimary;

    data.themeMode === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
  }

  async function loadAppearance() {
    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await api.get("/api/admin/cms/app-appearance", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.data?.ok && res.data.data) {
        setAppearance(res.data.data);
        applyPreview(res.data.data);
      } else {
        setAppearance(DEFAULT_APPEARANCE);
        applyPreview(DEFAULT_APPEARANCE);
        setStatus("Aparência padrão carregada.");
      }
    } catch (e) {
      console.error(e);
      setAppearance(DEFAULT_APPEARANCE);
      applyPreview(DEFAULT_APPEARANCE);
      setStatus("Erro ao carregar aparência. Usando padrão.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAppearance() {
    if (!appearance) return;

    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      await api.post("/api/admin/cms/app-appearance", appearance, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setStatus("Aparência salva com sucesso.");
    } catch (e) {
      console.error(e);
      setStatus("Erro ao salvar aparência.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppearance();
  }, []);

  if (!appearance) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando aparência...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Aparência do Aplicativo</h2>

      {status && <div className="text-sm text-gray-600">{status}</div>}

      <div className="space-y-1">
        <label className="text-sm font-medium">Fonte principal</label>
        <select
          className="border p-2 w-full"
          value={appearance.fontPrimary}
          onChange={(e) => {
            const v = { ...appearance, fontPrimary: e.target.value };
            setAppearance(v);
            applyPreview(v);
          }}
        >
          {GOOGLE_FONTS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Fonte dos títulos</label>
        <select
          className="border p-2 w-full"
          value={appearance.fontHeading}
          onChange={(e) => {
            const v = { ...appearance, fontHeading: e.target.value };
            setAppearance(v);
            applyPreview(v);
          }}
        >
          {GOOGLE_FONTS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <button
        onClick={saveAppearance}
        disabled={loading}
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar Aparência"}
      </button>
    </div>
  );
}