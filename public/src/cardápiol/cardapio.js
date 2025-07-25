import { listarProdutos, criarPedido } from "../services/firebaseService.js";

// Produtos
let produtos = [];

// Carregar produtos do Firebase
async function carregarProdutos() {
  try {
    const result = await listarProdutos();
    if (result.success) {
      produtos = result.produtos;
    } else {
      console.error("Erro ao carregar produtos:", result.error);
      // Usar produtos mockados em caso de erro
      produtos = [
        {
          id: "mock1",
          nome: "Hambúrguer Clássico",
          descricao: "Hambúrguer com queijo e salada",
          preco: 15.9,
          categoria: "hamburguer",
          maxQtd: 10,
          img: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=🍔",
          loja: "Burger House",
        },
        {
          id: "mock2",
          nome: "Coca-Cola",
          descricao: "Refrigerante 350ml",
          preco: 5.5,
          categoria: "bebidas",
          maxQtd: 20,
          img: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=🥤",
          loja: "Burger House",
        },
        {
          id: "mock3",
          nome: "Pizza Margherita",
          descricao: "Pizza com molho, mussarela e manjericão",
          preco: 25.9,
          categoria: "pizza",
          maxQtd: 8,
          img: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=🍕",
          loja: "Pizza Express",
        },
      ];
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    // Usar produtos mockados em caso de erro
    produtos = [
      {
        id: "mock1",
        nome: "Hambúrguer Clássico",
        descricao: "Hambúrguer com queijo e salada",
        preco: 15.9,
        categoria: "hamburguer",
        maxQtd: 10,
        img: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=🍔",
        loja: "Burger House",
      },
      {
        id: "mock2",
        nome: "Coca-Cola",
        descricao: "Refrigerante 350ml",
        preco: 5.5,
        categoria: "bebidas",
        maxQtd: 20,
        img: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=🥤",
        loja: "Burger House",
      },
      {
        id: "mock3",
        nome: "Pizza Margherita",
        descricao: "Pizza com molho, mussarela e manjericão",
        preco: 25.9,
        categoria: "pizza",
        maxQtd: 8,
        img: "https://via.placeholder.com/150/FF6B35/FFFFFF?text=🍕",
        loja: "Pizza Express",
      },
    ];
  }
}

// Carregar produtos na inicialização
carregarProdutos();

let categoriaAtual = "todos";

async function renderProdutos() {
  const lista = document.getElementById("productsList");
  const busca = document.getElementById("searchInput").value.toLowerCase();
  lista.innerHTML = "";

  // Recarregar produtos do Firebase para garantir dados atualizados
  await carregarProdutos();

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
        }', '${produto.id}')">Carrinho</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function adicionarProduto(nome) {
  alert(`Produto adicionado! (${nome})`);
}

// Função para adicionar produto ao carrinho (localStorage temporário)
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
  // Adicionar aos pedidos (localStorage temporário)
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

window.adicionarProdutoQtdERedirecionar = async function (nome, id) {
  // Recarregar produtos para garantir dados atualizados
  await carregarProdutos();

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

  const produto = produtos.find((p) => p.id === id);
  if (!produto) return;

  // Criar pedido no Firebase
  try {
    const pedidoData = {
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      img: produto.img,
      qtd: qtd,
      loja: produto.loja || "",
      categoria: produto.categoria,
      userId: "usuario_anonimo", // TODO: Usar ID do usuário logado
      total: produto.preco * qtd,
    };

    const result = await criarPedido(pedidoData);
    if (result.success) {
      alert("Produto adicionado ao carrinho!");
      input.value = 1;
      window.location.href = "meus-pedidos.html";
    } else {
      alert("Erro ao adicionar produto: " + result.error);
    }
  } catch (error) {
    alert("Erro ao adicionar produto: " + error.message);
  }
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

// Drawer (menu lateral)
const menuBtn = document.getElementById("menuBtn");
const drawerMenu = document.getElementById("drawerMenu");
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");

function openDrawer() {
  drawerMenu.classList.add("active");
  drawerOverlay.classList.add("active");
}
function closeDrawer() {
  drawerMenu.classList.remove("active");
  drawerOverlay.classList.remove("active");
}
menuBtn.addEventListener("click", openDrawer);
drawerOverlay.addEventListener("click", closeDrawer);
drawerCloseBtn.addEventListener("click", closeDrawer);

// Redirecionamento dos botões do menu
const drawerHome = document.getElementById("drawerHome");
const drawerPedidos = document.getElementById("drawerPedidos");
const drawerEnderecos = document.getElementById("drawerEnderecos");
const drawerConfig = document.getElementById("drawerConfig");

drawerHome.onclick = function () {
  window.location.href = "cardapio.html";
};
drawerPedidos.onclick = function () {
  window.location.href = "meus-pedidos.html";
};
drawerEnderecos.onclick = function () {
  alert("Funcionalidade de endereços em breve!");
};
drawerConfig.onclick = function () {
  alert("Funcionalidade de configurações em breve!");
};
