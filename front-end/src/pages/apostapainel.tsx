// Confirmar bilhete (CORRIGIDO)
async function confirmarBilhete() {
  if (selected.length !== 3 || rolling) return;

  const resolved = resolveUserId();
  if (!resolved) return alert("Erro: usuário não identificado.");

  if (!API) {
    alert("Erro: API não configurada.");
    return;
  }

  try {
    const body = {
      userId: Number(resolved),
      dezenas: [...selected],   // <<< AGORA É ARRAY, CORRETO
      valorTotal: 2.0           // <<< CAMPO CORRETO DO BACKEND
    };

    const res = await axios.post(`${API}/bilhete/criar`, body, {
      headers: { "Content-Type": "application/json" },
    });

    const bilhete = res.data?.bilhete ?? res.data;

    if (!bilhete) {
      alert("Erro ao criar bilhete no servidor.");
      return;
    }

    const idStr = String(bilhete.id);

    const newTicket: LocalTicket = {
      id: idStr,
      nums: [...selected],
      valor: 2.0,
      createdAt: new Date().toISOString(),
      pago: false,
    };

    setTickets((t) => [newTicket, ...t]);
    setSelected([]);
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 900);
  } catch (err: any) {
    console.error("Erro:", err.response?.data || err);
    alert("Erro ao criar bilhete.");
  }
}