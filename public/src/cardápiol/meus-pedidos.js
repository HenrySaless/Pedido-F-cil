import {
  listarPedidosPorUsuario,
  limparPedidosUsuario,
} from "../services/firebaseService.js";

document.addEventListener("DOMContentLoaded", async function () {
  const pedidosList = document.getElementById("pedidosList");
  const totalPedidos = document.getElementById("totalPedidos");

  // Verificar se usuário está logado
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  if (!userId) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../login/login.html";
    return;
  }

  // Atualizar nome do usuário na interface
  const userNameElement = document.querySelector(".user-name");
  if (userNameElement) {
    userNameElement.textContent = `Olá, ${userName || "Usuário"}!`;
  }

  async function renderPedidos() {
    pedidosList.innerHTML =
      '<p style="text-align:center;color:#666;padding:20px;">Carregando pedidos...</p>';

    try {
      const result = await listarPedidosPorUsuario(userId);

      if (!result.success) {
        pedidosList.innerHTML =
          '<p style="text-align:center;color:#dc3545;padding:20px;">Erro ao carregar pedidos: ' +
          result.error +
          "</p>";
        totalPedidos.textContent = "";
        return;
      }

      const pedidos = result.pedidos;
      let total = 0;

      if (pedidos.length === 0) {
        pedidosList.innerHTML =
          '<p style="text-align:center;color:#aaa;">Nenhum pedido adicionado.</p>';
        totalPedidos.textContent = "";
        return;
      }

      // Agrupar pedidos por produtoId para evitar duplicação
      const pedidosAgrupados = {};
      pedidos.forEach((p) => {
        if (p.status === "pendente") {
          const key = p.produtoId || p.id;
          if (pedidosAgrupados[key]) {
            pedidosAgrupados[key].qtd += p.qtd;
            pedidosAgrupados[key].total += p.total || p.preco * p.qtd;
          } else {
            pedidosAgrupados[key] = {
              ...p,
              total: p.total || p.preco * p.qtd,
            };
          }
        }
      });

      pedidosList.innerHTML = "";
      Object.values(pedidosAgrupados).forEach((p) => {
        const subtotal = p.total || p.preco * p.qtd;
        total += subtotal;
        const div = document.createElement("div");
        div.className = "product-card";
        div.style.maxWidth = "420px";
        div.innerHTML = `
          <div style="display:flex;align-items:center;gap:16px;">
            <img src="${p.img}" alt="${
          p.nome
        }" style="width:60px;height:60px;border-radius:16px;object-fit:cover;">
            <div style="flex:1;">
              <div style="font-weight:600;font-size:1.1rem;">${p.nome}</div>
              <div style="color:#888;font-size:0.95rem;">Qtd: ${
                p.qtd
              } | R$ ${p.preco.toFixed(2).replace(".", ",")}</div>
              <div style="color:#E75A1A;font-weight:600;">Subtotal: R$ ${subtotal
                .toFixed(2)
                .replace(".", ",")}</div>
              <div style="color:#666;font-size:0.9rem;margin-top:4px;">Status: ${
                p.status || "pendente"
              }</div>
            </div>
          </div>
        `;
        pedidosList.appendChild(div);
      });
      totalPedidos.innerHTML = `<div style="font-size:1.2rem;font-weight:700;margin:18px 0 0 0;">Total: R$ ${total
        .toFixed(2)
        .replace(".", ",")}</div>`;
    } catch (error) {
      pedidosList.innerHTML =
        '<p style="text-align:center;color:#dc3545;padding:20px;">Erro ao carregar pedidos: ' +
        error.message +
        "</p>";
      totalPedidos.textContent = "";
    }
  }

  renderPedidos();

  document.getElementById("limparPedidosBtn").onclick = async function () {
    const btn = this;
    btn.classList.add("btn-anim");
    setTimeout(() => btn.classList.remove("btn-anim"), 450);

    setTimeout(async () => {
      try {
        const result = await limparPedidosUsuario(userId);
        if (result.success) {
          alert("Pedidos limpos com sucesso!");
          renderPedidos();
        } else {
          alert("Erro ao limpar pedidos: " + result.error);
        }
      } catch (error) {
        alert("Erro ao limpar pedidos: " + error.message);
      }
    }, 200);
  };
});
