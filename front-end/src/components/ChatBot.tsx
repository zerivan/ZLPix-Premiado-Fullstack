const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage: Message = {
    role: "user",
    content: input,
  };

  setMessages((prev) => [...prev, userMessage]);
  setLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assistant/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro HTTP:", response.status, errorText);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Erro ${response.status} ao comunicar com o assistente.`,
        },
      ]);

      return;
    }

    const data = await response.json();

    const botMessage: Message = {
      role: "assistant",
      content:
        data.reply || "Não foi possível processar sua solicitação.",
    };

    setMessages((prev) => [...prev, botMessage]);
  } catch (error) {
    console.error("Erro de rede:", error);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Falha de rede ao tentar comunicar com o assistente.",
      },
    ]);
  } finally {
    setLoading(false);
    setInput("");
  }
};