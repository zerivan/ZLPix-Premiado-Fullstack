diff --git a/front-end/src/admindashboard.tsx b/front-end/src/admindashboard.tsx
index 1c53d9604917ada7289fce13c2dfd1eb6f213d65..dcd5d95d82384e72dc6e07d0ac309ffe889aed10 100644
--- a/front-end/src/admindashboard.tsx
+++ b/front-end/src/admindashboard.tsx
@@ -1,129 +1,134 @@
 import React, { useEffect, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import {
   Settings,
   Trophy,
   Users,
   BarChart3,
   LogOut,
   Palette,
   FileText,
   Brain,
   Banknote,
   PlayCircle,
 } from "lucide-react";
 
 // IMPORTS DE CONTROLE
 import AdminConfiguracoesControl from "./components/adminconfiguracoescontrol";
 import AdminAparenciaControl from "./components/adminaparenciacontrol";
 import AdminConteudoControl from "./components/adminconteudocontrol";
 import AdminDiagnosticoIA from "./components/admindiagnosticoia";
 import AdminGanhadores from "./components/adminganhadores";
 import AdminUsuariosControl from "./components/adminusuarioscontrol";
 import AdminRelatoriosControl from "./components/adminrelatorioscontrol";
+import AdminRelatoriosV2 from "./components/AdminRelatoriosV2";
 import AdminSaquesControl from "./components/adminsaquescontrol";
 import AdminSorteioControl from "./components/adminsorteiocontrol";
 import AdminMotorManual from "./components/adminmotormanual"; // ✅ NOVO
 
 type TabId =
   | "config"
   | "appearance"
   | "content"
   | "diagnostico"
   | "winners"
   | "users"
   | "reports"
+  | "reportsV2"
   | "withdrawals"
   | "sorteio"
   | "motorManual"; // ✅ NOVO
 
 export default function AdminDashboard() {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<TabId | null>(null);
 
   useEffect(() => {
     const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
     if (!token) {
       navigate("/admin", { replace: true });
       return;
     }
 
     document.body.classList.add("admin-area");
     return () => {
       document.body.classList.remove("admin-area");
     };
   }, [navigate]);
 
   function handleLogout() {
     localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
     navigate("/admin", { replace: true });
   }
 
   const tabs: { id: TabId; label: string; icon: any }[] = [
     { id: "config", label: "Configurações", icon: Settings },
     { id: "appearance", label: "Aparência", icon: Palette },
     { id: "content", label: "Conteúdo", icon: FileText },
     { id: "diagnostico", label: "Diagnóstico IA", icon: Brain },
     { id: "sorteio", label: "Sorteio", icon: PlayCircle },
     { id: "motorManual", label: "Motor Manual", icon: PlayCircle }, // ✅ NOVO
     { id: "winners", label: "Ganhadores", icon: Trophy },
     { id: "users", label: "Usuários", icon: Users },
     { id: "withdrawals", label: "Saques", icon: Banknote },
     { id: "reports", label: "Relatórios", icon: BarChart3 },
+    { id: "reportsV2", label: "Relatórios V2", icon: BarChart3 },
   ];
 
   function renderTab() {
     if (!activeTab) {
       return (
         <div className="text-sm text-gray-500">
           Selecione uma opção no menu acima.
         </div>
       );
     }
 
     switch (activeTab) {
       case "config":
         return <AdminConfiguracoesControl />;
       case "appearance":
         return <AdminAparenciaControl />;
       case "content":
         return <AdminConteudoControl />;
       case "diagnostico":
         return <AdminDiagnosticoIA />;
       case "sorteio":
         return <AdminSorteioControl />;
       case "motorManual":
         return <AdminMotorManual />; // ✅ NOVO
       case "winners":
         return <AdminGanhadores />;
       case "users":
         return <AdminUsuariosControl />;
       case "withdrawals":
         return <AdminSaquesControl />;
       case "reports":
         return <AdminRelatoriosControl />;
+      case "reportsV2":
+        return <AdminRelatoriosV2 />;
       default:
         return null;
     }
   }
 
   return (
     <div className="min-h-screen bg-gray-100 flex flex-col">
       <header className="bg-indigo-600 text-white px-4 py-4 flex justify-between">
         <h1 className="font-bold">Painel Administrativo</h1>
 
         <button
           onClick={handleLogout}
           className="bg-red-500 px-3 py-2 rounded flex items-center gap-2"
         >
           <LogOut size={16} />
           Sair
         </button>
       </header>
 
       <nav className="bg-white border-b px-3 py-2 flex gap-2 overflow-x-auto">
         {tabs.map((tab) => {
           const Icon = tab.icon;
           return (
             <button
               key={tab.id}
