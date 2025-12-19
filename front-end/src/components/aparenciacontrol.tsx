import { useEffect, useState } from "react";

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
  "DM Sans"
];

type AppAppearance = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  themeMode: string;
  fontPrimary: string;
  fontHeading: string;
};

function adminHeaders() {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export default function AparenciaControl() {
  const [appearance, setAppearance] = useState<AppAppearance | null>(null);
  const [loading, setLoading] = useState(false);

  function applyPreview(data: AppAppearance) {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", data.primaryColor);
    root.style.setProperty("--color-secondary", data.secondaryColor);
    root.style.setProperty("--color-accent", data.accentColor);
    root.style.setProperty("--color-background", data.backgroundColor);

    if (data.fontPrimary) document.body.style.fontFamily = data.fontPrimary;
    if (data.fontHeading)
      root.style.setProperty("--font-heading", data.fontHeading);

    data.themeMode === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
  }

  async function loadAppearance() {
    try {
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance",
        { headers: adminHeaders() }
      );
      const json = await res.json();
      if (json.ok && json.data) {
        setAppearance(json.data);
        applyPreview(json.data);
      }
    } catch (err) {
      console.error("Erro ao carregar aparência", err);
    }
  }

  async function saveAppearance() {
    if (!appearance) return;
    setLoading(true);
    try {
      await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance",
        {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify(appearance)
        }
      );
      alert("Aparência salva com sucesso");
    } catch (err) {
      alert("Erro ao salvar aparência");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppearance();
  }, []);

  if (!appearance) {
    return <div className="text-sm text-gray-500">Carregando aparência...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Aparência do Aplicativo</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fonte principal</label>
        <select
          value={appearance.fontPrimary}
          onChange={e =>
            setAppearance({ ...appearance, fontPrimary: e.target.value })
          }
          className="border p-2 w-full"
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <button
        onClick={saveAppearance}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Salvando..." : "Salvar Aparência"}
      </button>
    </div>
  );
}