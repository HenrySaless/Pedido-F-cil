import { listarProdutos, criarPedido } from "../services/firebaseService.js";

// Verificar se usuário está logado
async function verificarLogin() {
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userLocation = localStorage.getItem("userLocation");

  if (!userId) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../login/login.html";
    return false;
  }

  // Atualizar informações do usuário na interface
  const userNameElement = document.querySelector(".user-name");
  const userLocationElement = document.querySelector(".user-location");

  if (userNameElement) {
    userNameElement.textContent = `Olá, ${userName || "Usuário"}`;
  }

  // Verificar se tem localização, se não tiver, solicitar
  if (!userLocation || userLocation === "") {
    await solicitarLocalizacao();
  } else {
    if (userLocationElement) {
      userLocationElement.innerHTML = `<i data-lucide="map-pin"></i> ${userLocation}`;
    }
  }

  return true;
}

// Função para solicitar localização do usuário
async function solicitarLocalizacao() {
  const userLocationElement = document.querySelector(".user-location");

  // Mostrar mensagem de carregamento
  if (userLocationElement) {
    userLocationElement.innerHTML = `<i data-lucide="map-pin"></i> Solicitando localização...`;
  }

  // Perguntar ao usuário se quer usar GPS ou digitar manualmente
  const usarGPS = confirm(
    "Deseja usar sua localização atual (GPS) ou digitar o endereço manualmente?\n\n" +
      "• Clique em 'OK' para usar GPS\n" +
      "• Clique em 'Cancelar' para digitar manualmente"
  );

  if (usarGPS) {
    try {
      // Tentar obter localização via GPS
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Tentar obter endereço via reverse geocoding
      const endereco = await obterEnderecoPorCoordenadas(latitude, longitude);

      if (endereco) {
        localStorage.setItem("userLocation", endereco);
        if (userLocationElement) {
          userLocationElement.innerHTML = `<i data-lucide="map-pin"></i> ${endereco}`;
        }
        alert("✅ Localização obtida com sucesso!");
      } else {
        // Se não conseguir o endereço, usar coordenadas
        const coordsText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        localStorage.setItem("userLocation", coordsText);
        if (userLocationElement) {
          userLocationElement.innerHTML = `<i data-lucide="map-pin"></i> ${coordsText}`;
        }
        alert("📍 Localização obtida (coordenadas GPS)");
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      alert(
        "❌ Não foi possível obter sua localização. Por favor, digite manualmente."
      );
      solicitarEnderecoManual();
    }
  } else {
    solicitarEnderecoManual();
  }
}

// Função para solicitar endereço manualmente
function solicitarEnderecoManual() {
  const userLocationElement = document.querySelector(".user-location");

  const enderecoManual = prompt(
    "Por favor, informe seu endereço completo para entrega:\n\n" +
      "Exemplo: Rua das Flores, 123 - Centro, São Paulo - SP"
  );

  if (enderecoManual && enderecoManual.trim()) {
    localStorage.setItem("userLocation", enderecoManual.trim());
    if (userLocationElement) {
      userLocationElement.innerHTML = `<i data-lucide="map-pin"></i> ${enderecoManual.trim()}`;
    }
    alert("✅ Endereço salvo com sucesso!");
  } else {
    // Se não informar, usar endereço padrão
    const enderecoPadrao = "Endereço não informado";
    localStorage.setItem("userLocation", enderecoPadrao);
    if (userLocationElement) {
      userLocationElement.innerHTML = `<i data-lucide="map-pin"></i> ${enderecoPadrao}`;
    }
    alert("⚠️ Endereço não informado. Você pode atualizar depois no menu.");
  }
}

// Função para obter posição atual (Promise wrapper)
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

// Função para obter endereço por coordenadas (simulada)
async function obterEnderecoPorCoordenadas(latitude, longitude) {
  try {
    // Usar a API de Geocoding do Google (se disponível) ou simular
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
    }
  } catch (error) {
    console.log("API de geocoding não disponível, usando coordenadas");
  }

  // Retornar null para usar coordenadas
  return null;
}

// Produtos
let produtos = [];

