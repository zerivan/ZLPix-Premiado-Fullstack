import React from"react";
type Bet={id:string;dezenas:string[];valor:number;data:string};
export default function HistoricoModal({onClose,items=[]as Bet[]}:{onClose:()=>void;items?:Bet[]}){return(
<div className="modal-backdrop"onClick={onClose}>
<div className="modal-card"onClick={e=>e.stopPropagation()}>
<h2>Histórico de Apostas</h2>
<div style={{marginTop:12}}>
{items.length===0?<p className="small-muted">Sem apostas ainda.</p>:
items.map(b=>(
<div key={b.id}style={{padding:10,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
<div style={{display:"flex",justifyContent:"space-between"}}>
<div><strong>{b.dezenas.join(", ")}</strong></div><div className="small-muted">{b.data}</div>
</div><div className="small-muted">Valor: R$ {b.valor.toFixed(2)}</div>
</div>))}
</div>
<div style={{marginTop:14,display:"flex",justifyContent:"flex-end"}}>
<button className="btn gray"onClick={onClose}>Fechar</button>
</div>
</div>
</div>)}
