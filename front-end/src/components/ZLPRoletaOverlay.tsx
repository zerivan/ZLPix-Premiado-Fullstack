<div className="relative w-72 h-72 rounded-full p-[6px] bg-gradient-to-br from-yellow-400 via-green-400 to-blue-500 shadow-[0_0_40px_rgba(74,225,118,0.3)]">

  {/* BORDA INTERNA */}
  <div className="w-full h-full rounded-full bg-[#020a12] p-3 shadow-inner flex items-center justify-center">

    <div
      className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3000ms] ease-out shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]"
      style={{
        transform: `rotate(${angulo}deg)`,
        background: `conic-gradient(
          #0b1e5b 0deg 72deg,
          #14532d 72deg 144deg,
          #1e3a8a 144deg 216deg,
          #166534 216deg 288deg,
          #0b1e5b 288deg 360deg
        )`,
      }}
    >

      {/* brilho leve */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)]" />

      {/* textos */}
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
        <div className="absolute top-4">100</div>
        <div className="absolute right-6">20</div>
        <div className="absolute bottom-6">80</div>
        <div className="absolute left-6">40</div>
        <div className="absolute top-1/4 left-0">60</div>
      </div>

      {/* centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 bg-white rounded-full shadow-[0_0_10px_white]" />
      </div>

      {/* ponteiro dentro */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
      </div>

    </div>

  </div>
</div>