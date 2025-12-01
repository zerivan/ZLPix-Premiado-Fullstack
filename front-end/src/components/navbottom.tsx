// src/components/navbottom.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Ticket,
  Trophy,
  User,
  Shield
} from "lucide-react";

export default function NavBottom() {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-gradient-to-r from-blue-900 to-green-800
        border-t border-green-600/30
        h-16 z-50 shadow-lg backdrop-blur-md
      "
    >
      <div className="max-w-4xl mx-auto h-full flex items-center justify-around">
        {/* HOME */}
        <NavItem to="/" label="Início" icon={<Home size={22} />} />

        {/* APOSTAR */}
        <NavItem to="/aposta" label="Apostar" icon={<Ticket size={22} />} />

        {/* RESULTADOS */}
        <NavItem to="/resultado" label="Resultados" icon={<Trophy size={22} />} />

        {/* MEUS BILHETES */}
        <NavItem to="/meus-bilhetes" label="Bilhetes" icon={<User size={22} />} />

        {/* ADMIN */}
        <NavItem to="/admin" label="Admin" icon={<Shield size={22} />} />
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        relative flex flex-col items-center justify-center gap-1
        text-xs font-semibold transition-all duration-200
        ${
          isActive
            ? "text-yellow-300 scale-105"
            : "text-zinc-300 hover:text-yellow-200"
        }
      `
      }
    >
      <div
        className={`
          flex items-center justify-center
          h-9 w-9 rounded-full transition-all duration-200
          ${
            window.location.pathname === to
              ? "bg-yellow-400 text-blue-900 shadow-md scale-110"
              : "bg-zinc-700 text-yellow-200 hover:bg-yellow-300/20 hover:scale-105"
          }
        `}
      >
        {icon}
      </div>

      {/* Tooltip (nome ao tocar ou passar o dedo) */}
      <span className="absolute bottom-10 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all">
        {label}
      </span>
    </NavLink>
  );
}