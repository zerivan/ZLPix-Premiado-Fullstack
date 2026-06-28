// src/components/navbottom.tsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Ticket,
  ListOrdered,
  Trophy,
  User,
  Shield,
  Wallet,
} from "lucide-react";

export default function NavBottom() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 GARANTE QUE USER_ID E ADMIN_ID EXISTEM SEMPRE
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("USER_ZLPIX");
      const userId = localStorage.getItem("USER_ID");

      if (userRaw && !userId) {
        const u = JSON.parse(userRaw);
        if (u?.id) {
          localStorage.setItem("USER_ID", String(u.id));
        }
      }

      const adminRaw = localStorage.getItem("ADMIN_ZLPIX");
      const adminId = localStorage.getItem("ADMIN_ID");

      if (adminRaw && !adminId) {
        const a = JSON.parse(adminRaw);
        if (a?.id) {
          localStorage.setItem("ADMIN_ID", String(a.id));
        }
      }
    } catch {}
  }, []);

  const items = [
    { icon: Home, label: "Início", path: "/home" },
    { icon: Ticket, label: "Apostar", path: "/aposta" },
    { icon: ListOrdered, label: "Bilhetes", path: "/meus-bilhetes" },

    // 💰 NOVO — CARTEIRA
    { icon: Wallet, label: "Carteira", path: "/carteira" },

    { icon: Trophy, label: "Resultados", path: "/resultado" },
    { icon: User, label: "Perfil", path: "/perfil" },
    { icon: Shield, label: "Admin", path: "/admin" },
  ];

  return (
    <nav
      className="
      fixed bottom-0 left-0 right-0
      bg-gradient-to-r from-blue-900 via-blue-800 to-green-800
      border-t border-green-500/20
      h-16 z-50 shadow-lg backdrop-blur-md
    "
    >
      <div className="max-w-4xl mx-auto h-full flex items-center justify-around">
        {items.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-all duration-200
                ${
                  active
                    ? "text-yellow-300 scale-105"
                    : "text-zinc-300 hover:text-yellow-200"
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center
                  h-10 w-10 rounded-full
                  ${
                    active
                      ? "bg-yellow-400 text-blue-900 shadow-md scale-110"
                      : "bg-zinc-700/50 text-yellow-200 hover:bg-yellow-300/20 hover:scale-105"
                  }
                `}
              >
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}