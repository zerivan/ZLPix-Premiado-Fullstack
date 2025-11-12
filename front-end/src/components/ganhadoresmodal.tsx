import React,{useEffect,useState}from"react";
import{api}from"../api/client";
type G={nome:string;premio:string;data:string};
export default function GanhadoresModal({onClose}:{onClose:()=>void}){
const[items,setItems]=useState<G[]|null>(null);
useEffect(()=>{
let mounted=true;
api.get("/ganhadores").then(r=>{if(mounted)setItems(r.data)}).catch(()=>{
if(mounted)setItems([{nome:"João Silva",premio:"Pix R$200",data:"2025-11-10"},{nome:"Maria Souza",premio:"Pix R$100",data:"2025-10-01"}]);});
return()=>{mounted=false}},[]);
return(
<div className="modal-backdrop"onClick={onClose}>
<div className="modal-card"onClick={e=>e.stopPropagation()}>
<h2>Ganhadores Recentes</h2>
<div style={{marginTop:12}}>
{!items?<p>Carregando...</p>:
items.length===0?<p className="small-muted">Nenhum ganhador registrado</p>:
items.map((g,idx)=>(
<div key={idx}style={{padding:10,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
<strong>{g.nome}</strong><div className="small-muted">{g.premio} • {g.data}</div>
</div>))}
</div>
<div style={{marginTop:14,display:"flex",justifyContent:"flex-end"}}>
<button className="btn gray"onClick={onClose}>Fechar</button>
</div>
</div>
</div>
)}
