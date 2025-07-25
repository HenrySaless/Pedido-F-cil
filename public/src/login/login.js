import { auth } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { criarUsuario, buscarUsuario } from "../services/firebaseService.js";

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
  if (!email || !senha || !form.termos.checked) {
    alert("Preencha todos os campos e aceite os termos.");
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
    } else {
      localStorage.setItem("userName", user.email.split("@")[0]);
    }

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

      // Salvar informações do usuário no localStorage
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userId", user.uid);
      localStorage.setItem(
        "userName",
        user.displayName || user.email.split("@")[0]
      );

      // Verificar se o usuário já tem perfil no Firestore
      const userProfile = await buscarUsuario(user.uid);
      if (userProfile.success) {
        localStorage.setItem(
          "userLocation",
          userProfile.usuario.endereco || ""
        );
      }

      window.location.href = "../cardápiol/cardapio.html";
    } catch (error) {
      alert(
        "Erro ao entrar com Google: " + (error.message || "Tente novamente.")
      );
    }
  });
}
