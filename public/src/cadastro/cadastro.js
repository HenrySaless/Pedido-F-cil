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

// Elementos de endereço
const enderecoInput = document.getElementById("endereco");
const complementoInput = document.getElementById("complemento");

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
  if (!enderecoInput.value.trim()) {
    alert("Por favor, forneça um endereço.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    // Preparar dados do usuário
    const enderecoCompleto = enderecoInput.value.trim();
    const complemento = complementoInput.value.trim();
    const enderecoFinal = complemento
      ? `${enderecoCompleto} - ${complemento}`
      : enderecoCompleto;

    const userData = {
      uid: cred.user.uid,
      nome: nome,
      email: email,
      endereco: enderecoFinal,
      complemento: complemento,
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
      localStorage.setItem("userComplemento", complemento);

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
