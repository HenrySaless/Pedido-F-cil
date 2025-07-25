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

// Remover ratingSelecionado e lógica de estrelas

// Validação e cadastro
const form = document.getElementById("produtoForm");
form.onsubmit = function (e) {
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
  const novoProduto = {
    id: Date.now(),
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
  let produtos = window.PRODUTOS || [];
  if (localStorage.getItem("estoque")) {
    produtos = JSON.parse(localStorage.getItem("estoque"));
  }
  produtos.push(novoProduto);
  window.PRODUTOS = produtos;
  localStorage.setItem("estoque", JSON.stringify(produtos));
  alert("Produto criado com sucesso!");
  form.reset();
  imgPreview.innerHTML = "Arraste ou clique para escolher uma imagem";
  imgDataUrl = "";
  document
    .querySelectorAll(".selected")
    .forEach((el) => el.classList.remove("selected"));
  tagsSelecionadas = [];
  pricingSelecionado = "";
};
