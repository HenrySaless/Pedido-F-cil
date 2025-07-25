import { auth } from "../firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { verificarAdmin } from "../services/firebaseService.js";
import {
  listarProdutos,
  atualizarProduto,
  excluirProduto,
  listarPedidos,
  atualizarStatusPedido as atualizarStatusPedidoFirebase,
} from "../services/firebaseService.js";

// ===== PROTEÇÃO DO PAINEL ADMIN =====
async function verificarAcessoAdmin() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Para de escutar mudanças de auth

      if (!user) {
        // Não está logado
        alert("Acesso negado. Faça login como administrador.");
        window.location.href = "../admin-login/admin-login.html";
        return;
      }

      // Verifica se é admin
      const adminCheck = await verificarAdmin(user.uid);

      if (!adminCheck.success || !adminCheck.isAdmin) {
        // Não é admin
        await signOut(auth);
        alert("Acesso negado. Apenas administradores podem acessar esta área.");
        window.location.href = "../admin-login/admin-login.html";
        return;
      }

      // É admin válido
      resolve(user);
    });
  });
}

// Função para logout do admin
async function logoutAdmin() {
  try {
    await signOut(auth);
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    window.location.href = "../admin-login/admin-login.html";
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
}

// Função para renderizar pedidos simulados (mantida para compatibilidade)
function renderPedidos() {
  const ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  ordersList.innerHTML =
    '<p style="text-align:center;color:#666;padding:20px;">Carregando pedidos...</p>';

  // Esta função agora será substituída por renderPedidosUsuarios
  // que carrega dados reais do Firebase
}

function verDetalhes(id) {
  // Esta função será substituída pela versão do Firebase
  alert("Funcionalidade em atualização...");
}

function atualizarStatus(id) {
  // Esta função será substituída pela versão do Firebase
  alert("Funcionalidade em atualização...");
}

// Função para atualizar contadores com dados reais do Firebase
async function atualizarContadores() {
  try {
    const result = await listarPedidos();
    if (result.success) {
      const pedidos = result.pedidos;

      // Contadores baseados em dados reais
      document.getElementById("totalPedidosNum").textContent = pedidos.length;
      document.getElementById("pendentesNum").textContent = pedidos.filter(
        (p) => p.status === "pendente"
      ).length;
      document.getElementById("entreguesNum").textContent = pedidos.filter(
        (p) => p.status === "entregue"
      ).length;

      // Calcular receita real
      const receitaTotal = pedidos.reduce((total, pedido) => {
        return total + (pedido.total || pedido.preco * pedido.qtd || 0);
      }, 0);

      document.getElementById("receitaNum").textContent =
        "R$ " +
        receitaTotal.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        });
    } else {
      // Se não conseguir carregar dados, mostrar zeros
      document.getElementById("totalPedidosNum").textContent = "0";
      document.getElementById("pendentesNum").textContent = "0";
      document.getElementById("entreguesNum").textContent = "0";
      document.getElementById("receitaNum").textContent = "R$ 0,00";
    }
  } catch (error) {
    console.error("Erro ao atualizar contadores:", error);
    // Em caso de erro, mostrar zeros
    document.getElementById("totalPedidosNum").textContent = "0";
    document.getElementById("pendentesNum").textContent = "0";
    document.getElementById("entreguesNum").textContent = "0";
    document.getElementById("receitaNum").textContent = "R$ 0,00";
  }
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

async function renderEstoqueAdmin() {
  const list = document.getElementById("estoqueList");
  if (!list) return;

  list.innerHTML =
    '<p style="text-align:center;color:#666;padding:20px;">Carregando produtos...</p>';

  try {
    const result = await listarProdutos();
    if (!result.success) {
      list.innerHTML =
        '<p style="text-align:center;color:#dc3545;padding:20px;">Erro ao carregar produtos: ' +
        result.error +
        "</p>";
      return;
    }

    const produtos = result.produtos;

    if (produtos.length === 0) {
      list.innerHTML =
        '<p style="text-align:center;color:#666;padding:20px;">Nenhum produto cadastrado.</p>';
      return;
    }

    list.innerHTML = "";
    produtos.forEach((produto) => {
      const div = document.createElement("div");
      div.className = "order-card";
      div.innerHTML = `
        <div class="order-header">
          <span class="order-client">${produto.nome}</span>
          <span class="order-status">Estoque: <input type='number' min='0' value='${
            produto.maxQtd || 0
          }' style='width:60px;border-radius:8px;border:1px solid #eee;padding:2px 6px;' onchange='atualizarEstoque("${
        produto.id
      }", this.value)'></span>
        </div>
        <div class="order-items">${produto.descricao || ""}</div>
        <div class="order-meta">Categoria: ${
          produto.categoria || "Não definida"
        } | Preço: R$ ${(produto.preco || 0).toFixed(2).replace(".", ",")}</div>
        <div class="order-actions">
          <button class="btn-primary" onclick="editarProduto('${
            produto.id
          }')">✏️ Editar</button>
          <button class="btn-danger" onclick="excluirProduto('${
            produto.id
          }')">🗑️ Excluir</button>
        </div>
      `;
      list.appendChild(div);
    });
  } catch (error) {
    list.innerHTML =
      '<p style="text-align:center;color:#dc3545;padding:20px;">Erro ao carregar produtos: ' +
      error.message +
      "</p>";
  }
}

