return (
  <div className="min-h-[100vh] flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 px-6 pt-10 pb-10 font-display">

    <div className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 py-12 animate-[fadeIn_0.4s_ease-out]">

      <h1 className="text-center text-3xl font-extrabold text-yellow-300 mb-8 drop-shadow">
        🔐 Login Administrativo
      </h1>

      {/* resto do conteúdo permanece igual */}
    </div>

    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);