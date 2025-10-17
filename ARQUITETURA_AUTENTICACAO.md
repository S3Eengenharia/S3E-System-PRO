# 🏗️ Arquitetura de Autenticação - Sistema S3E

## 📋 Visão Geral

Implementação completa de um sistema de autenticação robusto seguindo as melhores práticas de arquitetura em camadas:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  ROTAS (auth.routes.ts)                  │
│  • POST /api/auth/login                                  │
│  • POST /api/auth/register                               │
│  • GET  /api/auth/me                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              MIDDLEWARES (validate.ts)                   │
│  • Validação com Zod                                     │
│  • Autenticação JWT                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            CONTROLLERS (authController.ts)               │
│  • Recebe requisições HTTP                               │
│  • Delega lógica para Services                           │
│  • Retorna respostas HTTP                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              SERVICES (auth.service.ts)                  │
│  • Lógica de negócio                                     │
│  • Interação com banco de dados                          │
│  • Geração de tokens JWT                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   BANCO DE DADOS                         │
│  • Prisma ORM                                            │
│  • PostgreSQL (ou SQLite em dev)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── validators/
│   │   └── auth.validator.ts       ✅ Schemas Zod para validação
│   │
│   ├── services/
│   │   ├── auth.service.ts         ✅ Lógica de autenticação
│   │   └── jwt.service.ts          ✅ Geração e validação JWT
│   │
│   ├── controllers/
│   │   └── authController.ts       ✅ Controllers HTTP
│   │
│   ├── middlewares/
│   │   ├── validate.ts             ✅ Middleware de validação Zod
│   │   └── auth.ts                 ✅ Middleware de autenticação JWT
│   │
│   ├── routes/
│   │   └── auth.ts                 ✅ Definição de rotas
│   │
│   └── app.ts                      ✅ Aplicação Express principal
│
└── prisma/
    └── schema.prisma               ✅ Schema do banco de dados
```

---

## 🔧 Componentes Detalhados

### 1. **Validators (auth.validator.ts)**

**Responsabilidade:** Definir schemas de validação usando Zod

**Schemas disponíveis:**
- `loginSchema` - Valida email e senha no login
- `registerSchema` - Valida dados de novo usuário
- `changePasswordSchema` - Valida mudança de senha

**Exemplo:**
```typescript
import { loginSchema } from '../validators/auth.validator';

const result = loginSchema.parse({
  email: 'user@s3e.com',
  password: '123456'
});
// result: { email: 'user@s3e.com', password: '123456' }
```

**Validações:**
- ✅ Email: formato válido, lowercase, trim
- ✅ Password: mínimo 6 caracteres
- ✅ Name: mínimo 2 caracteres (no registro)
- ✅ Role: enum valores permitidos (no registro)

---

### 2. **Services (auth.service.ts)**

**Responsabilidade:** Lógica de negócio de autenticação

**Funções disponíveis:**

#### `authenticateUser(email, password)`
Autentica um usuário com credenciais.

```typescript
const result = await authenticateUser('user@s3e.com', '123456');
// {
//   token: "eyJhbGci...",
//   user: { id: "...", email: "...", name: "...", role: "..." }
// }
```

**Validações:**
- ✅ Verifica se usuário existe
- ✅ Verifica se usuário está ativo
- ✅ Compara senha com hash (bcrypt)
- ✅ Gera token JWT
- ❌ Lança erro "Credenciais inválidas" se falhar

#### `registerUser(data)`
Registra novo usuário no sistema.

```typescript
const result = await registerUser({
  email: 'novo@s3e.com',
  password: '123456',
  name: 'Novo Usuário',
  role: 'user'
});
```

**Validações:**
- ✅ Verifica se email já existe
- ✅ Hash da senha com bcrypt
- ✅ Cria usuário no banco
- ✅ Gera token JWT
- ❌ Lança erro "Email já cadastrado" se existir

#### `getUserById(userId)`
Busca informações de um usuário.

```typescript
const user = await getUserById('user-123');
// { id: "...", email: "...", name: "...", role: "...", active: true, ... }
```

#### `updatePassword(userId, currentPassword, newPassword)`
Atualiza senha de um usuário.

```typescript
await updatePassword('user-123', 'senhaAtual', 'novaSenha123');
```

#### `emailExists(email)`
Verifica se um email já está cadastrado.

```typescript
const exists = await emailExists('user@s3e.com');
// true ou false
```

---

### 3. **Middlewares (validate.ts)**

**Responsabilidade:** Validar requisições usando schemas Zod

**Funções disponíveis:**

#### `validate(schema)`
Valida `req.body` com um schema Zod.

```typescript
router.post('/login', validate(loginSchema), loginController);
```

**Comportamento:**
- ✅ Valida e transforma dados
- ✅ Substitui `req.body` pelos dados validados
- ✅ Passa para próximo middleware se válido
- ❌ Retorna erro 400 com detalhes se inválido

**Exemplo de resposta de erro:**
```json
{
  "error": "Erro de validação",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    },
    {
      "field": "password",
      "message": "Senha deve ter no mínimo 6 caracteres"
    }
  ]
}
```

#### `validateQuery(schema)`
Valida `req.query` (query params).

#### `validateParams(schema)`
Valida `req.params` (params da URL).

---

### 4. **Controllers (authController.ts)**

**Responsabilidade:** Lidar com requisições HTTP

#### `login(req, res)`

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@s3e.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc-123",
    "email": "user@s3e.com",
    "name": "Usuário Teste",
    "role": "admin"
  }
}
```

**Erros:**
- `400` - Erro de validação
- `401` - Credenciais inválidas
- `403` - Usuário inativo
- `500` - Erro interno

---

