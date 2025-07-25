import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  verificarAdmin,
  listarSuperAdmins,
  criarSuperAdmin,
} from "../services/firebaseService.js";

// Elementos do DOM
const adminLoginForm = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.querySelector(".btn-text");
const btnLoading = document.querySelector(".btn-loading");
const debugStatus = document.getElementById("debugStatus");
const debugBtn = document.getElementById("debugBtn");

// Estado do formulário
let isLoading = false;

// Função para mostrar mensagem
function showMessage(message, type = "error") {
  // Remove mensagens anteriores
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Cria nova mensagem
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Insere antes do formulário
  adminLoginForm.insertBefore(messageDiv, adminLoginForm.firstChild);

  // Remove após 8 segundos para mensagens de sucesso
  const timeout = type === "success" ? 8000 : 5000;
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, timeout);
}

// Função para alternar visibilidade da senha
function togglePasswordVisibility() {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePasswordBtn.textContent = type === "password" ? "👁️" : "🙈";
}

// Função para definir estado de loading
function setLoadingState(loading) {
  isLoading = loading;
  loginBtn.disabled = loading;

  if (loading) {
    loginBtn.classList.add("loading");
    btnText.style.display = "none";
    btnLoading.style.display = "inline";
  } else {
    loginBtn.classList.remove("loading");
    btnText.style.display = "inline";
    btnLoading.style.display = "none";
  }
}

// Função para validar formulário
function validateForm() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email) {
    showMessage("Por favor, insira seu e-mail.");
    emailInput.focus();
    return false;
  }

  if (!password) {
    showMessage("Por favor, insira sua senha.");
    passwordInput.focus();
    return false;
  }

  // Validação básica de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Por favor, insira um e-mail válido.");
    emailInput.focus();
    return false;
  }

  return true;
}

// Função para fazer login do admin
async function loginAdmin(email, password) {
  try {
    setLoadingState(true);

    // Primeiro, faz login com Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    console.log("Login Firebase Auth bem-sucedido:", user.email);

    // Verifica se o usuário é admin
    const adminCheck = await verificarAdmin(user.uid);
    console.log("Resultado da verificação de admin:", adminCheck);

    if (!adminCheck.success) {
      console.log("Erro na verificação de admin:", adminCheck.error);
      throw new Error(
        "Erro ao verificar permissões de administrador: " + adminCheck.error
      );
    }

    if (!adminCheck.isAdmin) {
      console.log("Usuário não é admin, criando perfil de admin...");

      // Se não for admin, vamos criar o perfil de admin
      try {
        const adminData = {
          nome: "Super Administrador",
          email: email,
          uid: user.uid,
          isAdmin: true,
          isSuperAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await criarSuperAdmin(adminData);
        if (result.success) {
          console.log("Perfil de admin criado com sucesso");
        } else {
          console.log("Erro ao criar perfil de admin:", result.error);
        }
      } catch (createError) {
        console.log("Erro ao criar perfil de admin:", createError);
      }
    }

    // Se chegou até aqui, é admin válido
    showMessage("Login realizado com sucesso! Redirecionando...", "success");

    // Salva informação de que é admin no localStorage
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("adminEmail", email);

    // Redireciona para o painel admin após 1.5 segundos
    setTimeout(() => {
      window.location.href = "../Admin/home.html";
    }, 1500);
  } catch (error) {
    console.error("Erro no login:", error);

    let errorMessage = "Erro ao fazer login. Tente novamente.";

    // Mensagens de erro específicas
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "Usuário não encontrado. Verifique seu e-mail.";
        break;
      case "auth/wrong-password":
        errorMessage = "Senha incorreta. Tente novamente.";
        break;
      case "auth/invalid-email":
        errorMessage = "E-mail inválido.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Erro de conexão. Verifique sua internet.";
        break;
      default:
        if (error.message.includes("Acesso negado")) {
          errorMessage = error.message;
        }
    }

    showMessage(errorMessage);
  } finally {
    setLoadingState(false);
  }
}

// Função para verificar status do sistema
async function verificarStatusSistema() {
  try {
    debugStatus.textContent = "Verificando...";

    // Verificar super admins
    const superAdminsResult = await listarSuperAdmins();
    if (superAdminsResult.success) {
      const superAdmins = superAdminsResult.superAdmins;
      if (superAdmins.length > 0) {
        const seuAdmin = superAdmins.find(
          (admin) => admin.email === "wendril126@gmail.com"
        );
        if (seuAdmin) {
          debugStatus.textContent = `✅ Super Admin encontrado (${seuAdmin.nome})`;
          debugStatus.style.color = "#28a745";
        } else {
          debugStatus.textContent = "⚠️ Super Admin não encontrado";
          debugStatus.style.color = "#ffc107";
        }
      } else {
        debugStatus.textContent = "❌ Nenhum super admin no sistema";
        debugStatus.style.color = "#dc3545";
      }
    } else {
      debugStatus.textContent = `❌ Erro: ${superAdminsResult.error}`;
      debugStatus.style.color = "#dc3545";
    }
  } catch (error) {
    debugStatus.textContent = `❌ Erro: ${error.message}`;
    debugStatus.style.color = "#dc3545";
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Verifica se já está logado como admin
  const isAdmin = localStorage.getItem("isAdmin");
  const adminEmail = localStorage.getItem("adminEmail");

  if (isAdmin === "true" && adminEmail) {
    // Se já está logado como admin, redireciona
    window.location.href = "../Admin/home.html";
    return;
  }

  // Verificar status inicial
  verificarStatusSistema();

  // Foca no primeiro campo
  emailInput.focus();
});

// Toggle de senha
togglePasswordBtn.addEventListener("click", togglePasswordVisibility);

// Botão de debug
debugBtn.addEventListener("click", verificarStatusSistema);

// Submit do formulário
adminLoginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (isLoading) return;

  if (!validateForm()) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  await loginAdmin(email, password);
});

// Enter para submeter
passwordInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !isLoading) {
    adminLoginForm.dispatchEvent(new Event("submit"));
  }
});