// Carregar produtos do Firebase
async function carregarProdutos() {
  try {
    const result = await listarProdutos();
    if (result.success && Array.isArray(result.produtos)) {
      console.log("Produtos carregados do Firebase:", result.produtos.length);

      // Remover duplicados na fonte
      const produtosUnicos = [];
      const chavesVistas = new Set();

      result.produtos.forEach((produto) => {
        const nomeKey = normalizarTexto(produto.nome);
        const precoKey = Number(produto.preco).toFixed(2);
        const categoriaKey = normalizarTexto(produto.categoria || "");
        const lojaKey = normalizarTexto(produto.loja || "");
        const chave =
          nomeKey + "-" + precoKey + "-" + categoriaKey + "-" + lojaKey;

        if (!chavesVistas.has(chave)) {
          produtosUnicos.push(produto);
          chavesVistas.add(chave);
        }
      });

      console.log(
        "Produtos únicos após deduplicação na fonte:",
        produtosUnicos.length
      );
      produtos = produtosUnicos;
    } else {
      console.error("Erro ao carregar produtos:", result.error);
      // Usar produtos mockados em caso de erro
      produtos = window.PRODUTOS || [
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
    produtos = window.PRODUTOS || [
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

// Inicialização
document.addEventListener("DOMContentLoaded", async function () {
  // Verificar login primeiro
  if (!(await verificarLogin())) {
    return;
  }

  // Carregar produtos apenas uma vez na inicialização
  await carregarProdutos();

  // Configurar drawer
  const menuBtn = document.getElementById("menuBtn");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerMenu = document.getElementById("drawerMenu");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeDrawer);

  // Configurar navegação do drawer
  const drawerHome = document.getElementById("drawerHome");
  const drawerPedidos = document.getElementById("drawerPedidos");
  const drawerEnderecos = document.getElementById("drawerEnderecos");
  const drawerConfig = document.getElementById("drawerConfig");

  if (drawerHome)
    drawerHome.addEventListener(
      "click",
      () => (window.location.href = "cardapio.html")
    );
  if (drawerPedidos)
    drawerPedidos.addEventListener(
      "click",
      () => (window.location.href = "meus-pedidos.html")
    );
  if (drawerEnderecos)
    drawerEnderecos.addEventListener("click", async () => {
      await solicitarLocalizacao();
      closeDrawer();
    });
  if (drawerConfig)
    drawerConfig.addEventListener("click", () =>
      alert("Funcionalidade em desenvolvimento")
    );

  // Logout
  const drawerLogout = document.getElementById("drawerLogout");
  if (drawerLogout) {
    drawerLogout.addEventListener("click", () => {
      if (confirm("Deseja realmente sair?")) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userLocation");
        window.location.href = "../index.html";
      }
    });
  }

  // Configurar busca
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", renderProdutos);
  }

  // Configurar filtros
  const filterTabs = document.querySelectorAll(".filter-tab");
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      categoriaAtual = tab.dataset.category;
      renderProdutos();
    });
  });

  // Renderizar produtos iniciais
  renderProdutos();

  // Adicionar evento de clique no ícone de localização para atualizar
  const userLocationElement = document.querySelector(".user-location");
  if (userLocationElement) {
    userLocationElement.style.cursor = "pointer";
    userLocationElement.title = "Clique para atualizar localização";
    userLocationElement.addEventListener("click", async () => {
      await solicitarLocalizacao();
    });
  }
});

let categoriaAtual = "todos";

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ") // espaços múltiplos para um só
    .trim()
    .toLowerCase();
}

let renderProdutosCount = 0;

