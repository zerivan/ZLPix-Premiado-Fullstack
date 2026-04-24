import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";

const BASE_IDLE = 15000; // 15s inicial
const AUTO_CLOSE = 15000; // 15s aberto (ANTES estava muito curto)

export default function ZLPOverlayAlerta() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const idleTimer = useRef<any>(null);
  const closeTimer = useRef<any>(null);
  const podeAbrir = useRef(false);
  const tentativas = useRef(0);

  // 🔒 ROTAS PERMITIDAS
  const rotasPermitidas = ["/home", "/meus-bilhetes", "/"];

  useEffect(() => {
    if (!rotasPermitidas.includes(location.pathname)) {
      return;
    }

    async function verificar() {
      try {
        const user = localStorage.getItem("USER_ZLPIX");
        if (!user) return;

        const parsed = JSON.parse(user);

        const res = await api.get("/zlp/saldo", {
          headers: {
            "x-user-id": String(
              parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? ""
            ),
          },
        });

        const lastCheckin = res.data.lastCheckin;

        const hoje = new Date().toDateString();
        const data = lastCheckin
          ? new Date(lastCheckin).toDateString()
          : null;

        if (data !== hoje) {
          podeAbrir.current = true;
        }
      } catch (err) {
        console.error("Erro alerta ZLP:", err);
      }
    }

    verificar();
  }, [location.pathname]);

  useEffect(() => {
    if (!rotasPermitidas.includes(location.pathname)) return;

    function calcularDelay() {
      return Math.min(BASE_IDLE * (tentativas.current + 1), 60000);
    }

    function iniciarTimer() {
      if (idleTimer.current) clearTimeout(idleTimer.current);

      idleTimer.current = setTimeout(() => {
        if (podeAbrir.current && !open) {
          setOpen(true);
          tentativas.current += 1;

          // 🔥 NÃO deixar interação fechar o overlay
          if (closeTimer.current) clearTimeout(closeTimer.current);
          closeTimer.current = setTimeout(() => {
            setOpen(false);
          }, AUTO_CLOSE);
        }
      }, calcularDelay());
    }

    function handleActivity() {
      // 🔥 NÃO reinicia se overlay estiver aberto
      if (open) return;
      iniciarTimer();
    }

    const eventos = ["mousemove", "mousedown", "keydown", "touchstart"];

    eventos.forEach((evt) => window.addEventListener(evt, handleActivity));

    iniciarTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);

      eventos.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
    };
  }, [open, location.pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">

      {/* BACKGROUND REAL */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/assets/images/bilhetes-zlp.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* OVERLAY ESCURO */}
      <div className="absolute inset-0 bg-black/80" />

      {/* CONTEÚDO */}
      <div className="relative h-full flex flex-col justify-end text-white p-6 bg-gradient-to-t from-black via-black/80 to-transparent">

        <h1 className="text-2xl font-bold mb-2">
          Colete suas moedas diárias!
        </h1>

        <p className="text-sm text-gray-300 mb-6">
          Faça seu check-in e acumule ZLP para trocar por bilhetes.
        </p>

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