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
  themeMode: "light" | "dark";
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
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function applyPreview(data: AppAppearance) {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", data.primaryColor);
    root.style.setProperty("--color-secondary", data.secondaryColor);
    root.style.setProperty("--color-accent", data.accentColor);
    root.style.setProperty("--color-background", data.backgroundColor);

    document.body.style.fontFamily = data.fontPrimary;
    root.style.setProperty("--font-heading", data.fontHeading);

    data.themeMode === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");
  }

  async function loadAppearance() {
    try {
      setLoading(true);
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance",
        { headers: adminHeaders() }
      );
      const json = await res.json();

      if (json.ok && json.data) {
        setAppearance(json.data);
        applyPreview(json.data);
      } else {
        setErro("Nenhuma aparência configurada ainda.");
      }
    } catch {
      setErro("Erro ao carregar aparência.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAppearance() {
    if (!appearance) return;

    setSalvando(true);
    setStatus(null);
    setErro(null);

    try {
      await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/app-appearance",
        {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify(appearance)
        }
      );
      setStatus("Aparência salva com sucesso.");
    } catch {
      setErro("Erro ao salvar aparência.");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    loadAppearance();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando aparência do aplicativo...
      </div>
    );
  }

  if (erro) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  if (!appearance) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Aparência do Aplicativo</h2>

      <p className="text-xs text-gray-500">
        As alterações aqui afetam todo o aplicativo em tempo real.
      </p>

      {status && <div className="text-sm text-gray-600">{status}</div>}

      {/* CORES */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Cor Primária
          <input
            type="color"
            value={appearance.primaryColor}
            onChange={e =>
              setAppearance({ ...appearance, primaryColor: e.target.value })
            }
            className="w-full h-10"
          />
        </label>

        <label className="text-sm">
          Cor Secundária
          <input
            type="color"
            value={appearance.secondaryColor}
            onChange={e =>
              setAppearance({ ...appearance, secondaryColor: e.target.value })
            }
            className="w-full h-10"
          />
        </label>

        <label className="text-sm">
          Cor de Destaque
          <input
            type="color"
            value={appearance.accentColor}
            onChange={e =>
              setAppearance({ ...appearance, accentColor: e.target.value })
            }
            className="w-full h-10"
          />
        </label>

        <label className="text-sm">
          Fundo
          <input
            type="color"
            value={appearance.backgroundColor}
            onChange={e =>
              setAppearance({ ...appearance, backgroundColor: e.target.value })
            }
            className="w-full h-10"
          />
        </label>
      </div>

      {/* FONTES */}
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

        <label className="text-sm font-medium">Fonte de títulos</label>
        <select
          value={appearance.fontHeading}
          onChange={e =>
            setAppearance({ ...appearance, fontHeading: e.target.value })
          }
          className="border p-2 w-full"
        >
          {GOOGLE_FONTS.map(f => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* TEMA */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Tema</label>
        <select
          value={appearance.themeMode}
          onChange={e =>
            setAppearance({
              ...appearance,
              themeMode: e.target.value as "light" | "dark"
            })
          }
          className="border p-2"
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>

      <button
        onClick={saveAppearance}
        disabled={salvando}
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Salvar Aparência"}
      </button>
    </div>
  );
}