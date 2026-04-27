import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";

const BASE_IDLE = 35000;
const AUTO_CLOSE = 15000;

export default function ZLPRoletaOverlay() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const idleTimer = useRef<any>(null);
  const closeTimer = useRef<any>(null);
  const podeAbrir = useRef(false);
  const tentativas = useRef(0);

  const rotasPermitidas = ["/home", "/meus-bilhetes", "/"];

  useEffect(() => {
    if (!rotasPermitidas.includes(location.pathname)) return;

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
        console.error("Erro alerta roleta:", err);
      }
    }

    verificar();
  }, [location.pathname]);

  useEffect(() => {
    if (!rotasPermitidas.includes(location.pathname)) return;

    function calcularDelay() {
      const OFFSET = 20000; // 20s de diferença
      return Math.min(
        BASE_IDLE * (tentativas.current + 1) + OFFSET,
        60000
      );
    }

    function iniciarTimer() {
      if (idleTimer.current) clearTimeout(idleTimer.current);

      idleTimer.current = setTimeout(() => {
        if (podeAbrir.current && !open) {
          setOpen(true);
          tentativas.current += 1;

          if (closeTimer.current) clearTimeout(closeTimer.current);
          closeTimer.current = setTimeout(() => {
            setOpen(false);
          }, AUTO_CLOSE);
        }
      }, calcularDelay());
    }

    function handleActivity() {
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

      {/* IMAGEM AJUSTADA */}
      <img
        src="/assets/roleta-zlp.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-[center_45%]"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* CONTEÚDO */}
      <div className="relative h-full flex flex-col justify-end text-white p-6">

        <h1 className="text-2xl font-bold mb-2">
          Gire a roleta agora!
        </h1>

        <p className="text-sm text-gray-300 mb-6">
          Ganhe ZLP instantaneamente com a roleta diária.
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
              navigate("/zlp-roleta");
            }}
            className="flex-1 py-3 rounded-full bg-yellow-400 text-black font-bold"
          >
            Girar agora
          </button>
        </div>
      </div>
    </div>
  );
}