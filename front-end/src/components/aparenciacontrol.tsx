import { useEffect, useState } from "react";
import axios from "axios";

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

  textColor: string;
  textSecondaryColor: string;

  buttonColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;

  borderColor: string;

  themeMode: "light" | "dark";
  fontPrimary: string;
  fontHeading: string;
};

const DEFAULT_APPEARANCE: AppAppearance = {
  primaryColor: "#4f46e5",
  secondaryColor: "#6366f1",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",

  textColor: "#111827",
  textSecondaryColor: "#6b7280",

  buttonColor: "#4f46e5",
  buttonTextColor: "#ffffff",
  buttonHoverColor: "#4338ca",

  borderColor: "#e5e7eb",

  themeMode: "light",
  fontPrimary: "Inter",
  fontHeading: "Inter",
};

export default function AparenciaControl() {
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";

  // 🔐 token sempre atualizado
  function getAuthHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  function applyPreview(data: AppAppearance) {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", data.primaryColor);
    root.style.setProperty("--color-secondary", data.secondaryColor);
    root.style.setProperty("--color-accent", data.accentColor);
    root.style.setProperty("--color-background", data.backgroundColor);

    root.style.setProperty("--color-text", data.textColor);
    root.style.setProperty("--color-text-secondary", data.textSecondaryColor);

    root.style.setProperty("--color-button", data.buttonColor);
    root.style.setProperty("--color-button-text", data.buttonTextColor);
    root.style.setProperty("--color-button-hover", data.buttonHoverColor);

    root.style.setProperty("--color-border", data.borderColor);

    document.body.style.fontFamily = data.fontPrimary;

    data.themeMode === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
  }

  async function loadAppearance() {
    setLoading(true);
    setStatus(null);

    const headers = getAuthHeaders();
    if (!headers) {
      setAppearance(DEFAULT_APPEARANCE);
      applyPreview(DEFAULT_APPEARANCE);
      setStatus("Token de administrador ausente.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/app-appearance`,
        { headers }
      );

      if (res.data?.ok && res.data.data) {
        setAppearance(res.data.data);
        applyPreview(res.data.data);
      } else {
        setAppearance(DEFAULT_APPEARANCE);
        applyPreview(DEFAULT_APPEARANCE);
        setStatus("Aparência padrão carregada.");
      }
    } catch {
      setAppearance(DEFAULT_APPEARANCE);
      applyPreview(DEFAULT_APPEARANCE);
      setStatus("Erro ao carregar aparência. Usando padrão.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAppearance() {
    if (!appearance) return;

    const headers = getAuthHeaders();
    if (!headers) {
      setStatus("Token de administrador ausente.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      await axios.post(
        `${BASE_URL}/api/admin/cms/app-appearance`,
        appearance,
        { headers }
      );
      setStatus("Aparência salva com sucesso.");
    } catch {
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

  const colorFields: [string, keyof AppAppearance][] = [
    ["Cor Primária", "primaryColor"],
    ["Cor Secundária", "secondaryColor"],
    ["Cor de Destaque", "accentColor"],
    ["Cor de Fundo", "backgroundColor"],
    ["Texto Principal", "textColor"],
    ["Texto Secundário", "textSecondaryColor"],
    ["Botão", "buttonColor"],
    ["Texto do Botão", "buttonTextColor"],
    ["Hover do Botão", "buttonHoverColor"],
    ["Bordas / Inputs", "borderColor"],
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Aparência do Aplicativo</h2>

      {status && <div className="text-sm text-gray-600">{status}</div>}

      {colorFields.map(([label, key]) => (
        <div key={key} className="space-y-1">
          <label className="text-sm font-medium">{label}</label>
          <input
            type="color"
            value={appearance[key] as string}
            onChange={(e) => {
              const v = { ...appearance, [key]: e.target.value };
              setAppearance(v);
              applyPreview(v);
            }}
          />
        </div>
      ))}

      <div className="space-y-1">
        <label className="text-sm font-medium">Modo de Tema</label>
        <select
          className="border p-2 w-full"
          value={appearance.themeMode}
          onChange={(e) => {
            const v = {
              ...appearance,
              themeMode: e.target.value as "light" | "dark",
            };
            setAppearance(v);
            applyPreview(v);
          }}
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>

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