#### `register(req, res)`

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "novo@s3e.com",
  "password": "123456",
  "name": "Novo Usuário",
  "role": "user"
}
```

**Response (201):**
```json
{
  "message": "Usuário criado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "xyz-789",
    "email": "novo@s3e.com",
    "name": "Novo Usuário",
    "role": "user"
  }
}
```

**Erros:**
- `400` - Email já cadastrado ou validação falhou
- `500` - Erro interno

---

#### `getMe(req, res)`

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "id": "abc-123",
  "email": "user@s3e.com",
  "name": "Usuário Teste",
  "role": "admin",
  "active": true,
  "createdAt": "2024-10-16T10:00:00.000Z",
  "updatedAt": "2024-10-16T10:00:00.000Z"
}
```

**Erros:**
- `401` - Token inválido ou expirado
- `404` - Usuário não encontrado
- `500` - Erro interno

---

### 5. **Rotas (auth.ts)**

**Responsabilidade:** Mapear URLs para controllers

```typescript
// Públicas (sem autenticação)
POST   /api/auth/register  → validate(registerSchema) → register
POST   /api/auth/login     → validate(loginSchema)    → login

// Protegidas (requer autenticação)
GET    /api/auth/me        → authenticate             → getMe
```

---

## 🔐 Fluxo de Autenticação Completo

### 1️⃣ **Login**

```
Cliente
  ↓ POST /api/auth/login { email, password }
  ↓
Rota (/api/auth/login)
  ↓
Middleware validate(loginSchema)
  ↓ Valida formato de email e senha
  ↓
Controller (login)
  ↓ Extrai { email, password }
  ↓
Service (authenticateUser)
  ↓ 1. Busca usuário no DB
  ↓ 2. Verifica se está ativo
  ↓ 3. Compara senha (bcrypt)
  ↓ 4. Gera token JWT
  ↓
Controller (login)
  ↓ Retorna { token, user }
  ↓
Cliente
  ↓ Salva token (localStorage/cookie)
```

### 2️⃣ **Requisição Autenticada**

```
Cliente
  ↓ GET /api/auth/me
  ↓ Header: Authorization: Bearer <token>
  ↓
Rota (/api/auth/me)
  ↓
Middleware authenticate
  ↓ 1. Extrai token do header
  ↓ 2. Verifica assinatura JWT
  ↓ 3. Decodifica payload
  ↓ 4. Anexa user em req.user
  ↓
Controller (getMe)
  ↓ Extrai userId de req.user
  ↓
Service (getUserById)
  ↓ Busca usuário no DB
  ↓
Controller (getMe)
  ↓ Retorna dados do usuário
  ↓
Cliente
```

---

## 🧪 Testando a API

### 1. **Login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@s3e.com",
    "password": "123456"
  }'
```

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### 2. **Registro**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@s3e.com",
    "password": "123456",
    "name": "Novo Usuário",
    "role": "user"
  }'
```

### 3. **Obter Dados do Usuário**

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGci..."
```

### 4. **Testar Validação (Deve Falhar)**

```bash
# Email inválido
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email_invalido",
    "password": "123456"
  }'
```

**Resposta esperada:**
```json
{
  "error": "Erro de validação",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

```bash
# Senha muito curta
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@s3e.com",
    "password": "123"
  }'
```

**Resposta esperada:**
```json
{
  "error": "Erro de validação",
  "details": [
    {
      "field": "password",
      "message": "Senha deve ter no mínimo 6 caracteres"
    }
  ]
}
```

---

## ✅ Benefícios da Arquitetura

### 1. **Separação de Responsabilidades**
- ✅ Validators: Validação de dados
- ✅ Services: Lógica de negócio
- ✅ Controllers: Interface HTTP
- ✅ Middlewares: Funcionalidades transversais

### 2. **Testabilidade**
- ✅ Cada camada pode ser testada independentemente
- ✅ Services são puras (sem dependência de HTTP)
- ✅ Fácil de mockar dependências

### 3. **Manutenibilidade**
- ✅ Código organizado e fácil de encontrar
- ✅ Mudanças isoladas em cada camada
- ✅ Reutilização de código

### 4. **Escalabilidade**
- ✅ Fácil adicionar novos endpoints
- ✅ Fácil adicionar novas validações
- ✅ Fácil adicionar novos services

### 5. **Segurança**
- ✅ Validação em todas as entradas
- ✅ Senhas com hash (bcrypt)
- ✅ Tokens JWT seguros
- ✅ Mensagens de erro genéricas (não expõe informações)

---

## 🚀 Próximos Passos

### Funcionalidades Futuras

1. **Recuperação de Senha**
   - Endpoint para solicitar reset
   - Envio de email com token
   - Endpoint para resetar senha

2. **Refresh Tokens**
   - Tokens de curta duração
   - Refresh tokens de longa duração
   - Endpoint para renovar tokens

3. **Autenticação de Dois Fatores (2FA)**
   - TOTP (Google Authenticator)
   - SMS
   - Email

4. **Logs de Auditoria**
   - Registrar logins
   - Registrar mudanças de senha
   - Registrar tentativas falhas

5. **Rate Limiting**
   - Limitar tentativas de login
   - Proteção contra brute force

---

## 📚 Referências

- **Zod:** https://zod.dev/
- **Prisma:** https://www.prisma.io/
- **bcryptjs:** https://www.npmjs.com/package/bcryptjs
- **jsonwebtoken:** https://www.npmjs.com/package/jsonwebtoken
- **Express:** https://expressjs.com/

---

**Data de Implementação:** 16 de Outubro de 2024  
**Versão:** 1.0.0  
**Status:** ✅ **IMPLEMENTADO E TESTADO**

