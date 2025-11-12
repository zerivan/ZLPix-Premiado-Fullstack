const painel = document.getElementById("painel");
const gerarBtn = document.getElementById("gerar");
const desfazerBtn = document.getElementById("desfazer");
const confirmarBtn = document.getElementById("confirmar");
const copiarBtn = document.getElementById("copiar");
const pixKey = document.getElementById("pixKey");

let selecionadas = [];

// Cria dezenas 00-99
for (let i = 0; i < 100; i++) {
  const n = String(i).padStart(2, "0");
  const div = document.createElement("div");
  div.className = "dezena";
  div.textContent = n;
  div.onclick = () => toggle(n, div);
  painel.appendChild(div);
}

function toggle(n, div) {
  if (selecionadas.includes(n)) {
    selecionadas = selecionadas.filter(x => x !== n);
    div.classList.remove("selecionada");
  } else if (selecionadas.length < 3) {
    selecionadas.push(n);
    div.classList.add("selecionada");
  }
}

gerarBtn.onclick = () => {
  limpar();
  while (selecionadas.length < 3) {
    const n = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    if (!selecionadas.includes(n)) {
      selecionadas.push(n);
      document.querySelectorAll(".dezena")[parseInt(n)].classList.add("selecionada");
    }
  }
};

desfazerBtn.onclick = limpar;

confirmarBtn.onclick = () => {
  if (selecionadas.length !== 3) {
    alert("Escolha exatamente 3 dezenas antes de confirmar!");
    return;
  }
  alert(`Bilhete confirmado: ${selecionadas.join(", ")} — Valor: R$5,00`);
};

copiarBtn.onclick = () => {
  navigator.clipboard.writeText(pixKey.textContent);
  copiarBtn.textContent = "Chave Copiada!";
  setTimeout(() => (copiarBtn.textContent = "Copiar Chave Pix"), 2000);
};

function limpar() {
  document.querySelectorAll(".dezena").forEach(d => d.classList.remove("selecionada"));
  selecionadas = [];
}

// contador regressivo (simples)
const contador = document.getElementById("contador");
let tempo = 3 * 24 * 60 * 60; // 3 dias
setInterval(() => {
  const d = Math.floor(tempo / 86400);
  const h = Math.floor((tempo % 86400) / 3600);
  const m = Math.floor((tempo % 3600) / 60);
  contador.textContent = `${d}d ${h}h ${m}m`;
  tempo--;
}, 60000);