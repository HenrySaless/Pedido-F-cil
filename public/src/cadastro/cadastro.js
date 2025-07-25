import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await setDoc(doc(db, "usuarios", cred.user.uid), { nome, email });
    alert("Cadastro realizado com sucesso!");
    window.location.href = "../cardápiol/cardapio.html";
    form.reset();
  } catch (err) {
    alert("Erro: " + err.message);
  }
};