// Funções CRUD para produtos
window.editarProduto = function (id) {
  // Salvar ID do produto para edição
  localStorage.setItem("produtoEditandoId", id);
  window.location.href = "../novo-produto/index.html?edit=true";
};

window.excluirProduto = async function (id) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    try {
      const result = await excluirProduto(id);
      if (result.success) {
        alert("Produto excluído com sucesso!");
        renderEstoqueAdmin();
      } else {
        alert("Erro ao excluir produto: " + result.error);
      }
    } catch (error) {
      alert("Erro ao excluir produto: " + error.message);
    }
  }
};

window.atualizarEstoque = async function (id, novoValor) {
  try {
    const result = await atualizarProduto(id, {
      maxQtd: Math.max(0, parseInt(novoValor, 10)),
    });
    if (!result.success) {
      alert("Erro ao atualizar estoque: " + result.error);
    }
  } catch (error) {
    alert("Erro ao atualizar estoque: " + error.message);
  }
};

// Função para listar pedidos dos usuários
async function renderPedidosUsuarios() {
  const ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  ordersList.innerHTML =
    '<p style="text-align:center;color:#666;padding:20px;">Carregando pedidos...</p>';

  try {
    const result = await listarPedidos();
    if (!result.success) {
      ordersList.innerHTML =
        '<p style="text-align:center;color:#dc3545;padding:20px;">Erro ao carregar pedidos: ' +
        result.error +
        "</p>";
      return;
    }

    const pedidos = result.pedidos;

    if (pedidos.length === 0) {
      ordersList.innerHTML =
        '<p style="text-align:center;color:#666;padding:20px;">Nenhum pedido realizado.</p>';
      return;
    }

    ordersList.innerHTML = "";
    pedidos.forEach((pedido, idx) => {
      const card = document.createElement("div");
      card.className = "order-card";
      card.innerHTML = `
        <div class="order-header">
          <span class="order-client">${pedido.nome}</span>
          <span class="order-status ${pedido.status || "pendente"}">${
        (pedido.status || "pendente").charAt(0).toUpperCase() +
        (pedido.status || "pendente").slice(1)
      }</span>
        </div>
        <div class="order-items">${pedido.qtd}x ${pedido.nome}</div>
        <div class="order-meta">Preço: R$ ${(pedido.preco * pedido.qtd)
          .toFixed(2)
          .replace(".", ",")}</div>
        <div class="order-actions">
          <button class="btn-primary" onclick="verDetalhesPedido('${
            pedido.id
          }')">Ver Detalhes</button>
          <button class="btn-primary" onclick="atualizarStatusPedido('${
            pedido.id
          }')">Atualizar</button>
        </div>
      `;
      ordersList.appendChild(card);
    });
  } catch (error) {
    ordersList.innerHTML =
      '<p style="text-align:center;color:#dc3545;padding:20px;">Erro ao carregar pedidos: ' +
      error.message +
      "</p>";
  }
}

window.verDetalhesPedido = async function (id) {
  try {
    const result = await listarPedidos();
    if (result.success) {
      const pedido = result.pedidos.find((p) => p.id === id);
      if (pedido) {
        alert(
          `Detalhes do pedido:\nProduto: ${pedido.nome}\nQuantidade: ${
            pedido.qtd
          }\nPreço unitário: R$ ${pedido.preco.toFixed(2)}\nPreço total: R$ ${(
            pedido.preco * pedido.qtd
          ).toFixed(2)}\nCategoria: ${
            pedido.categoria || "Não definida"
          }\nStatus: ${pedido.status}`
        );
      }
    }
  } catch (error) {
    alert("Erro ao buscar detalhes do pedido: " + error.message);
  }
};

window.atualizarStatusPedido = async function (id) {
  try {
    const result = await listarPedidos();
    if (result.success) {
      const pedido = result.pedidos.find((p) => p.id === id);
      if (pedido) {
        let novoStatus = "pendente";
        if (!pedido.status || pedido.status === "pendente")
          novoStatus = "preparo";
        else if (pedido.status === "preparo") novoStatus = "entregue";

        const updateResult = await atualizarStatusPedidoFirebase(
          id,
          novoStatus
        );
        if (updateResult.success) {
          renderPedidosUsuarios();
          atualizarContadores();
        } else {
          alert("Erro ao atualizar status: " + updateResult.error);
        }
      }
    }
  } catch (error) {
    alert("Erro ao atualizar status do pedido: " + error.message);
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Verifica se é admin antes de carregar o painel
    const adminUser = await verificarAcessoAdmin();
    console.log("Admin logado:", adminUser.email);

    // Header simplificado - sem botão de logout

    // Carrega os dados do painel
    atualizarContadores();
    renderEstoqueAdmin();
    renderPedidosUsuarios();

    // Botão para cadastro de novo produto
    const btn = document.getElementById("novoProdutoBtn");
    if (btn)
      btn.onclick = function () {
        window.location.href = "../novo-produto/index.html";
      };
  } catch (error) {
    console.error("Erro ao verificar acesso admin:", error);
    window.location.href = "../admin-login/admin-login.html";
  }
});
