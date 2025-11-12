document.addEventListener("DOMContentLoaded", () => {
  const dezenas = document.querySelectorAll(".dezena");
  const botaoGerar = document.querySelector("#gerar");
  const botaoDesfazer = document.querySelector("#desfazer");
  const botaoConfirmar = document.querySelector("#confirmar");
  const bilheteInfo = document.querySelector("#bilhete-info");

  let selecionadas = [];

  // Seleção manual
  dezenas.forEach((d) => {
    d.addEventListener("click", () => {
      const numero = d.textContent;
      if (selecionadas.includes(numero)) {
        d.classList.remove("selecionada");
        selecionadas = selecionadas.filter((n) => n !== numero);
      } else if (selecionadas.length < 3) {
        d.classList.add("selecionada");
        selecionadas.push(numero);
      } else {
        alert("Você só pode escolher 3 dezenas por aposta.");
      }
    });
  });

  // Gerar dezenas automáticas
  botaoGerar.addEventListener("click", () => {
    dezenas.forEach((d) => d.classList.remove("selecionada"));
    selecionadas = [];
    while (selecionadas.length < 3) {
      const rand = String(Math.floor(Math.random() * 100)).padStart(2, "0");
      if (!selecionadas.includes(rand)) selecionadas.push(rand);
    }
    dezenas.forEach((d) => {
      if (selecionadas.includes(d.textContent)) d.classList.add("selecionada");
    });
    bilheteInfo.textContent = `Bilhete (${selecionadas.join(", ")}) — R$ 5,00`;
  });

  // Desfazer seleção
  botaoDesfazer.addEventListener("click", () => {
    dezenas.forEach((d) => d.classList.remove("selecionada"));
    selecionadas = [];
    bilheteInfo.textContent = "Nenhuma dezena selecionada.";
  });

  // Confirmar aposta
  botaoConfirmar.addEventListener("click", () => {
    if (selecionadas.length < 3) {
      alert("Selecione 3 dezenas antes de confirmar.");
    } else {
      alert(`Aposta confirmada: ${selecionadas.join(", ")}\nValor: R$ 5,00`);
    }
  });
});