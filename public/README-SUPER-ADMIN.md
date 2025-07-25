# 👑 Sistema de Super Administração - PedidoFácil

## 📋 Visão Geral

Este sistema implementa um controle hierárquico de administração onde apenas **Super Administradores** podem criar novos administradores e gerenciar o sistema.

## 🔐 Hierarquia de Administração

### 👑 **Super Administrador**

- **Pode**: Criar novos admins, promover super admins, remover super admins
- **Acesso**: Todas as funcionalidades do sistema
- **Criação**: Apenas através da página especial com código de segurança

### 👤 **Administrador Normal**

- **Pode**: Gerenciar produtos, pedidos, dashboard
- **Não pode**: Criar novos admins, promover super admins
- **Criação**: Apenas por super administradores

## 🚀 Como Configurar o Primeiro Super Admin

### 1. Acesse a Página de Criação do Super Admin

- Vá para: `http://localhost:3000/criar-super-admin.html`
- **IMPORTANTE**: Use esta página apenas uma vez

### 2. Preencha os Dados

- **Nome Completo**: Seu nome completo
- **E-mail**: Seu e-mail principal
- **Senha**: Senha forte (mínimo 8 caracteres)
- **Confirmar Senha**: Confirme a senha
- **Código de Segurança**: `SUPER2024` (você pode alterar no código)

### 3. Clique em "Criar Super Administrador"

- Sistema criará automaticamente no Firebase Auth e Firestore
- Redirecionamento para login admin

## 🔑 Como Fazer Login como Super Admin

### Opção 1: Pela Página Inicial

1. Acesse a página inicial
2. Clique em "Entrar ▼" (dropdown)
3. Selecione "🔐 Login Admin"
4. Digite suas credenciais de super admin

### Opção 2: Acesso Direto

- URL: `http://localhost:3000/admin-login.html`

## 👥 Como Gerenciar Administradores

### Acessar Gerenciamento de Admins

- Faça login como super admin
- Acesse: `http://localhost:3000/Admin/gerenciar-admins.html`

### Funcionalidades Disponíveis:

#### **👑 Super Administradores**

- Visualizar todos os super admins
- Promover admins normais para super admin
- Remover privilégios de super admin (exceto de si mesmo)

#### **👤 Administradores**

- Visualizar todos os admins normais
- Criar novos administradores
- Remover administradores

#### **📋 Meus Admins Criados**

- Visualizar admins criados por você
- Histórico de criação

## 🔧 Como Criar Novos Administradores

### 1. Acesse o Gerenciamento

- Faça login como super admin
- Vá para "Gerenciar Administradores"

### 2. Clique em "Criar Novo Admin"

- Preencha: Nome, E-mail, Senha
- Sistema criará automaticamente no Firebase

### 3. O Novo Admin Pode Fazer Login

- Usar a página de login admin
- Acessar o painel administrativo

## 📊 Como Ver Admins no Firebase

### **Firebase Console → Authentication**

```
Users (usuários registrados)
├── user1@email.com (Super Admin)
├── user2@email.com (Admin Normal)
└── user3@email.com (Cliente)
```

### **Firebase Console → Firestore**

```
Collection: usuarios
├── userId1: {
│   nome: "Seu Nome",
│   email: "seu@email.com",
│   isAdmin: true,
│   isSuperAdmin: true,
│   createdAt: timestamp
│ }
├── userId2: {
│   nome: "Admin Normal",
│   email: "admin@email.com",
│   isAdmin: true,
│   isSuperAdmin: false,
│   createdBy: "userId1",
│   createdAt: timestamp
│ }
└── userId3: {
    nome: "Cliente",
    email: "cliente@email.com",
    isAdmin: false,
    isSuperAdmin: false,
    createdAt: timestamp
  }
```

## 🛡️ Proteções de Segurança

### **Verificação Hierárquica**

