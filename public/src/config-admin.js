import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { buscarUsuario, atualizarUsuario } from "./services/firebaseService.js";

const statusMessage = document.getElementById("statusMessage");
const configBtn = document.getElementById("configBtn");

function showStatus(message, isSuccess = true) {
  statusMessage.innerHTML = `
    <div class="status-message ${
      isSuccess ? "status-success" : "status-error"
    }">
      ${message}
    </div>
  `;
}

window.configurarComoAdmin = async function () {
  try {
    configBtn.disabled = true;
    configBtn.textContent = "🔄 Fazendo login...";

    // Fazer login com Google
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    showStatus(`✅ Login realizado com: ${user.email}`, true);
    configBtn.textContent = "🔄 Configurando...";

    // Verificar se o usuário já existe no Firestore
    const userProfile = await buscarUsuario(user.uid);

    if (userProfile.success) {
      // Usuário existe - atualizar para admin
      const updateData = {
        ...userProfile.usuario,
        isAdmin: true,
        updatedAt: new Date(),
      };

      const updateResult = await atualizarUsuario(user.uid, updateData);

      if (updateResult.success) {
        showStatus(
          `✅ ${user.email} configurado como ADMIN com sucesso!`,
          true
        );
        configBtn.textContent = "✅ Admin Configurado";
        configBtn.disabled = true;
      } else {
        showStatus(`❌ Erro ao configurar admin: ${updateResult.error}`, false);
        configBtn.disabled = false;
        configBtn.textContent = "🔧 Configurar como Admin";
      }
    } else {
      // Usuário não existe - criar como admin
      const userData = {
        uid: user.uid,
        nome: user.displayName || user.email.split("@")[0],
        email: user.email,
        endereco: "",
        complemento: "",
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Usar a função criarUsuario do firebaseService
      const { criarUsuario } = await import("./services/firebaseService.js");
      const createResult = await criarUsuario(userData);

      if (createResult.success) {
        showStatus(`✅ ${user.email} criado como ADMIN com sucesso!`, true);
        configBtn.textContent = "✅ Admin Configurado";
        configBtn.disabled = true;
      } else {
        showStatus(`❌ Erro ao criar admin: ${createResult.error}`, false);
        configBtn.disabled = false;
        configBtn.textContent = "🔧 Configurar como Admin";
      }
    }
  } catch (error) {
    showStatus(`❌ Erro: ${error.message}`, false);
    configBtn.disabled = false;
    configBtn.textContent = "🔧 Configurar como Admin";
  }
};

window.testarLogin = async function () {
  try {
    showStatus("🔄 Testando login admin...", true);

    // Verificar se há usuário logado
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showStatus("❌ Nenhum usuário logado. Faça login primeiro.", false);
      return;
    }

    // Verificar se é admin
    const userProfile = await buscarUsuario(currentUser.uid);

    if (userProfile.success && userProfile.usuario.isAdmin) {
      showStatus(`✅ ${currentUser.email} é ADMIN! Login funcionando.`, true);
    } else {
      showStatus(
        `❌ ${currentUser.email} NÃO é admin. Configure primeiro.`,
        false
      );
    }
  } catch (error) {
    showStatus(`❌ Erro no teste: ${error.message}`, false);
  }
};
