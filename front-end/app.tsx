import React, { useState } from "react";
import Navbar from "./components/navbar";
import GanhadoresModal from "./components/ganhadoresmodal";
import HistoricoModal from "./components/historicomodal";
import AdminLoginModal from "./components/adminloginmodal";
import ApostaPanel from "./components/apostapanel";
import "./styles/index.css";

export default function App(){
  const [showG, setShowG] = useState(false);
  const [showH, setShowH] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [paymentSelection, setPaymentSelection] = useState<string[]|null>(null);

  return (
    <div className="app-wrap">
      <Navbar
        onOpenGanhadores={()=>setShowG(true)}
        onOpenHistorico={()=>setShowH(true)}
        onOpenAdmin={()=>setShowAdminLogin(true)}
      />

      <div className="card">
        <div className="ticket-info">
          <h2>Informações do Bilhete</h2>
          <p className="small-muted">Valor do Bilhete: R$ 10.00 • Próxima extração: --</p>
        </div>

        <ApostaPanel onOpenPayment={(sel)=>{ if(sel.length===3) setPaymentSelection(sel); else alert("Selecione 3 dezenas antes de pagar.") }} />

        <div style={{height:80}} /> {/* espaço para footer */}
      </div>

      <footer className="site-footer">
        © 2025 ZLPix Premiado — Desenvolvido por você
      </footer>

      {showG && <GanhadoresModal onClose={()=>setShowG(false)} />}
      {showH && <HistoricoModal onClose={()=>setShowH(false)} />}
      {showAdminLogin && <AdminLoginModal onClose={()=>setShowAdminLogin(false)} onSuccess={()=>setShowAdminDashboard(true)} />}

      {showAdminDashboard && (
        <div className="modal-backdrop" onClick={()=>setShowAdminDashboard(false)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
            <h2>Painel Administrativo</h2>
            <p className="small-muted">Aqui você pode editar valores, ver apostas e gerar relatórios. (Interface de exemplo)</p>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <button className="btn primary" onClick={()=>alert("Abrir Configurações (em breve)")}>Configurações do Bilhete</button>
              <button className="btn gray" onClick={()=>setShowAdminDashboard(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {paymentSelection && (
        <div className="modal-backdrop" onClick={()=>setPaymentSelection(null)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
            <h2>Pagamento Pix</h2>
            <p>Dezenas: <strong>{paymentSelection.join(", ")}</strong></p>
            <p className="small-muted">QR Code e chave de teste (mock)</p>
            <div style={{display:"flex",gap:10, marginTop:12}}>
              <button className="btn primary" onClick={()=>{ alert("Simulando pagamento via Pix — depois implemente integração real."); setPaymentSelection(null); }}>Copiar chave / Pagar</button>
              <button className="btn gray" onClick={()=>setPaymentSelection(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}