- ✅ Apenas super admins podem criar novos admins
- ✅ Apenas super admins podem promover outros super admins
- ✅ Super admins não podem remover seus próprios privilégios
- ✅ Verificação dupla: Firebase Auth + Firestore

### **Código de Segurança**

- 🔐 Código `SUPER2024` para criar primeiro super admin
- 🔐 Você pode alterar este código no arquivo `criar-super-admin.js`
- 🔐 Proteção contra criação acidental de super admins

## 📁 Estrutura de Arquivos

```
public/src/
├── criar-super-admin.html      # Criar primeiro super admin
├── criar-super-admin.js        # Lógica do super admin
├── admin-login.html            # Login para admins
├── admin-login.css             # Estilos do login
├── admin-login.js              # Lógica do login
├── criar-admin.html            # Criar admin (descontinuado)
├── Admin/
│   ├── home.html               # Painel principal
│   ├── gerenciar-admins.html   # Gerenciar admins
│   ├── gerenciar-admins.js     # Lógica de gerenciamento
│   └── css.css                 # Estilos do admin
└── services/
    └── firebaseService.js      # Serviços de admin/super admin
```

## 🔧 Funções de Super Admin Disponíveis

### **No Firebase Service (`firebaseService.js`)**

```javascript
// Verificar se é super admin
verificarSuperAdmin(userId);

// Criar super admin (apenas configuração inicial)
criarSuperAdmin(superAdminData);

// Criar admin (apenas super admins)
criarAdminPorSuperAdmin(adminData, superAdminId);

// Promover para super admin
tornarSuperAdmin(userId, superAdminId);

// Remover super admin
removerSuperAdmin(userId, superAdminId);

// Listar super admins
listarSuperAdmins();

// Listar admins criados por um super admin
listarAdminsPorSuperAdmin(superAdminId);
```

## 🎯 Fluxo de Autenticação

```
1. Usuário acessa admin-login.html
2. Digite e-mail e senha
3. Firebase Auth valida credenciais
4. Sistema verifica se é admin no Firestore
5. Sistema verifica se é super admin
6. Se super admin → Acesso completo
7. Se admin normal → Acesso limitado
8. Se não admin → Logout e redirecionamento
```

## 🚨 Importante

### **Segurança**

- ⚠️ **NUNCA** compartilhe as credenciais de super admin
- ⚠️ Use senhas fortes (mínimo 8 caracteres)
- ⚠️ A página `criar-super-admin.html` deve ser usada apenas uma vez
- ⚠️ Após criar o super admin, considere remover ou proteger a página

### **Backup**

- 💾 Mantenha backup das credenciais de super admin
- 💾 Documente os e-mails de super administradores
- 💾 Configure recuperação de senha no Firebase

### **Código de Segurança**

- 🔐 Código atual: `SUPER2024`
- 🔐 Para alterar: Edite a constante `CODIGO_SEGURANCA` em `criar-super-admin.js`
- 🔐 Use um código único e seguro

## 🛠️ Troubleshooting

### **Erro: "Já existe um super administrador"**

- Use a página de login admin em vez da criação
- Verifique se não há múltiplos super admins

### **Erro: "Código de segurança incorreto"**

- Verifique se digitou `SUPER2024` corretamente
- Verifique se não há espaços extras

### **Erro: "Apenas super administradores podem criar novos admins"**

- Faça login como super admin
- Use a página de gerenciamento de admins

### **Erro: "Acesso negado"**

- Verifique se o usuário existe no Firebase Auth
- Verifique se os campos `isAdmin` e `isSuperAdmin` estão corretos
- Tente fazer logout e login novamente

## 📞 Suporte

Para problemas técnicos:

1. Verifique o console do navegador (F12)
2. Verifique os logs do Firebase
3. Confirme se todas as dependências estão carregadas
4. Verifique as regras de segurança do Firestore

---

**⚠️ Lembre-se**: Este sistema é para uso interno. Mantenha as credenciais seguras e não compartilhe com usuários não autorizados. O super admin tem controle total sobre o sistema.
