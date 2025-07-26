import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ===== SERVIÇOS DE PRODUTOS =====

// Criar novo produto
export async function criarProduto(produtoData) {
  try {
    const docRef = await addDoc(collection(db, "produtos"), {
      ...produtoData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { success: false, error: error.message };
  }
}

// Listar todos os produtos
export async function listarProdutos() {
  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    const produtos = [];
    const chavesVistas = new Set();

    querySnapshot.forEach((doc) => {
      const produto = {
        id: doc.id,
        ...doc.data(),
      };

      // Criar chave única para deduplicação
      const nomeKey = produto.nome
        ? produto.nome
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
        : "";
      const precoKey = Number(produto.preco || 0).toFixed(2);
      const categoriaKey = produto.categoria
        ? produto.categoria
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
        : "";
      const lojaKey = produto.loja
        ? produto.loja
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
        : "";
      const chave =
        nomeKey + "-" + precoKey + "-" + categoriaKey + "-" + lojaKey;

      if (!chavesVistas.has(chave)) {
        produtos.push(produto);
        chavesVistas.add(chave);
      }
    });

    console.log("Produtos únicos retornados do Firebase:", produtos.length);
    return { success: true, produtos };
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return { success: false, error: error.message };
  }
}

// Buscar produto por ID
export async function buscarProduto(id) {
  try {
    const docRef = doc(db, "produtos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, produto: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Produto não encontrado" };
    }
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return { success: false, error: error.message };
  }
}

