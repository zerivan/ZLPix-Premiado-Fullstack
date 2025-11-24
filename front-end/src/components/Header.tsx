import React, { useState } from "react";
import adminloginmodal from "./adminloginmodal";

export default function Header() {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <>
      <header className="w-full bg-gradient-to-r from-indigo-700 to-blue-600 shadow-md py-6 flex justify-between items-center px-6 text-white">
        <h1 className="text-2xl font-bold tracking-wide">🎯 ZLPix Premiado</h1>

        <button
          onClick={() => setShowAdminModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition-all"
        >
          Painel ADM
        </button>
      </header>

      {showAdminModal && (
        <adminloginmodal onClose={() => setShowAdminModal(false)} />
      )}
    </>
  );
}
