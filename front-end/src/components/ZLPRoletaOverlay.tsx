import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ZLPRoletaOverlay() {
  const [open, setOpen] = useState(true);
  const [girando, setGirando] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const [liberado, setLiberado] = useState(false);
  const [message, setMessage] = useState("");

  function resolveUserId() {
    const stored = localStorage.getItem("USER_ZLPIX");
    if (!stored) return "";

    try {
      const parsed = JSON.parse(stored);
      return String(parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? "");
    } catch {
      return "";
    }
  }

  const userId = resolveUserId();

  function girar() {
    if (girando) return;

    setGirando(true);

    const novoAngulo = angulo + 1440 + Math.floor(Math.random() * 360);
    setAngulo(novoAngulo);

    setTimeout(() => {
      setGirando(false);
      setLiberado(true);
    }, 3000);
  }

  async function receber() {
    try {
      const res = await api.post(
        "/zlp/checkin",
        {},
        {
          headers: { "x-user-id": userId },
        }
      );

      if (res.data.ok) {
        setMessage(`+${res.data.ganho} ZLP recebido`);
      } else {
        setMessage("Você já coletou hoje");
      }
    } catch {
      setMessage("Erro ao coletar");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">

      <h1 className="text-xl font-bold mb-6">
        Gire e ganhe suas moedas!
      </h1>

      {/* ROLETA */}
      <div className="relative mb-8">

        <div
          className="w-64 h-64 rounded-full border-4 border-yellow-400 flex items-center justify-center text-2xl font-bold transition-transform duration-[3000ms] ease-out"
          style={{
            transform: `rotate(${angulo}deg)`,
            background:
              "conic-gradient(#facc15 0% 25%, #1e3a8a 25% 50%, #facc15 50% 75%, #1e3a8a 75% 100%)",
          }}
        >
          🎯
        </div>

      </div>

      {!girando && !liberado && (
        <button
          onClick={girar}
          className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold"
        >
          Girar
        </button>
      )}

      {liberado && (
        <button
          onClick={receber}
          className="bg-green-500 px-6 py-3 rounded-full font-bold"
        >
          Receber ZLP
        </button>
      )}

      {message && (
        <p className="mt-4 text-yellow-300">{message}</p>
      )}

      <button
        onClick={() => setOpen(false)}
        className="mt-6 text-gray-400 text-sm"
      >
        Fechar
      </button>
    </div>
  );
}