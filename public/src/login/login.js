import { auth } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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
    await signInWithEmailAndPassword(auth, email, senha);
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
      await signInWithPopup(auth, provider);
      window.location.href = "../cardápiol/cardapio.html";
    } catch (error) {
      alert(
        "Erro ao entrar com Google: " + (error.message || "Tente novamente.")
      );
    }
  });
}
