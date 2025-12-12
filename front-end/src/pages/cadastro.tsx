import { useState } from "react";
import axios from "axios";

export default function Cadastro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister(e: any) {
    e.preventDefault();
    try {
      const resp = await axios.post("/auth/register", {
        name,
        email,
        password,
      });
      setMsg("Conta criada com sucesso!");
      console.log(resp.data);
    } catch (err: any) {
      setMsg("Erro ao criar conta!");
      console.error(err);
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Criar Conta</h1>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nome completo"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <button className="bg-green-600 text-white p-2 rounded">
          Registrar
        </button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
