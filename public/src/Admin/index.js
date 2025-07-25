// Dados simulados de pedidos
const pedidos = [
  {
    id: 1,
    cliente: "Maria Silva",
    itens: "2x Hambúrguer, 1x Suco",
    status: "pendente",
    meta: "Hoje, 12:30",
  },
  {
    id: 2,
    cliente: "João Souza",
    itens: "1x Pizza, 2x Refrigerante",
    status: "preparo",
    meta: "Hoje, 12:45",
  },
  {
    id: 3,
    cliente: "Ana Lima",
    itens: "1x Salada, 1x Água",
    status: "entregue",
    meta: "Hoje, 11:50",
  },
  {
    id: 4,
    cliente: "Carlos Mendes",
    itens: "3x Pastel",
    status: "pendente",
    meta: "Hoje, 13:00",
  },
];

function renderPedidos() {
  const ordersList = document.getElementById("ordersList");
  ordersList.innerHTML = "";
  pedidos.forEach((pedido, idx) => {
    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-header">
        <span class="order-client">${pedido.cliente}</span>
        <span class="order-status ${pedido.status}">${
      pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)
    }</span>
      </div>
      <div class="order-items">${pedido.itens}</div>
      <div class="order-meta">${pedido.meta}</div>
      <div class="order-actions">
        <button class="btn-primary" onclick="verDetalhes(${
          pedido.id
        })">Ver Detalhes</button>
        <button class="btn-primary" onclick="atualizarStatus(${
          pedido.id
        })">Atualizar</button>
      </div>
    `;
    ordersList.appendChild(card);
  });
}

function verDetalhes(id) {
  const pedido = pedidos.find((p) => p.id === id);
  alert(
    `Detalhes do pedido de ${pedido.cliente}:\nItens: ${pedido.itens}\nStatus: ${pedido.status}\n${pedido.meta}`
  );
}

function atualizarStatus(id) {
  const pedido = pedidos.find((p) => p.id === id);
  if (pedido.status === "pendente") pedido.status = "preparo";
  else if (pedido.status === "preparo") pedido.status = "entregue";
  else pedido.status = "pendente";
  renderPedidos();
  atualizarContadores();
}

function atualizarContadores() {
  document.getElementById("totalPedidosNum").textContent = pedidos.length;
  document.getElementById("pendentesNum").textContent = pedidos.filter(
    (p) => p.status === "pendente"
  ).length;
  document.getElementById("entreguesNum").textContent = pedidos.filter(
    (p) => p.status === "entregue"
  ).length;
  // Receita simulada
  document.getElementById("receitaNum").textContent =
    "R$ " +
    (pedidos.length * 19.5).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
}

document.getElementById("novoPedidoBtn").onclick = function () {
  alert("Funcionalidade de novo pedido em desenvolvimento!");
};
document.getElementById("editarCardapioBtn").onclick = function () {
  alert("Funcionalidade de edição do cardápio em desenvolvimento!");
};
document.getElementById("configuracoesBtn").onclick = function () {
  alert("Funcionalidade de configurações em desenvolvimento!");
};

function renderEstoqueAdmin() {
  const list = document.getElementById("estoqueList");
  if (!list) return;
  list.innerHTML = "";
  window.PRODUTOS.forEach((produto) => {
    const div = document.createElement("div");
    div.className = "order-card";
    div.innerHTML = `
      <div class="order-header">
        <span class="order-client">${produto.nome}</span>
        <span class="order-status">Estoque: <input type='number' min='0' value='${
          produto.maxQtd
        }' style='width:60px;border-radius:8px;border:1px solid #eee;padding:2px 6px;' onchange='atualizarEstoque(${
      produto.id
    }, this.value)'></span>
      </div>
      <div class="order-items">${produto.descricao || ""}</div>
      <div class="order-meta">Categoria: ${
        produto.categoria
      } | Preço: R$ ${produto.preco.toFixed(2).replace(".", ",")}</div>
    `;
    list.appendChild(div);
  });
}
window.atualizarEstoque = function (id, novoValor) {
  const prod = window.PRODUTOS.find((p) => p.id === id);
  if (prod) prod.maxQtd = Math.max(0, parseInt(novoValor, 10));
  localStorage.setItem("estoque", JSON.stringify(window.PRODUTOS));
  renderEstoqueAdmin();
};
if (localStorage.getItem("estoque")) {
  window.PRODUTOS = JSON.parse(localStorage.getItem("estoque"));
}

document.addEventListener("DOMContentLoaded", function () {
  renderPedidos();
  atualizarContadores();
  renderEstoqueAdmin();
  // Botão para cadastro de novo produto
  const btn = document.getElementById("novoProdutoBtn");
  if (btn)
    btn.onclick = function () {
      window.location.href = "../novo-produto/index.html";
    };
});
