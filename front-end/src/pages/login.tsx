try {
  setLoading(true);
  const response = await api.post("/auth/login", { email, password: senha });
  
  const token = response.data?.token;
  const user = response.data?.user; // 👈 dados do usuário retornados da API

  if (!token) {
    setErro("Resposta inválida do servidor.");
    return;
  }

  // 🔹 Salva token e usuário no localStorage
  localStorage.setItem("TOKEN_ZLPIX", token);

  if (user) {
    localStorage.setItem("USER_ZLPIX", JSON.stringify(user));
  }

  // Vai pra home
  navigate("/");
} catch (err: any) {
  const msg =
    err?.response?.data?.message ||
    "Não foi possível entrar. Verifique seus dados.";
  setErro(msg);
} finally {
  setLoading(false);
}