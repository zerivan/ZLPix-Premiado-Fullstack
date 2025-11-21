import React,{useState}from"react";
export default function adminloginmodal({onClose,onSuccess}:{onClose:()=>void;onSuccess:()=>void}){
const[user,setUser]=useState("");const[pass,setPass]=useState("");const[err,setErr]=useState("");
function handle(e:React.FormEvent){e.preventDefault();
if(user==="admin"&&pass==="123456"){onSuccess();onClose();}
else setErr("Usuário ou senha inválidos.");}
return(<div className="modal-backdrop"onClick={onClose}>
<div className="modal-card"onClick={e=>e.stopPropagation()}>
<h2>Login Administrativo</h2>
<form onSubmit={handle}style={{marginTop:12}}>
<div className="field"><label>Usuário</label><input value={user}onChange={e=>setUser(e.target.value)}placeholder="admin"/></div>
<div className="field"><label>Senha</label><input type="password"value={pass}onChange={e=>setPass(e.target.value)}placeholder="senha"/></div>
{err&&<div style={{color:"#ffdddd",marginBottom:8}}>{err}</div>}
<div style={{display:"flex",gap:10}}>
<button className="btn primary"type="submit">Entrar</button>
<button className="btn gray"type="button"onClick={onClose}>Cancelar</button>
</div></form></div></div>)}
