import { auth } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  criarUsuario,
  buscarUsuario,
  verificarAdmin,
} from "../services/firebaseService.js";

const senhaInput = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");
toggleSenha.addEventListener("click", function () {
  const type = senhaInput.type === "password" ? "text" : "password";
  senhaInput.type = type;
  toggleSenha.textContent = type === "password" ? "👁️" : "🙈";
});

const form = document.querySelector(".auth-form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = senhaInput.value;

  if (!email || !senha) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Salvar informações do usuário no localStorage
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userId", user.uid);

    // Verificar se o usuário já tem perfil no Firestore
    const userProfile = await buscarUsuario(user.uid);
    if (userProfile.success) {
      localStorage.setItem(
        "userName",
        userProfile.usuario.nome || user.email.split("@")[0]
      );
      localStorage.setItem("userLocation", userProfile.usuario.endereco || "");
      localStorage.setItem(
        "userComplemento",
        userProfile.usuario.complemento || ""
      );
    } else {
      localStorage.setItem("userName", user.email.split("@")[0]);
    }

    // Login com email/senha é sempre para usuários comuns
    localStorage.setItem("isAdmin", "false");
    window.location.href = "../cardápiol/cardapio.html";
  } catch (error) {
    alert("E-mail ou senha inválidos. Tente novamente.");
  }
});

// Google Auth
const googleBtn = document.querySelector(".social-btn.google");
if (googleBtn) {
  googleBtn.addEventListener("click", async function () {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Salvar informações básicas do usuário no localStorage
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userId", user.uid);
      localStorage.setItem(
        "userName",
        user.displayName || user.email.split("@")[0]
      );

      // Verificar se o usuário já tem perfil no Firestore
      const userProfile = await buscarUsuario(user.uid);

      if (userProfile.success) {
        // Usuário já existe no Firestore
        const profile = userProfile.usuario;

        // Salvar dados do perfil
        localStorage.setItem("userLocation", profile.endereco || "");
        localStorage.setItem("userComplemento", profile.complemento || "");

        // Verificar se é admin
        if (profile.isAdmin) {
          // É admin - redirecionar para painel admin
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminEmail", user.email);
          window.location.href = "../Admin/home.html";
        } else {
          // É usuário comum - redirecionar para cardápio
          localStorage.setItem("isAdmin", "false");
          window.location.href = "../cardápiol/cardapio.html";
        }
      } else {
        // Usuário não existe no Firestore - criar perfil básico
        const userData = {
          uid: user.uid,
          nome: user.displayName || user.email.split("@")[0],
          email: user.email,
          endereco: "",
          complemento: "",
          createdAt: new Date(),
          isAdmin: false, // Por padrão, não é admin
        };

        const createResult = await criarUsuario(userData);
        if (createResult.success) {
          localStorage.setItem("userLocation", "");
          localStorage.setItem("userComplemento", "");
          localStorage.setItem("isAdmin", "false");

          // Redirecionar para cardápio (usuário comum)
          window.location.href = "../cardápiol/cardapio.html";
        } else {
          alert("Erro ao criar perfil: " + createResult.error);
        }
      }
    } catch (error) {
      alert(
        "Erro ao entrar com Google: " + (error.message || "Tente novamente.")
      );
    }
  });
}