async function renderProdutos() {
  renderProdutosCount++;
  console.log("renderProdutos chamada:", renderProdutosCount, "vez(es)");
  const lista = document.getElementById("productsList");
  const busca = document.getElementById("searchInput").value.toLowerCase();
  lista.innerHTML = "";

  console.log("Total de produtos carregados:", produtos.length);

  let filtrados = produtos.filter(
    (p) =>
      (categoriaAtual === "todos" || p.categoria === categoriaAtual) &&
      (p.nome.toLowerCase().includes(busca) ||
        p.loja.toLowerCase().includes(busca))
  );

  console.log("Produtos filtrados:", filtrados.length);

  // Remover duplicados por nome normalizado + preco + categoria + loja
  const produtosUnicos = [];
  const chavesVistas = new Set();
  const produtosDuplicados = [];

  filtrados.forEach((produto) => {
    const nomeKey = normalizarTexto(produto.nome);
    const precoKey = Number(produto.preco).toFixed(2);
    const categoriaKey = normalizarTexto(produto.categoria || "");
    const lojaKey = normalizarTexto(produto.loja || "");
    const chave = nomeKey + "-" + precoKey + "-" + categoriaKey + "-" + lojaKey;

    console.log(
      "Produto:",
      produto.nome,
      "| Categoria:",
      produto.categoria,
      "| Chave:",
      chave
    );

    if (!chavesVistas.has(chave)) {
      produtosUnicos.push(produto);
      chavesVistas.add(chave);
    } else {
      produtosDuplicados.push(produto);
    }
  });

  console.log("Produtos únicos:", produtosUnicos.length);
  console.log("Produtos duplicados removidos:", produtosDuplicados.length);
  console.log("Chaves únicas dos produtos exibidos:", Array.from(chavesVistas));

  if (produtosUnicos.length === 0) {
    lista.innerHTML =
      '<p style="text-align:center;color:#aaa;">Nenhum produto encontrado.</p>';
    return;
  }

  produtosUnicos.forEach((produto) => {
    const estoqueDisponivel = produto.maxQtd || 0;
    const temEstoque = estoqueDisponivel > 0;

    const card = document.createElement("div");
    card.className = `product-card ${!temEstoque ? "sem-estoque" : ""}`;
    card.innerHTML = `
      <img src="${produto.img}" alt="${produto.nome}" class="product-img" />
      <div class="product-info">
        <div class="product-title">${produto.nome}</div>
        <div class="product-store">${produto.loja || ""}</div>
        <div class="product-price">R$ ${produto.preco
          .toFixed(2)
          .replace(".", ",")}</div>
        <div class="estoque-info ${!temEstoque ? "sem-estoque" : ""}">
          ${temEstoque ? `Estoque: ${estoqueDisponivel}` : "Fora de estoque"}
        </div>
      </div>
      <div class="product-actions">
        <input type="number" min="1" max="${estoqueDisponivel}" value="1" 
               class="qtd-input" id="qtd-${produto.id}" 
               aria-label="Quantidade" ${!temEstoque ? "disabled" : ""}>
        <span class="max-qtd">Máx: ${estoqueDisponivel}</span>
        <button class="add-btn ${!temEstoque ? "disabled" : ""}" 
                title="${
                  temEstoque
                    ? "Adicionar ao carrinho"
                    : "Produto fora de estoque"
                }" 
                onclick="${
                  temEstoque
                    ? `adicionarProdutoQtdERedirecionar('${produto.nome}', '${produto.id}')`
                    : ""
                }"
                ${!temEstoque ? "disabled" : ""}>
          ${temEstoque ? "Carrinho" : "Indisponível"}
        </button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function adicionarProduto(nome) {
  alert(`Produto adicionado! (${nome})`);
}

// Função para adicionar produto ao carrinho
async function adicionarProdutoQtd(nome, id) {
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
  if (!produto) {
    console.error("Produto não encontrado:", id);
    return;
  }

  // Obter informações do usuário logado
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userLocation = localStorage.getItem("userLocation");

  if (!userId) {
    alert("Você precisa estar logado para fazer pedidos.");
    window.location.href = "../login/login.html";
    return;
  }

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
      userId: userId,
      userName: userName,
      userLocation: userLocation,
      total: produto.preco * qtd,
      status: "pendente",
      data: new Date().toISOString(),
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

// Drawer (menu lateral)
function openDrawer() {
  const drawerMenu = document.getElementById("drawerMenu");
  const drawerOverlay = document.getElementById("drawerOverlay");
  drawerMenu.classList.add("active");
  drawerOverlay.classList.add("active");
}

function closeDrawer() {
  const drawerMenu = document.getElementById("drawerMenu");
  const drawerOverlay = document.getElementById("drawerOverlay");
  drawerMenu.classList.remove("active");
  drawerOverlay.classList.remove("active");
}
