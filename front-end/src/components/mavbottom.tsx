// src/components/navbottom.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Ticket,
  Trophy,
  User
} from "lucide-react";

export default function NavBottom() {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-white dark:bg-background-dark
        border-t border-zinc-200 dark:border-zinc-800
        h-16 z-50
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
        flex flex-col items-center justify-center gap-0.5
        text-xs font-semibold transition-colors
        ${isActive
          ? "text-primary"
          : "text-zinc-500 dark:text-zinc-400"
        }
      `
      }
    >
      <div
        className={`
          flex items-center justify-center
          h-8 w-8 rounded-full
          transition-all
          ${
            /* Quando ativo, o botão fica dentro de um círculo dourado */
            window.location.pathname === to
              ? "bg-amber-400 text-black shadow-md"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
          }
        `}
      >
        {icon}
      </div>
      <span>{label}</span>
    </NavLink>
  );
}
