import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function ZLPOverlayAlerta() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function verificar() {
      try {
        const user = localStorage.getItem("USER_ZLPIX");
        if (!user) return;

        const parsed = JSON.parse(user);

        const res = await api.get("/zlp/saldo", {
          headers: {
            "x-user-id": String(
              parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? ""
            )
          }
        });

        const lastCheckin = res.data.lastCheckin;

        const hoje = new Date().toDateString();
        const data = lastCheckin
          ? new Date(lastCheckin).toDateString()
          : null;

        const jaMostrou = localStorage.getItem("ZLP_ALERTA");

        if (data !== hoje && jaMostrou !== hoje) {
          setOpen(true);
          localStorage.setItem("ZLP_ALERTA", hoje);
        }
      } catch (err) {
        console.error("Erro alerta ZLP:", err);
      }
    }

    verificar();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end text-white">

      {/* 🔥 BACKGROUND COM IMAGEM */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/assets/images/bilhetes-zlp.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 🔥 OVERLAY ESCURO PARA LEGIBILIDADE */}
      <div className="absolute inset-0 bg-black/70" />

      {/* 🔥 CONTEÚDO */}
      <div className="relative p-6 bg-gradient-to-t from-black via-black/80 to-transparent">

        <h1 className="text-2xl font-bold mb-2">
          Colete suas moedas diárias!
        </h1>

        <p className="text-sm text-gray-300 mb-6">
          Faça seu check-in e acumule ZLP para trocar por bilhetes.
        </p>

        {/* BOTÕES */}
        <div className="flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-3 rounded-full bg-gray-700 text-white"
          >
            Agora não
          </button>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/zlp");
            }}
            className="flex-1 py-3 rounded-full bg-yellow-400 text-black font-bold"
          >
            Coletar agora
          </button>
        </div>
      </div>
    </div>
  );
}