import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function ZLPRoletaOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(true);
  const [resultado, setResultado] = useState<number | null>(null);
  const [saldo, setSaldo] = useState(0);

  const navigate = useNavigate();

  const premios = [10, 20, 30, 50];

  function resolveUserId() {
    try {
      const stored = localStorage.getItem("USER_ZLPIX");
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      return String(parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? "");
    } catch {
      return "";
    }
  }

  const userId = resolveUserId();

  function normalizar(valor: any) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  async function carregarSaldo() {
    try {
      const res = await api.get("/zlp/saldo", {
        headers: { "x-user-id": userId },
      });
      setSaldo(normalizar(res.data?.saldo));
    } catch {}
  }

  useEffect(() => {
    carregarSaldo();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 260;
    canvas.width = size;
    canvas.height = size;

    const center = size / 2;
    const radius = size / 2;

    function drawWheel(rotation: number) {
      ctx.clearRect(0, 0, size, size);

      premios.forEach((valor, i) => {
        const angle = (Math.PI * 2) / premios.length;

        ctx.beginPath();
        ctx.moveTo(center, center);

        ctx.arc(
          center,
          center,
          radius,
          i * angle + rotation,
          (i + 1) * angle + rotation
        );

        ctx.fillStyle = i % 2 === 0 ? "#facc15" : "#1e3a8a";
        ctx.fill();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(i * angle + angle / 2 + rotation);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.fillText(`${valor}`, radius - 10, 5);
        ctx.restore();
      });
    }

    let rotation = 0;
    let velocity = 0.3;
    let spinning = true;

    function animate() {
      if (!spinning) return;

      rotation += velocity;
      velocity *= 0.98;

      drawWheel(rotation);

      if (velocity < 0.002) {
        spinning = false;

        const finalAngle = rotation % (Math.PI * 2);
        const sector = Math.floor(
          (finalAngle / (Math.PI * 2)) * premios.length
        );

        const ganho = premios[premios.length - 1 - sector];
        setResultado(ganho);

        receber();

        setTimeout(() => setOpen(false), 3000);
        return;
      }

      requestAnimationFrame(animate);
    }

    drawWheel(0);
    setTimeout(() => animate(), 500);
  }, []);

  async function receber() {
    try {
      await api.post(
        "/zlp/checkin",
        {},
        { headers: { "x-user-id": userId } }
      );

      await carregarSaldo();
    } catch {}
  }

  if (!open) return null;

  const progresso = Math.min((saldo / 2000) * 100, 100);
  const podeGerar = saldo >= 2000;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1e5b] flex flex-col items-center justify-center text-white px-6">

      <h1 className="mb-4 text-lg font-bold">
        Gire e ganhe moedas
      </h1>

      {/* ponteiro */}
      <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500 mb-2" />

      <canvas ref={canvasRef} />

      {resultado && (
        <div className="mt-4 text-yellow-300 font-bold text-xl">
          +{resultado} ZLP
        </div>
      )}

      {/* PROGRESSO */}
      <div className="w-full max-w-sm mt-6">
        <div className="flex justify-between text-xs mb-1">
          <span>{saldo} ZLP</span>
          <span>2000 ZLP</span>
        </div>

        <div className="h-3 bg-blue-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* BOTÃO */}
      {podeGerar && (
        <button
          onClick={() => navigate("/zlp")}
          className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold"
        >
          Gerar bilhete
        </button>
      )}
    </div>
  );
}