const express = require("express");
const axios = require("axios");

const router = express.Router();

// =====================================================
// 🔹 CONSULTA RESULTADO DA LOTERIA FEDERAL (API externa)
// =====================================================
router.get("/resultado", async (req, res) => {
  try {
    const resposta = await axios.get(
      "https://loteriascaixa-api.herokuapp.com/api/federal/latest"
    );

    return res.json({
      sucesso: true,
      concurso: resposta.data,
    });
  } catch (erro) {
    console.error("Erro ao buscar dados da Federal:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao consultar resultado da Loteria Federal.",
    });
  }
});

module.exports = router;