// Atualizar produto
export async function atualizarProduto(id, produtoData) {
  try {
    const docRef = doc(db, "produtos", id);
    await updateDoc(docRef, {
      ...produtoData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: error.message };
  }
}

// Excluir produto
export async function excluirProduto(id) {
  try {
    await deleteDoc(doc(db, "produtos", id));
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return { success: false, error: error.message };
  }
}

// ===== SERVIÇOS DE PEDIDOS =====

// Criar novo pedido
export async function criarPedido(pedidoData) {
  try {
    // Primeiro, verificar se há estoque suficiente
    const produtoResult = await buscarProduto(pedidoData.produtoId);
    if (!produtoResult.success) {
      return { success: false, error: "Produto não encontrado" };
    }

    const produto = produtoResult.produto;
    const estoqueAtual = produto.maxQtd || 0;
    const quantidadeSolicitada = pedidoData.qtd || 0;

    if (quantidadeSolicitada > estoqueAtual) {
      return {
        success: false,
        error: `Estoque insuficiente. Disponível: ${estoqueAtual}, Solicitado: ${quantidadeSolicitada}`,
      };
    }

    // Criar o pedido
    const docRef = await addDoc(collection(db, "pedidos"), {
      ...pedidoData,
      status: "pendente",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Atualizar o estoque do produto
    const novoEstoque = estoqueAtual - quantidadeSolicitada;
    await updateDoc(doc(db, "produtos", pedidoData.produtoId), {
      maxQtd: novoEstoque,
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return { success: false, error: error.message };
  }
}

// Listar todos os pedidos
export async function listarPedidos() {
  try {
    const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return { success: true, pedidos };
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return { success: false, error: error.message };
  }
}

// Listar pedidos por usuário
export async function listarPedidosPorUsuario(userId) {
  try {
    const q = query(collection(db, "pedidos"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const pedidos = [];
    querySnapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar localmente por data de criação (mais recente primeiro)
    pedidos.sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt.seconds * 1000)
        : new Date(a.data || 0);
      const dateB = b.createdAt
        ? new Date(b.createdAt.seconds * 1000)
        : new Date(b.data || 0);
      return dateB - dateA;
    });

    return { success: true, pedidos };
  } catch (error) {
    console.error("Erro ao listar pedidos do usuário:", error);
    return { success: false, error: error.message };
  }
}

// Atualizar status do pedido
export async function atualizarStatusPedido(id, novoStatus) {
  try {
    const docRef = doc(db, "pedidos", id);

    // Se o status for cancelado ou rejeitado, restaurar o estoque
    if (novoStatus === "cancelado" || novoStatus === "rejeitado") {
      const pedidoDoc = await getDoc(docRef);
      if (pedidoDoc.exists()) {
        const pedidoData = pedidoDoc.data();
        const produtoResult = await buscarProduto(pedidoData.produtoId);

        if (produtoResult.success) {
          const produto = produtoResult.produto;
          const estoqueAtual = produto.maxQtd || 0;
          const quantidadeRestaurar = pedidoData.qtd || 0;
          const novoEstoque = estoqueAtual + quantidadeRestaurar;

          await updateDoc(doc(db, "produtos", pedidoData.produtoId), {
            maxQtd: novoEstoque,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    await updateDoc(docRef, {
      status: novoStatus,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return { success: false, error: error.message };
  }
}

// Atualizar pedido
export async function atualizarPedido(id, pedidoData) {
  try {
    const docRef = doc(db, "pedidos", id);
    await updateDoc(docRef, {
      ...pedidoData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return { success: false, error: error.message };
  }
}

// Excluir pedido
export async function excluirPedido(id) {
  try {
    await deleteDoc(doc(db, "pedidos", id));
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);
    return { success: false, error: error.message };
  }
}

// Limpar todos os pedidos de um usuário
export async function limparPedidosUsuario(userId) {
  try {
    const q = query(collection(db, "pedidos"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar pedidos do usuário:", error);
    return { success: false, error: error.message };
  }
}

// ===== SERVIÇOS DE AUTENTICAÇÃO ADMIN =====

// Verificar se usuário é admin
export async function verificarAdmin(userId) {
  try {
    const docRef = doc(db, "usuarios", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return { success: true, isAdmin: userData.isAdmin === true };
    } else {
      return { success: false, isAdmin: false };
    }
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    return { success: false, isAdmin: false, error: error.message };
  }
}

// Criar usuário admin
export async function criarAdmin(adminData) {
  try {
    // Usa o uid do Firebase Auth como ID do documento
    const docRef = doc(db, "usuarios", adminData.uid);
    await setDoc(docRef, {
      ...adminData,
      isAdmin: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: adminData.uid };
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return { success: false, error: error.message };
  }
}

// Atualizar perfil de usuário para admin
export async function tornarAdmin(userId) {
  try {
    const docRef = doc(db, "usuarios", userId);
    await updateDoc(docRef, {
      isAdmin: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao tornar admin:", error);
    return { success: false, error: error.message };
  }
}

// Remover perfil admin
export async function removerAdmin(userId) {
  try {
    const docRef = doc(db, "usuarios", userId);
    await updateDoc(docRef, {
      isAdmin: false,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover admin:", error);
    return { success: false, error: error.message };
  }
}

// Listar todos os admins
export async function listarAdmins() {
  try {
    const q = query(collection(db, "usuarios"), where("isAdmin", "==", true));
    const querySnapshot = await getDocs(q);
    const admins = [];
    querySnapshot.forEach((doc) => {
      admins.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return { success: true, admins };
  } catch (error) {
    console.error("Erro ao listar admins:", error);
    return { success: false, error: error.message };
  }
}

// ===== SERVIÇOS DE USUÁRIOS =====

// Criar usuário
export async function criarUsuario(userData) {
  try {
    const docRef = doc(db, "usuarios", userData.uid);
    await setDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: userData.uid };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, error: error.message };
  }
}

// Buscar usuário por ID
export async function buscarUsuario(userId) {
  try {
    const docRef = doc(db, "usuarios", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, usuario: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Usuário não encontrado" };
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return { success: false, error: error.message };
  }
}

// Atualizar usuário
export async function atualizarUsuario(userId, userData) {
  try {
    const docRef = doc(db, "usuarios", userId);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: error.message };
  }
}

// ===== SERVIÇOS DE SUPER ADMIN =====

// Verificar se usuário é super admin
export async function verificarSuperAdmin(userId) {
  try {
    const docRef = doc(db, "usuarios", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return { success: true, isSuperAdmin: userData.isSuperAdmin === true };
    } else {
      return { success: false, isSuperAdmin: false };
    }
  } catch (error) {
    console.error("Erro ao verificar super admin:", error);
    return { success: false, isSuperAdmin: false, error: error.message };
  }
}

// Criar super admin (apenas para configuração inicial)
export async function criarSuperAdmin(superAdminData) {
  try {
    // Usa o uid do Firebase Auth como ID do documento
    const docRef = doc(db, "usuarios", superAdminData.uid);
    await setDoc(docRef, {
      ...superAdminData,
      isAdmin: true,
      isSuperAdmin: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: superAdminData.uid };
  } catch (error) {
    console.error("Erro ao criar super admin:", error);
    return { success: false, error: error.message };
  }
}

// Criar admin (apenas super admins podem fazer isso)
export async function criarAdminPorSuperAdmin(adminData, superAdminId) {
  try {
    // Verifica se quem está criando é super admin
    const superAdminCheck = await verificarSuperAdmin(superAdminId);
    if (!superAdminCheck.success || !superAdminCheck.isSuperAdmin) {
      return {
        success: false,
        error: "Apenas super administradores podem criar novos admins.",
      };
    }

    // Usa o uid do Firebase Auth como ID do documento
    const docRef = doc(db, "usuarios", adminData.uid);
    await setDoc(docRef, {
      ...adminData,
      isAdmin: true,
      isSuperAdmin: false, // Novos admins criados não são super admins
      createdBy: superAdminId, // Quem criou
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: adminData.uid };
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return { success: false, error: error.message };
  }
}

// Tornar usuário super admin (apenas super admins podem fazer isso)
export async function tornarSuperAdmin(userId, superAdminId) {
  try {
    // Verifica se quem está fazendo é super admin
    const superAdminCheck = await verificarSuperAdmin(superAdminId);
    if (!superAdminCheck.success || !superAdminCheck.isSuperAdmin) {
      return {
        success: false,
        error:
          "Apenas super administradores podem promover outros super admins.",
      };
    }

    const docRef = doc(db, "usuarios", userId);
    await updateDoc(docRef, {
      isAdmin: true,
      isSuperAdmin: true,
      promotedBy: superAdminId,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao tornar super admin:", error);
    return { success: false, error: error.message };
  }
}

// Remover super admin (apenas super admins podem fazer isso)
export async function removerSuperAdmin(userId, superAdminId) {
  try {
    // Verifica se quem está fazendo é super admin
    const superAdminCheck = await verificarSuperAdmin(superAdminId);
    if (!superAdminCheck.success || !superAdminCheck.isSuperAdmin) {
      return {
        success: false,
        error:
          "Apenas super administradores podem remover outros super admins.",
      };
    }

    // Não permite remover a si mesmo
    if (userId === superAdminId) {
      return {
        success: false,
        error:
          "Você não pode remover seus próprios privilégios de super admin.",
      };
    }

    const docRef = doc(db, "usuarios", userId);
    await updateDoc(docRef, {
      isSuperAdmin: false,
      removedBy: superAdminId,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover super admin:", error);
    return { success: false, error: error.message };
  }
}

// Listar todos os super admins
export async function listarSuperAdmins() {
  try {
    const q = query(
      collection(db, "usuarios"),
      where("isSuperAdmin", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const superAdmins = [];
    querySnapshot.forEach((doc) => {
      superAdmins.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return { success: true, superAdmins };
  } catch (error) {
    console.error("Erro ao listar super admins:", error);
    return { success: false, error: error.message };
  }
}

// Listar admins criados por um super admin específico
export async function listarAdminsPorSuperAdmin(superAdminId) {
  try {
    const q = query(
      collection(db, "usuarios"),
      where("createdBy", "==", superAdminId)
    );
    const querySnapshot = await getDocs(q);
    const admins = [];
    querySnapshot.forEach((doc) => {
      admins.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return { success: true, admins };
  } catch (error) {
    console.error("Erro ao listar admins por super admin:", error);
    return { success: false, error: error.message };
  }
}
