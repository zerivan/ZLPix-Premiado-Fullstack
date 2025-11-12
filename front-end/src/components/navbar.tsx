import React,{useState} from "react";
type Props={onOpenGanhadores:()=>void;onOpenHistorico:()=>void;onOpenAdmin:()=>void;};
export default function Navbar({onOpenGanhadores,onOpenHistorico,onOpenAdmin}:Props){
  const[open,setOpen]=useState(false);
  return(
    <div className="navbar">
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:48,height:48,borderRadius:8,background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>ZL</div>
        <div style={{fontSize:18,fontWeight:800}}>ZLPix Premiado</div>
      </div>
      <div style={{position:"relative"}}>
        <button className="hambutton" onClick={()=>setOpen(v=>!v)}>☰</button>
        {open&&(
          <div className="menu-dropdown" onMouseLeave={()=>setOpen(false)}>
            <a onClick={()=>{setOpen(false);onOpenGanhadores();}}>Ganhadores Recentes</a>
            <a onClick={()=>{setOpen(false);onOpenHistorico();}}>Histórico de Apostas</a>
            <a onClick={()=>{setOpen(false);onOpenAdmin();}}>Admin</a>
          </div>
        )}
      </div>
    </div>
  )
}
