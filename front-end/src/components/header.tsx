import React, { useState } from "react";
import adminloginmodal from "./adminloginmodal";
import logo from "@/assets/images/logos/logo.png";

export default function Header() {
  const [showAdminModal, setShowAdminModal] = useState(false);

  return (
    <>
      <header className="w-full bg-gradient-to-r from-indigo-700 to-blue-600 shadow-md py-6 flex justify-between items-center px-6 text-white">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo ZLPix"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-bold tracking-wide">
            ZLPix Premiado
          </h1>
        </div>

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