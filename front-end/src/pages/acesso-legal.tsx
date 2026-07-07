import { useNavigate } from "react-router-dom";

export default function AcessoLegal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 flex items-center justify-center p-6 text-white">

      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-lg border border-green-400/30">

        <div className="text-center mb-6">
          <img
            src="/icon-192.png"
            alt="ZLPix Premiado"
            className="w-28 h-28 mx-auto mb-4 rounded-xl"
          />

          <h1 className="text-3xl font-bold text-yellow-300">
            Bem-vindo ao ZLPix Premiado
          </h1>
        </div>

        <div className="space-y-5 text-center text-blue-100 leading-7">

          <p>
            Esta plataforma disponibiliza <strong>Participações Digitais</strong>
            {" "}conforme as regras estabelecidas no Regulamento.
          </p>

          <p>
            A apuração utiliza como referência os resultados oficiais da
            Loteria Federal.
          </p>

          <p className="text-yellow-300 font-semibold">
            Proibida a participação de menores de 18 anos.
          </p>

        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-8 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-full shadow-lg transition-all"
        >
          CONTINUAR
        </button>

      </div>

    </div>
  );
}