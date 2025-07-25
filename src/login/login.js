import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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
    alert("Login realizado!");
    // Redirecione para a home do usuário ou dashboard
  } catch (err) {
    alert("Erro: " + err.message);
  }
});
