document.addEventListener("DOMContentLoaded", function () {
  const pedidosList = document.getElementById("pedidosList");
  const totalPedidos = document.getElementById("totalPedidos");
  function renderPedidos() {
    let pedidos = JSON.parse(localStorage.getItem("meusPedidos") || "[]");
    pedidosList.innerHTML = "";
    let total = 0;
    if (pedidos.length === 0) {
      pedidosList.innerHTML =
        '<p style="text-align:center;color:#aaa;">Nenhum pedido adicionado.</p>';
      totalPedidos.textContent = "";
      return;
    }
    pedidos.forEach((p) => {
      const subtotal = p.preco * p.qtd;
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
          </div>
        </div>
      `;
      pedidosList.appendChild(div);
    });
    totalPedidos.innerHTML = `<div style="font-size:1.2rem;font-weight:700;margin:18px 0 0 0;">Total: R$ ${total
      .toFixed(2)
      .replace(".", ",")}</div>`;
  }
  renderPedidos();
  document.getElementById("limparPedidosBtn").onclick = function () {
    const btn = this;
    btn.classList.add("btn-anim");
    setTimeout(() => btn.classList.remove("btn-anim"), 450);
    setTimeout(() => {
      localStorage.removeItem("meusPedidos");
      renderPedidos();
    }, 200);
  };
});
