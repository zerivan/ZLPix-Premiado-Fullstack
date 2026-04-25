// src/pages/zlp-roleta.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

type Setor = {
  label: string;
  premio: number;
  color: string;
  bonus?: "free-spin";
};

type RoletaData = {
  date: string;
  girosRestantes: number;
};

const META_RESGATE = 2000;
const GIROS_POR_DIA = 3;

function getStorageKey(userId: string) {
  return `ZLP_ROLETA_DATA_${userId}`;
}

const setores: Setor[] = [
  { label: "100 ZLP", premio: 100, color: "#1d4ed8" },
  { label: "20 ZLP", premio: 20, color: "#2563eb" },
  { label: "80 ZLP", premio: 80, color: "#0ea5e9" },
  { label: "40 ZLP", premio: 40, color: "#059669" },
  { label: "60 ZLP", premio: 60, color: "#16a34a" },
  { label: "GIRO GRÁTIS", premio: 0, color: "#f59e0b", bonus: "free-spin" },
];

export default function ZLPRoletaPage() {
  const navigate = useNavigate();

  const [saldo, setSaldo] = useState(0);
  const [girando, setGirando] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const [resultado, setResultado] = useState<Setor | null>(null);
  const [loadingResgatar, setLoadingResgatar] = useState(false);
  const [message, setMessage] = useState("");
  const [girosRestantes, setGirosRestantes] = useState(0);

  function resolveUserId() {
    const directUserId = localStorage.getItem("USER_ID");
    if (directUserId) return String(directUserId).trim();

    const fromStorage =
      localStorage.getItem("USER_ZLPIX") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userData") ||
      "";

    if (!fromStorage) return "";

    try {
      const parsed = JSON.parse(fromStorage);
      return String(
        parsed?.id ??
          parsed?.user?.id ??
          parsed?.userId ??
          parsed?._id ??
          ""
      );
    } catch {
      return String(fromStorage).replaceAll('"', "").trim();
    }
  }

  const userId = resolveUserId();

  function normalizar(valor: unknown) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  function dataHoje() {
    return new Date().toISOString().slice(0, 10);
  }

  function salvarDadosRoleta(novosGiros: number) {
    if (!userId) return;

    const payload: RoletaData = {
      date: dataHoje(),
      girosRestantes: Math.max(0, normalizar(novosGiros)),
    };

    localStorage.setItem(getStorageKey(userId), JSON.stringify(payload));
  }

  function carregarDadosRoleta() {
    if (!userId) return;

    const hoje = dataHoje();
    const bruto = localStorage.getItem(getStorageKey(userId));

    if (!bruto) {
      salvarDadosRoleta(GIROS_POR_DIA);
      setGirosRestantes(GIROS_POR_DIA);
      return;
    }

    try {
      const parsed = JSON.parse(bruto) as Partial<RoletaData>;

      if (parsed?.date !== hoje) {
        salvarDadosRoleta(GIROS_POR_DIA);
        setGirosRestantes(GIROS_POR_DIA);
        return;
      }

      setGirosRestantes(normalizar(parsed?.girosRestantes));
    } catch {
      salvarDadosRoleta(GIROS_POR_DIA);
      setGirosRestantes(GIROS_POR_DIA);
    }
  }

  async function carregarSaldo() {
    if (!userId) return;

    try {
      const res = await api.get("/zlp/saldo", {
        headers: { "x-user-id": userId },
      });

      setSaldo(
        normalizar(
          res.data?.saldo ??
            res.data?.wallet?.saldo ??
            res.data?.balance ??
            0
        )
      );
    } catch (err) {
      console.error("Erro saldo:", err);
    }
  }

  useEffect(() => {
    carregarSaldo();
    carregarDadosRoleta();
  }, []);

  function calcularSetor(grau: number) {
    const tamanho = 360 / setores.length;
    const ajustado = (360 - ((grau + 90) % 360)) % 360;
    const index = Math.floor(ajustado / tamanho);
    return setores[index] ?? setores[1];
  }

  async function girar() {
    if (girando || !userId || girosRestantes <= 0) return;

    setGirosRestantes((prev) => {
      const atualizado = Math.max(prev - 1, 0);
      salvarDadosRoleta(atualizado);
      return atualizado;
    });

    setGirando(true);
    setResultado(null);
    setMessage("");

    const giro = angulo + 1440 + Math.floor(Math.random() * 360);
    setAngulo(giro);

    window.setTimeout(async () => {
      const setor = calcularSetor(giro % 360);

      if (setor.premio > 0) {
        await api.post("/zlp/checkin", {}, { headers: { "x-user-id": userId } });
        await carregarSaldo();
      }

      setResultado(setor);

      if (setor.bonus === "free-spin") {
        setGirosRestantes((prev) => {
          const atualizado = prev + 1;
          salvarDadosRoleta(atualizado);
          return atualizado;
        });

        setMessage("🎉 Giro grátis! Você ganhou +1 giro.");
      }

      setGirando(false);
    }, 3000);
  }

  const gradienteRoleta = useMemo(() => {
    const passo = 360 / setores.length;

    return `conic-gradient(${setores
      .map((setor, i) => {
        const ini = i * passo;
        const fim = ini + passo;
        return `${setor.color} ${ini}deg ${fim}deg`;
      })
      .join(",")})`;
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div
        className="h-[300px] w-[300px] rounded-full"
        style={{ background: gradienteRoleta }}
      />
    </div>
  );
}