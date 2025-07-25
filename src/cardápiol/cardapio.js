// Produtos mockados
let produtos = [];
if (localStorage.getItem("estoque")) {
  produtos = JSON.parse(localStorage.getItem("estoque"));
  window.PRODUTOS = produtos;
} else if (window.PRODUTOS) {
  produtos = window.PRODUTOS;
}

let categoriaAtual = "todos";

function renderProdutos() {
  const lista = document.getElementById("productsList");
  const busca = document.getElementById("searchInput").value.toLowerCase();
  lista.innerHTML = "";
  let filtrados = produtos.filter(
    (p) =>
      (categoriaAtual === "todos" || p.categoria === categoriaAtual) &&
      (p.nome.toLowerCase().includes(busca) ||
        p.loja.toLowerCase().includes(busca))
  );
  if (filtrados.length === 0) {
    lista.innerHTML =
      '<p style="text-align:center;color:#aaa;">Nenhum produto encontrado.</p>';
    return;
  }
  filtrados.forEach((produto) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${produto.img}" alt="${produto.nome}" class="product-img" />
      <div class="product-info">
        <div class="product-title">${produto.nome}</div>
        <div class="product-store">${produto.loja || ""}</div>
        <div class="product-price">R$ ${produto.preco
          .toFixed(2)
          .replace(".", ",")}</div>
      </div>
      <div class="product-actions">
        <input type="number" min="1" max="${
          produto.maxQtd
        }" value="1" class="qtd-input" id="qtd-${
      produto.id
    }" aria-label="Quantidade">
        <span class="max-qtd">Máx: ${produto.maxQtd}</span>
        <button class="add-btn" title="Adicionar ao carrinho" onclick="adicionarProdutoQtdERedirecionar('${
          produto.nome
        }', ${produto.id})">Carrinho</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function adicionarProduto(nome) {
  alert(`Produto adicionado! (${nome})`);
}

function adicionarProdutoQtd(nome, id) {
  const input = document.getElementById("qtd-" + id);
  const qtd = parseInt(input.value, 10);
  const max = parseInt(input.max, 10);
  if (isNaN(qtd) || qtd < 1) {
    input.value = 1;
    return;
  }
  if (qtd > max) {
    input.value = max;
    return;
  }
  // Adicionar aos pedidos
  let meusPedidos = JSON.parse(localStorage.getItem("meusPedidos") || "[]");
  const produto = produtos.find((p) => p.id === id);
  if (!produto) return;
  // Se já existe, soma a quantidade
  const idx = meusPedidos.findIndex((p) => p.id === id);
  if (idx >= 0) {
    meusPedidos[idx].qtd += qtd;
  } else {
    meusPedidos.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      img: produto.img,
      qtd,
      loja: produto.loja || "",
      categoria: produto.categoria,
    });
  }
  localStorage.setItem("meusPedidos", JSON.stringify(meusPedidos));
  input.value = 1;
}

window.adicionarProdutoQtdERedirecionar = function (nome, id) {
  const input = document.getElementById("qtd-" + id);
  const qtd = parseInt(input.value, 10);
  const max = parseInt(input.max, 10);
  if (isNaN(qtd) || qtd < 1) {
    input.value = 1;
    return;
  }
  if (qtd > max) {
    input.value = max;
    return;
  }
  let meusPedidos = JSON.parse(localStorage.getItem("meusPedidos") || "[]");
  const produto = produtos.find((p) => p.id === id);
  if (!produto) return;
  const idx = meusPedidos.findIndex((p) => p.id === id);
  if (idx >= 0) {
    meusPedidos[idx].qtd += qtd;
  } else {
    meusPedidos.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      img: produto.img,
      qtd,
      loja: produto.loja || "",
      categoria: produto.categoria,
    });
  }
  localStorage.setItem("meusPedidos", JSON.stringify(meusPedidos));
  input.value = 1;
  window.location.href = "meus-pedidos.html";
};

// Filtros de categoria
document.querySelectorAll(".filter-tab").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".filter-tab")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
    categoriaAtual = this.getAttribute("data-category");
    renderProdutos();
  });
});

document
  .getElementById("searchInput")
  .addEventListener("input", renderProdutos);

// Inicialização
document.addEventListener("DOMContentLoaded", renderProdutos);
