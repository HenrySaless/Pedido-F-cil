# 🚀 Sistema de Administração - PedidoFácil

## 📋 Visão Geral

Este sistema implementa um controle de acesso administrativo completo para o PedidoFácil, permitindo que apenas usuários autorizados acessem o painel de administração.

## 🔐 Como Configurar o Primeiro Administrador

### 1. Acesse a Página de Criação do Admin

- Vá para: `http://localhost:3000/criar-admin.html`
- **IMPORTANTE**: Use esta página apenas uma vez para criar o primeiro admin

### 2. Preencha os Dados

- **Nome Completo**: Nome do administrador
- **E-mail**: E-mail que será usado para login
- **Senha**: Senha forte (mínimo 6 caracteres)
- **Confirmar Senha**: Confirme a senha

### 3. Clique em "Criar Administrador"

- O sistema criará automaticamente:
  - Usuário no Firebase Authentication
  - Perfil de administrador no Firestore
  - Redirecionamento para o login admin

## 🔑 Como Fazer Login como Admin

### Opção 1: Pela Página Inicial

1. Acesse a página inicial
2. Clique em "Entrar ▼" (dropdown)
3. Selecione "🔐 Login Admin"
4. Digite suas credenciais de admin

### Opção 2: Acesso Direto

- URL: `http://localhost:3000/admin-login.html`

## 🛡️ Proteções de Segurança

### Verificação de Admin

- ✅ Verificação de autenticação Firebase
- ✅ Verificação de perfil admin no Firestore
- ✅ Redirecionamento automático se não for admin
- ✅ Logout automático se credenciais inválidas

### Proteção do Painel Admin

- ✅ Verificação em todas as páginas administrativas
- ✅ Botão de logout no painel
- ✅ Limpeza de dados de sessão

## 📁 Estrutura de Arquivos

```
public/src/
├── admin-login.html          # Página de login do admin
├── admin-login.css           # Estilos do login admin
├── admin-login.js            # Lógica do login admin
├── criar-admin.html          # Página para criar primeiro admin
├── criar-admin.js            # Lógica para criar admin
├── Admin/
│   ├── home.html             # Painel administrativo
│   ├── index.js              # Lógica do painel (com proteção)
│   └── css.css               # Estilos do painel
└── services/
    └── firebaseService.js    # Serviços de admin (verificarAdmin, criarAdmin, etc.)
```

## 🔧 Funções de Admin Disponíveis

### No Firebase Service (`firebaseService.js`)

```javascript
// Verificar se usuário é admin
verificarAdmin(userId);

// Criar novo admin
criarAdmin(adminData);

// Tornar usuário admin
tornarAdmin(userId);

// Remover perfil admin
removerAdmin(userId);

// Listar todos os admins
listarAdmins();
```

## 🎯 Funcionalidades do Painel Admin

### Dashboard

- 📊 Contadores em tempo real (pedidos, pendentes, entregues, receita)
- 📦 Lista de produtos em estoque
- 📋 Lista de pedidos dos usuários
- 🔧 Botão para cadastrar novos produtos

### Gestão de Produtos

- ➕ Cadastrar novos produtos
- ✏️ Editar produtos existentes
- 🗑️ Excluir produtos
- 📊 Visualizar estoque

### Gestão de Pedidos

- 👁️ Ver detalhes dos pedidos
- 🔄 Atualizar status (pendente → preparo → entregue)
- 📊 Relatórios de vendas

## 🚨 Importante

### Segurança

- ⚠️ **NUNCA** compartilhe as credenciais de admin
- ⚠️ Use senhas fortes
- ⚠️ A página `criar-admin.html` deve ser usada apenas uma vez
- ⚠️ Após criar o primeiro admin, considere remover ou proteger a página

### Backup

- 💾 Mantenha backup das credenciais de admin
- 💾 Documente os e-mails de administradores
- 💾 Configure recuperação de senha no Firebase

## 🔄 Fluxo de Autenticação

```
1. Usuário acessa admin-login.html
2. Digite e-mail e senha
3. Firebase Auth valida credenciais
4. Sistema verifica se é admin no Firestore
5. Se admin → Acesso ao painel
6. Se não admin → Logout e redirecionamento
```

## 🛠️ Troubleshooting

### Erro: "Acesso negado"

- Verifique se o usuário existe no Firebase Auth
- Verifique se o campo `isAdmin: true` existe no Firestore
- Tente fazer logout e login novamente

### Erro: "Já existe um administrador"

- Use a página de login admin em vez da criação
- Verifique se não há múltiplos admins no sistema

### Erro: "Erro de conexão"

- Verifique a conexão com a internet
- Verifique se o Firebase está configurado corretamente
- Verifique as regras de segurança do Firestore

## 📞 Suporte

Para problemas técnicos:

1. Verifique o console do navegador (F12)
2. Verifique os logs do Firebase
3. Confirme se todas as dependências estão carregadas

---

**⚠️ Lembre-se**: Este sistema é para uso interno. Mantenha as credenciais seguras e não compartilhe com usuários não autorizados.
