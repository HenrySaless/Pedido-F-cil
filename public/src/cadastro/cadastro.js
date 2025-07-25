import { auth } from "../firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { criarUsuario } from "../services/firebaseService.js";

// Mostrar/ocultar senha
const senhaInput = document.getElementById("senha");
const confirmarInput = document.getElementById("confirmar");
const toggleSenha = document.getElementById("toggleSenha");
const toggleConfirmar = document.getElementById("toggleConfirmar");
toggleSenha.addEventListener("click", function () {
  senhaInput.type = senhaInput.type === "password" ? "text" : "password";
  toggleSenha.textContent = senhaInput.type === "password" ? "👁️" : "🙈";
});
toggleConfirmar.addEventListener("click", function () {
  confirmarInput.type =
    confirmarInput.type === "password" ? "text" : "password";
  toggleConfirmar.textContent =
    confirmarInput.type === "password" ? "👁️" : "🙈";
});

// Variáveis para endereço
let userLocation = null;
let enderecoDigitado = "";

// Elementos de endereço
const btnUsarLocalizacao = document.getElementById("btnUsarLocalizacao");
const btnDigitarEndereco = document.getElementById("btnDigitarEndereco");
const enderecoContainer = document.getElementById("enderecoContainer");
const localizacaoInfo = document.getElementById("localizacaoInfo");
const coordsText = document.getElementById("coordsText");
const enderecoInput = document.getElementById("endereco");

// Função para obter localização
async function obterLocalizacao() {
  if (!navigator.geolocation) {
    alert("Geolocalização não é suportada pelo seu navegador.");
    return;
  }

  try {
    btnUsarLocalizacao.textContent = "🔄 Obtendo localização...";
    btnUsarLocalizacao.disabled = true;

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });

    userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    coordsText.textContent = `${userLocation.lat.toFixed(
      6
    )}, ${userLocation.lng.toFixed(6)}`;
    localizacaoInfo.style.display = "flex";
    enderecoContainer.style.display = "none";

    btnUsarLocalizacao.textContent = "✅ Localização obtida";
    btnUsarLocalizacao.classList.add("active");
    btnDigitarEndereco.classList.remove("active");
  } catch (error) {
    alert("Erro ao obter localização: " + error.message);
    btnUsarLocalizacao.textContent = "📍 Usar minha localização";
    btnUsarLocalizacao.disabled = false;
  }
}

// Event listeners para endereço
btnUsarLocalizacao.addEventListener("click", obterLocalizacao);

btnDigitarEndereco.addEventListener("click", function () {
  enderecoContainer.style.display = "block";
  localizacaoInfo.style.display = "none";
  userLocation = null;

  btnDigitarEndereco.classList.add("active");
  btnUsarLocalizacao.classList.remove("active");
  btnUsarLocalizacao.textContent = "📍 Usar minha localização";
  btnUsarLocalizacao.disabled = false;
});

// Formulário de cadastro
const form = document.getElementById("cadastroForm");
form.onsubmit = async function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = senhaInput.value;
  const confirmar = confirmarInput.value;

  if (!nome || !email || !senha || !confirmar || !form.termos.checked) {
    alert("Preencha todos os campos e aceite os termos.");
    return;
  }

  if (senha !== confirmar) {
    alert("As senhas não coincidem!");
    return;
  }

  // Verificar se tem endereço
  if (!userLocation && !enderecoInput.value.trim()) {
    alert("Por favor, forneça um endereço ou use sua localização.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    // Preparar dados do usuário
    const userData = {
      uid: cred.user.uid,
      nome: nome,
      email: email,
      endereco: userLocation
        ? `${userLocation.lat}, ${userLocation.lng}`
        : enderecoInput.value.trim(),
      localizacao: userLocation,
      createdAt: new Date(),
    };

    // Criar usuário no Firestore
    const result = await criarUsuario(userData);

    if (result.success) {
      // Salvar informações no localStorage
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", cred.user.uid);
      localStorage.setItem("userName", nome);
      localStorage.setItem("userLocation", userData.endereco);

      alert("Cadastro realizado com sucesso!");
      window.location.href = "../cardápiol/cardapio.html";
      form.reset();
    } else {
      alert("Erro ao criar perfil: " + result.error);
    }
  } catch (err) {
    alert("Erro: " + err.message);
  }
};
