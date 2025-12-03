useEffect(() => {
  async function fetchFederal() {
    setLoading(true);

    try {
      const res = await fetch("https://zlpix-premiado-fullstack.onrender.com/api/federal");
      const json = await res.json();

      if (!json.ok) {
        setErro("Não foi possível carregar os resultados.");
        return;
      }

      setResultados([json.data]);
    } catch (err) {
      console.error("Erro:", err);
      setErro("Falha ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  fetchFederal();
}, []);