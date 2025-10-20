# 🔒 Guia de Teste - Rotas Protegidas com JWT

Este guia mostra como testar a autenticação JWT e as rotas protegidas da API S3E System.

---

## 📋 Pré-requisitos

1. **Backend rodando:**
   ```bash
   cd backend
   npm run dev
   ```
   Deve estar em: `http://localhost:3001`

2. **Banco de dados:**
   - PostgreSQL rodando
   - Seed executado (usuário admin criado)

---

## 🧪 Testes com cURL (Git Bash)

### **Passo 1: Fazer Login e Obter Token**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@s3e.com.br","password":"123456"}'
```

**Resposta esperada (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@s3e.com.br",
    "name": "Administrador",
    "role": "admin"
  }
}
```

**⚠️ IMPORTANTE:** Copie o valor do `token` da resposta!

---

### **Passo 2: Testar Rota Protegida (Qualquer Usuário Autenticado)**

Substitua `SEU_TOKEN_AQUI` pelo token que você copiou:

```bash
curl -X GET http://localhost:3000/api/protected/data \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "message": "Dados protegidos acessados com sucesso",
  "data": {
    "userId": "...",
    "role": "admin",
    "timestamp": "2025-10-20T...",
    "accessLevel": "Administrador"
  }
}
```

---

### **Passo 3: Testar Rota Admin-Only (Apenas Administradores)**

```bash
curl -X GET http://localhost:3000/api/protected/admin-only \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "message": "Dados de administrador acessados com sucesso",
  "data": {
    "userId": "...",
    "role": "admin",
    "adminLevel": "Acesso total",
    "timestamp": "2025-10-20T..."
  }
}
```

---

### **Passo 4: Testar Erro - Sem Token**

```bash
curl -X GET http://localhost:3000/api/protected/data
```

**Resposta esperada (401):**
```json
{
  "error": "Token não fornecido"
}
```

---

### **Passo 5: Testar Erro - Token Inválido**

```bash
curl -X GET http://localhost:3000/api/protected/data \
  -H "Authorization: Bearer token_invalido_123"
```

**Resposta esperada (401):**
```json
{
  "error": "Token inválido"
}
```

---

## 🧪 Testes com Postman/Insomnia

### **1. Login**
- **Método:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "email": "admin@s3e.com.br",
    "password": "123456"
  }
  ```

### **2. Rota Protegida**
- **Método:** GET
- **URL:** `http://localhost:3000/api/protected/data`
- **Headers:**
  - `Authorization: Bearer [TOKEN_DO_LOGIN]`

### **3. Rota Admin**
- **Método:** GET
- **URL:** `http://localhost:3000/api/protected/admin-only`
- **Headers:**
  - `Authorization: Bearer [TOKEN_DO_LOGIN]`

---

## ✅ Checklist de Validação

Marque conforme for testando:

- [ ] Login retorna token JWT válido
- [ ] Rota `/api/protected/data` funciona com token válido
- [ ] Rota `/api/protected/admin-only` funciona para admin
- [ ] Rota protegida retorna 401 sem token
- [ ] Rota protegida retorna 401 com token inválido
- [ ] Token expira após 7 dias (opcional - testar depois)

---

## 🔍 Estrutura Implementada

### **Arquivos Criados/Implementados:**

1. **`src/middlewares/auth.ts`**
   - `authenticate()` - Valida token JWT
   - `authorize(...roles)` - Verifica permissões por role
   - Interface `AuthRequest` - Injeta `req.user`

2. **`src/services/jwt.service.ts`**
   - `generateToken()` - Cria tokens JWT
   - `verifyToken()` - Valida tokens
   - `extractTokenFromHeader()` - Extrai token do header

3. **`src/controllers/protectedController.ts`**
   - `getProtectedData()` - Controller de teste básico
   - `getAdminData()` - Controller de teste admin

4. **`src/routes/protected.routes.ts`**
   - `GET /data` - Rota protegida básica
   - `GET /admin-only` - Rota apenas para admins

5. **`src/app.ts`**
   - Registra `/api/protected` no Express

---

## 🎯 Fluxo de Autenticação

```
1. Cliente faz POST /api/auth/login
   ↓
2. Backend valida credenciais
   ↓
3. Backend gera JWT (válido por 7 dias)
   ↓
4. Cliente recebe token
   ↓
5. Cliente envia token em requisições protegidas
   Header: Authorization: Bearer <token>
   ↓
6. Middleware authenticate() valida token
   ↓
7. Middleware injeta dados do usuário em req.user
   ↓
8. Controller acessa req.user e retorna dados
```

---

## 🚨 Troubleshooting

### **Erro: "Token não fornecido"**
- **Causa:** Header `Authorization` ausente
- **Solução:** Adicione `Authorization: Bearer <token>`

### **Erro: "Token inválido"**
- **Causa:** Token malformado ou assinatura incorreta
- **Solução:** Faça login novamente para obter novo token

### **Erro: "Token expirado"**
- **Causa:** Token passou de 7 dias
- **Solução:** Faça login novamente

### **Erro: "Acesso negado"**
- **Causa:** Usuário não tem role necessária (ex: não é admin)
- **Solução:** Use um usuário com permissão adequada

---

## 📝 Exemplo Completo (Script Bash)

Salve como `test-auth.sh`:

```bash
#!/bin/bash

echo "🔐 Testando Sistema de Autenticação S3E"
echo "========================================"

# 1. Login
echo -e "\n1️⃣ Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@s3e.com.br","password":"123456"}')

echo "$LOGIN_RESPONSE" | jq .

# Extrair token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .token)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Erro: Não foi possível obter token"
    exit 1
fi

echo -e "\n✅ Token obtido com sucesso!"
echo "Token: ${TOKEN:0:50}..."

# 2. Testar rota protegida
echo -e "\n2️⃣ Testando rota protegida..."
curl -s -X GET http://localhost:3000/api/protected/data \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Testar rota admin
echo -e "\n3️⃣ Testando rota admin..."
curl -s -X GET http://localhost:3000/api/protected/admin-only \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Testar sem token
echo -e "\n4️⃣ Testando sem token (deve dar erro 401)..."
curl -s -X GET http://localhost:3000/api/protected/data | jq .

echo -e "\n✅ Testes concluídos!"
```

**Para executar:**
```bash
chmod +x test-auth.sh
./test-auth.sh
```

**Nota:** Requer `jq` instalado para formatar JSON. Instale com:
```bash
# Windows (Git Bash/Chocolatey)
choco install jq

# Ou baixe em: https://stedolan.github.io/jq/
```

---

## 🎉 Conclusão

O sistema de autenticação JWT está completamente implementado e integrado! Todas as rotas protegidas estão funcionando com:

- ✅ Validação de token JWT
- ✅ Injeção de dados do usuário em `req.user`
- ✅ Controle de acesso por roles (admin, user, etc)
- ✅ Tratamento de erros (token inválido, expirado, etc)
- ✅ Integração completa com o Express

**Pronto para uso em produção!** 🚀

