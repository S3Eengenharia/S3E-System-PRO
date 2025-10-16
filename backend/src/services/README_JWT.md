# 🔐 Serviço de JWT - Documentação

## 📋 Visão Geral

O serviço JWT (`jwt.service.ts`) centraliza toda a lógica de geração e validação de tokens JWT (JSON Web Tokens) para autenticação no sistema S3E.

## 🎯 Características

- ✅ Geração de tokens com expiração de 7 dias
- ✅ Validação e verificação de tokens
- ✅ Extração automática de tokens dos headers
- ✅ Tratamento de erros específicos (token expirado, inválido, etc)
- ✅ Tipagem TypeScript completa
- ✅ Usa JWT_SECRET das variáveis de ambiente

## 📦 Funções Disponíveis

### 1. `generateToken(payload)`

Gera um novo token JWT válido por 7 dias.

**Parâmetros:**
```typescript
{
  id: string;      // ID único do usuário
  role: string;    // Role/perfil (admin, user, orcamentista, etc)
}
```

**Retorno:** `string` - Token JWT assinado

**Exemplo:**
```typescript
import { generateToken } from '../services/jwt.service';

const token = generateToken({
  id: 'user-abc-123',
  role: 'admin'
});

console.log(token);
// Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. `verifyToken(token)`

Valida e decodifica um token JWT.

**Parâmetros:**
- `token: string` - Token JWT a ser validado

**Retorno:** `DecodedToken` - Payload decodificado
```typescript
{
  userId: string;
  role: string;
  iat?: number;   // Issued at (timestamp)
  exp?: number;   // Expiration (timestamp)
}
```

**Throws:** `Error` - Se o token for inválido ou expirado

**Exemplo:**
```typescript
import { verifyToken } from '../services/jwt.service';

try {
  const decoded = verifyToken(token);
  console.log(decoded.userId);  // "user-abc-123"
  console.log(decoded.role);    // "admin"
} catch (error) {
  console.error('Token inválido:', error.message);
  // Possíveis erros:
  // - "Token expirado"
  // - "Token inválido"
  // - "Token ainda não é válido"
}
```

---

### 3. `extractTokenFromHeader(authHeader)`

Extrai o token do header de autorização.

**Parâmetros:**
- `authHeader: string | undefined` - Header Authorization (formato: "Bearer \<token\>")

**Retorno:** `string | null` - Token extraído ou null se inválido

**Exemplo:**
```typescript
import { extractTokenFromHeader, verifyToken } from '../services/jwt.service';

const authHeader = req.headers.authorization;
const token = extractTokenFromHeader(authHeader);

if (token) {
  const decoded = verifyToken(token);
  console.log('Usuário autenticado:', decoded.userId);
} else {
  console.error('Token não fornecido');
}
```

---

### 4. `decodeTokenWithoutVerification(token)`

⚠️ **USO INTERNO/DEBUG APENAS** - Decodifica token sem verificar assinatura.

**NÃO USE PARA VALIDAÇÃO DE AUTENTICAÇÃO!**

**Parâmetros:**
- `token: string` - Token JWT

**Retorno:** `any` - Payload decodificado (sem validação)

**Exemplo:**
```typescript
import { decodeTokenWithoutVerification } from '../services/jwt.service';

const payload = decodeTokenWithoutVerification(token);
console.log('Debug - Payload:', payload);
```

---

## 🔧 Uso nos Controllers

### Exemplo: Register/Login (authController.ts)

```typescript
import { generateToken } from '../services/jwt.service';

export const login = async (req: Request, res: Response) => {
  // ... validação de credenciais ...
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Gerar token
  const token = generateToken({ 
    id: user.id, 
    role: user.role 
  });
  
  res.json({
    message: 'Login realizado com sucesso',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
};
```

---

## 🛡️ Uso nos Middlewares

### Exemplo: Middleware de Autenticação (auth.ts)

```typescript
import { verifyToken, extractTokenFromHeader } from '../services/jwt.service';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extrair token
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    // Verificar token
    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
```

---

## 🧪 Testando o Serviço

### Via cURL

```bash
# 1. Login (obter token)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@s3e.com",
    "password": "123456"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }

# 2. Usar token em requisição protegida
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Via Postman/Insomnia

1. **Login:**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@s3e.com",
       "password": "123456"
     }
     ```
   - Copiar o `token` da resposta

2. **Requisição Autenticada:**
   - Method: GET
   - URL: `http://localhost:3001/api/auth/me`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer SEU_TOKEN_AQUI`

### Via JavaScript/TypeScript

```typescript
// Teste unitário exemplo
import { generateToken, verifyToken } from './jwt.service';

describe('JWT Service', () => {
  it('deve gerar e validar token corretamente', () => {
    const payload = { id: 'user-123', role: 'admin' };
    
    // Gerar token
    const token = generateToken(payload);
    expect(token).toBeDefined();
    
    // Validar token
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('user-123');
    expect(decoded.role).toBe('admin');
  });
  
  it('deve rejeitar token inválido', () => {
    expect(() => {
      verifyToken('token_invalido');
    }).toThrow('Token inválido');
  });
});
```

---

## 🔐 Configuração de Segurança

### Variáveis de Ambiente

O serviço usa a variável `JWT_SECRET` do ambiente:

**Desenvolvimento (.env.development):**
```env
JWT_SECRET=seu_secret_dev_aqui_12345
```

**Produção (.env.production):**
```env
JWT_SECRET=seu_secret_producao_super_seguro_complexo_longo_e_aleatorio
```

### ⚠️ Melhores Práticas

1. **NUNCA** use o secret padrão em produção
2. **NUNCA** commite o `.env.production` no Git
3. Use secrets **longos e aleatórios** (mínimo 32 caracteres)
4. Gere secrets com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
5. Rotacione secrets periodicamente em produção
6. Use HTTPS em produção para proteger tokens em trânsito

---

## 📊 Estrutura do Token

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json
{
  "userId": "abc-123-def-456",
  "role": "admin",
  "iat": 1697500000,
  "exp": 1698104800
}
```

### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

---

## 🐛 Troubleshooting

### Erro: "Token expirado"
**Causa:** O token tem mais de 7 dias  
**Solução:** Fazer login novamente para obter novo token

### Erro: "Token inválido"
**Causa:** Token corrompido ou assinado com secret diferente  
**Solução:** Verificar se está usando o mesmo JWT_SECRET em todo o sistema

### Erro: "Token não fornecido"
**Causa:** Header Authorization não foi enviado  
**Solução:** Adicionar header `Authorization: Bearer <token>`

---

## 📚 Referências

- [JWT.io](https://jwt.io/) - Debugger e documentação
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - Especificação JWT
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - Biblioteca usada

---

## 🔄 Changelog

### v1.0.0 (16/10/2024)
- ✅ Criação do serviço JWT
- ✅ Funções: generateToken, verifyToken
- ✅ Função auxiliar: extractTokenFromHeader
- ✅ Tipagem completa com TypeScript
- ✅ Tratamento de erros específicos
- ✅ Integração com authController e middleware auth

