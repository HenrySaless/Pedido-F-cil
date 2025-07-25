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
    querySnapshot.forEach((doc) => {
      produtos.push({
        id: doc.id,
        ...doc.data(),
      });
    });
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
    const docRef = await addDoc(collection(db, "pedidos"), {
      ...pedidoData,
      status: "pendente",
      createdAt: serverTimestamp(),
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
    const q = query(
      collection(db, "pedidos"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
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
    console.error("Erro ao listar pedidos do usuário:", error);
    return { success: false, error: error.message };
  }
}

// Atualizar status do pedido
export async function atualizarStatusPedido(id, novoStatus) {
  try {
    const docRef = doc(db, "pedidos", id);
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
