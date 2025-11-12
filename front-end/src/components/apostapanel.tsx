import React,{useState}from"react";
import{api}from"../api/client";
type Bet={id:string;dezenas:string[];valor:number;data:string};
export default function ApostaPanel({onOpenPayment}:{onOpenPayment:(dezenas:string[])=>void}){
const[selected,setSelected]=useState<string[]>([]);const[history,setHistory]=useState<Bet[]>([]);
const numbers=Array.from({length:100}).map((_,i)=>String(i).padStart(2,"0"));
function toggle(n:string){setSelected(prev=>{
if(prev.includes(n))return prev.filter(x=>x!==n);
if(prev.length>=3)return prev;
return[...prev,n].sort();});}
function autoGenerate(){const picks=new Set<string>();
while(picks.size<3){const r=numbers[Math.floor(Math.random()*numbers.length)];picks.add(r);}
setSelected(Array.from(picks).sort());}
function undo(){setSelected([])}
function confirmTicket(){
if(selected.length!==3)return alert("Selecione 3 dezenas antes de confirmar.");
const b:Bet={id:Date.now().toString(),dezenas:selected.slice(),valor:10,data:new Date().toLocaleString()};
setHistory(h=>[b,...h]);api.post("/apostas",b).catch(()=>{});alert("Bilhete gerado! Clique em Pagar agora para finalizar (Pix).");}
return(<div className="card"style={{marginTop:12}}>
<div className="ticket-info"><h2>Sistema de Apostas</h2><p className="small-muted">Escolha 3 dezenas por bilhete — Pagamento via Pix</p></div>
<div style={{display:"grid",gap:10}}>
<div className="summary center">Dezenas selecionadas: <strong>{selected.join(", ")||"—"}</strong></div>
<div className="numbers-grid"aria-label="grade-dezenas">
{numbers.map(n=>(<button key={n}className={"number-btn "+(selected.includes(n)?"selected":"")}onClick={()=>toggle(n)}>{n}</button>))}
</div>
<div className="actions-row"><button className="btn gray"onClick={autoGenerate}>Gerar Bilhetes</button>
<button className="btn warn"onClick={undo}>Desfazer</button><button className="btn primary"onClick={confirmTicket}>Confirmar</button></div>
<div style={{marginTop:8,display:"flex",gap:10}}>
<button className="btn primary"onClick={()=>onOpenPayment(selected)}>Pagar agora</button><div style={{flex:1}}/></div>
<div style={{marginTop:16}}>
<h4>Histórico (local)</h4>{history.length===0?<p className="small-muted">Nenhum bilhete ainda.</p>:
history.map(h=>(<div key={h.id}style={{padding:10,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
<div><strong>{h.dezenas.join(", ")}</strong></div>
<div className="small-muted">R$ {h.valor.toFixed(2)} • {h.data}</div></div>))}</div></div></div>)}
