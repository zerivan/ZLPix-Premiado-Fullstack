import { useState } from "react";
import axios from "axios";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    try {
      const resp = await axios.post("/auth/admin/login", {
        email,
        password,
      });
      setMsg("Admin logado!");
      console.log(resp.data);
    } catch (err: any) {
      setMsg("Erro ao fazer login admin");
      console.error(err);
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Painel Administrativo</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="E-mail"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-purple-600 text-white p-2 rounded">
          Entrar como Admin
        </button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
