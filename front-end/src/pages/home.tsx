import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-700 to-green-600 text-white flex flex-col items-center pt-8 pb-20 relative overflow-hidden">
      {/* Brilho no fundo */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-green-400/20 to-yellow-300/10 blur-2xl"></div>

      {/* Logo */}
      <img src="/logo.png" alt="ZLPix Premiado" className="w-24 mb-4 drop-shadow-md" />

      {/* Título */}
      <h1 className="text-3xl font-extrabold text-yellow-300 tracking-wide drop-shadow-lg">
        ZLPix Premiado
      </h1>
      <p className="text-blue-100 text-sm mt-1 mb-6">Aposte, ganhe e celebre a sorte 🍀</p>

      {/* Saldo */}
      <div className="bg-gradient-to-r from-blue-900 to-green-700 rounded-2xl p-5 w-11/12 text-center mb-5 shadow-lg border border-green-500/30">
        <p className="text-blue-100 text-sm">Seu saldo</p>
        <p className="text-4xl font-bold text-yellow-300 mb-3 drop-shadow-md">R$ 12,50</p>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 py-2 rounded-full transition">
          Adicionar
        </button>
      </div>

      {/* Sorteio */}
      <div className="bg-gradient-to-r from-blue-900 to-green-700 rounded-2xl p-5 w-11/12 mb-6 shadow-lg border border-green-400/20 text-center">
        <h2 className="text-xl text-yellow-300 font-bold mb-1">Próximo Sorteio</h2>
        <p className="text-3xl font-bold">💰 R$ 50.000</p>
        <p className="text-sm text-blue-100 mt-1">Termina em: 02d 18h 45m 33s</p>
      </div>

      {/* Botão principal */}
      <button
        onClick={() => navigate("/aposta")}
        className="bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-blue-900 font-extrabold text-lg px-10 py-4 rounded-full shadow-lg mb-12 transition-all"
      >
        FAZER APOSTA AGORA
      </button>

      {/* Menu fixo */}
      <div className="w-full">
        <BottomNav />
      </div>
    </div>
  );
}