import {
  criarProduto,
  buscarProduto,
  atualizarProduto,
} from "../services/firebaseService.js";

// Upload e preview de imagem
const imgInput = document.getElementById("imgInput");
const imgPreview = document.getElementById("imgPreview");
const imgUploadArea = document.getElementById("imgUploadArea");
const imgBtn = document.getElementById("imgBtn");
let imgDataUrl = "";

imgBtn.onclick = () => imgInput.click();
imgUploadArea.onclick = (e) => {
  if (e.target === imgUploadArea || e.target === imgPreview) imgInput.click();
};
imgInput.onchange = function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imgPreview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
      imgDataUrl = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
  }
};
imgUploadArea.ondragover = (e) => {
  e.preventDefault();
  imgUploadArea.classList.add("dragover");
};
imgUploadArea.ondragleave = (e) => {
  imgUploadArea.classList.remove("dragover");
};
imgUploadArea.ondrop = (e) => {
  e.preventDefault();
  imgUploadArea.classList.remove("dragover");
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    imgInput.files = e.dataTransfer.files;
    imgInput.onchange();
  }
};

// Seleção de tempo de entrega
let tempoEntrega = "";
document.querySelectorAll(".tempo-btn").forEach((btn) => {
  btn.onclick = function () {
    document
      .querySelectorAll(".tempo-btn")
      .forEach((b) => b.classList.remove("selected"));
    this.classList.add("selected");
    tempoEntrega = this.dataset.value;
  };
});

// Seleção de tags
let tagsSelecionadas = [];
document.querySelectorAll(".tag-btn").forEach((btn) => {
  btn.onclick = function () {
    this.classList.toggle("selected");
    const val = this.dataset.value;
    if (this.classList.contains("selected")) tagsSelecionadas.push(val);
    else tagsSelecionadas = tagsSelecionadas.filter((t) => t !== val);
  };
});

// Seleção de pricing
let pricingSelecionado = "";
document.querySelectorAll(".pricing-btn").forEach((btn) => {
  btn.onclick = function () {
    document
      .querySelectorAll(".pricing-btn")
      .forEach((b) => b.classList.remove("selected"));
    this.classList.add("selected");
    pricingSelecionado = this.dataset.value;
  };
});

// Verificar se está em modo de edição
const urlParams = new URLSearchParams(window.location.search);
const isEditMode = urlParams.get("edit") === "true";
let produtoEditando = null;

// Carregar produto para edição se necessário
async function carregarProdutoParaEdicao() {
  if (isEditMode) {
    const produtoId = localStorage.getItem("produtoEditandoId");
    if (produtoId) {
      try {
        const result = await buscarProduto(produtoId);
        if (result.success) {
          produtoEditando = result.produto;
          document.getElementById("pageTitle").textContent = "Editar Produto";
          document.querySelector(".cadastrar-btn").textContent =
            "Atualizar Produto";

          // Preencher formulário com dados do produto
          document.getElementById("nome").value = produtoEditando.nome || "";
          document.getElementById("descricao").value =
            produtoEditando.descricao || "";
          document.getElementById("quantidade").value =
            produtoEditando.maxQtd || 1;
          document.getElementById("preco").value = produtoEditando.preco || "";
          document.getElementById("categoria").value =
            produtoEditando.categoria || "";

          // Carregar imagem
          if (produtoEditando.img) {
            imgPreview.innerHTML = `<img src="${produtoEditando.img}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;">`;
            imgDataUrl = produtoEditando.img;
          }

          // Carregar tempo de entrega
          if (produtoEditando.tempoEntrega) {
            tempoEntrega = produtoEditando.tempoEntrega;
            document.querySelectorAll(".tempo-btn").forEach((btn) => {
              if (btn.dataset.value === tempoEntrega) {
                btn.classList.add("selected");
              }
            });
          }

          // Carregar tags
          if (produtoEditando.tags && Array.isArray(produtoEditando.tags)) {
            tagsSelecionadas = [...produtoEditando.tags];
            document.querySelectorAll(".tag-btn").forEach((btn) => {
              if (tagsSelecionadas.includes(btn.dataset.value)) {
                btn.classList.add("selected");
              }
            });
          }

          // Carregar pricing
          if (produtoEditando.pricing) {
            pricingSelecionado = produtoEditando.pricing;
            document.querySelectorAll(".pricing-btn").forEach((btn) => {
              if (btn.dataset.value === pricingSelecionado) {
                btn.classList.add("selected");
              }
            });
          }
        } else {
          alert("Erro ao carregar produto: " + result.error);
          window.location.href = "../Admin/home.html";
        }
      } catch (error) {
        alert("Erro ao carregar produto: " + error.message);
        window.location.href = "../Admin/home.html";
      }
    }
  }
}

// Carregar produto na inicialização
carregarProdutoParaEdicao();

// Validação e cadastro/edição
const form = document.getElementById("produtoForm");
form.onsubmit = async function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const quantidade = parseInt(document.getElementById("quantidade").value, 10);
  const preco = document.getElementById("preco").value;
  const categoria = document.getElementById("categoria").value;

  if (!nome || !imgDataUrl || preco === "" || !tempoEntrega || !categoria) {
    alert("Preencha todos os campos obrigatórios e selecione uma imagem!");
    return;
  }
  if (quantidade < 1) {
    alert("Quantidade deve ser positiva!");
    return;
  }

  const produtoData = {
    nome,
    descricao,
    preco: parseFloat(preco),
    categoria,
    maxQtd: quantidade,
    img: imgDataUrl,
    tempoEntrega,
    tags: tagsSelecionadas,
    pricing: pricingSelecionado,
  };

  try {
    if (isEditMode && produtoEditando) {
      // Modo edição - atualizar produto existente
      const result = await atualizarProduto(produtoEditando.id, produtoData);
      if (result.success) {
        localStorage.removeItem("produtoEditandoId"); // Limpar dados de edição
        alert("Produto atualizado com sucesso!");
      } else {
        alert("Erro ao atualizar produto: " + result.error);
        return;
      }
    } else {
      // Modo criação - adicionar novo produto
      const result = await criarProduto(produtoData);
      if (result.success) {
        alert("Produto criado com sucesso!");
      } else {
        alert("Erro ao criar produto: " + result.error);
        return;
      }
    }

    // Limpar formulário
    form.reset();
    imgPreview.innerHTML = "Arraste ou clique para escolher uma imagem";
    imgDataUrl = "";
    document
      .querySelectorAll(".selected")
      .forEach((el) => el.classList.remove("selected"));
    tagsSelecionadas = [];
    pricingSelecionado = "";
    tempoEntrega = "";

    // Redirecionar de volta para o admin
    setTimeout(() => {
      window.location.href = "../Admin/home.html";
    }, 1000);
  } catch (error) {
    alert("Erro: " + error.message);
  }
};
