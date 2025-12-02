import { useNavigate } from "react-router-dom";
import { Home, Ticket, Trophy, User, Settings } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();

  const items = [
    { icon: Home, label: "Início", path: "/home" },
    { icon: Ticket, label: "Bilhetes", path: "/meusbilhetes" },
    { icon: Trophy, label: "Resultados", path: "/resultado" },
    { icon: User, label: "Perfil", path: "/perfil" },
    { icon: Settings, label: "Admin", path: "/adminlogin" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-blue-900 py-3 flex justify-around shadow-lg border-t border-blue-700 z-50">
      {items.map(({ icon: Icon, label, path }) => (
        <button
          key={label}
          onClick={() => navigate(path)}
          title={label} // ✅ Tooltip automático (mostra o nome)
          className="relative text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <Icon size={26} strokeWidth={2.2} />
        </button>
      ))}
    </nav>
  );
}