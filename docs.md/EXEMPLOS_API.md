# Exemplos de Uso da API - S3E System

## 🔗 Base URL
```
http://localhost:3000/api
```

---

## 🔐 Autenticação

### Registrar Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "joao@s3e.com",
  "password": "senha123",
  "name": "João Silva",
  "role": "admin"
}
```

**Resposta:**
```json
{
  "message": "Usuário criado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-aqui",
    "email": "joao@s3e.com",
    "name": "João Silva",
    "role": "admin"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@s3e.com",
  "password": "senha123"
}
```

**Resposta:** Mesma do registro

### Obter Dados do Usuário
```http
GET /api/auth/me
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 📦 Materiais

### Listar Todos os Materiais
```http
GET /api/materiais
Authorization: Bearer SEU_TOKEN
```

**Query params (opcional):**
- `categoria=MaterialEletrico`
- `ativo=true`

### Buscar Material por ID
```http
GET /api/materiais/uuid-do-material
Authorization: Bearer SEU_TOKEN
```

### Criar Material
```http
POST /api/materiais
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "nome": "Disjuntor 20A",
  "sku": "DJM-20A",
  "tipo": "Disjuntores",
  "categoria": "MaterialEletrico",
  "descricao": "Disjuntor termomagnético monopolar 20A",
  "estoque": 100,
  "estoqueMinimo": 20,
  "unidadeMedida": "un",
  "localizacao": "Prateleira A-1",
  "preco": 15.50,
  "fornecedorId": "uuid-do-fornecedor"
}
```

### Atualizar Material
```http
PUT /api/materiais/uuid-do-material
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "estoque": 150,
  "preco": 16.00
}
```

### Registrar Movimentação de Estoque
```http
POST /api/materiais/movimentacao
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "materialId": "uuid-do-material",
  "tipo": "ENTRADA",
  "quantidade": 50,
  "motivo": "COMPRA",
  "referencia": "uuid-da-compra",
  "observacoes": "Compra NF 123456"
}
```

**Tipos:** `ENTRADA`, `SAIDA`, `AJUSTE`  
**Motivos:** `COMPRA`, `VENDA`, `PROJETO`, `DEVOLUCAO`, `AJUSTE`

### Obter Histórico de Movimentações
```http
GET /api/materiais/movimentacoes/historico
Authorization: Bearer SEU_TOKEN

# Filtrar por material
GET /api/materiais/movimentacoes/historico?materialId=uuid-do-material
```

---

## 🛒 Compras

### Listar Compras
```http
GET /api/compras
Authorization: Bearer SEU_TOKEN

# Filtrar por status
GET /api/compras?status=Pendente
```

### Criar Compra
```http
POST /api/compras
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "fornecedorNome": "Distribuidora Elétrica XYZ",
  "fornecedorCNPJ": "12.345.678/0001-90",
  "fornecedorTel": "(48) 99999-9999",
  "numeroNF": "NF-123456",
  "dataEmissaoNF": "2025-10-15",
  "dataCompra": "2025-10-15",
  "dataRecebimento": "2025-10-16",
  "valorFrete": 150.00,
  "outrasDespesas": 50.00,
  "status": "Recebido",
  "items": [
    {
      "nomeProduto": "Cabo de cobre 10mm²",
      "ncm": "85444290",
      "quantidade": 100,
      "valorUnit": 25.50
    },
    {
      "nomeProduto": "Disjuntor 32A",
      "ncm": "85363010",
      "quantidade": 20,
      "valorUnit": 45.00
    }
  ],
  "observacoes": "Entrega rápida"
}
```

**Se status for "Recebido":** Materiais entram automaticamente no estoque!

### Parse de XML
```http
POST /api/compras/parse-xml
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><nfeProc>...</nfeProc>"
}
```

**Resposta:** Dados extraídos (fornecedor, itens, totais)

### Atualizar Status da Compra
```http
PATCH /api/compras/uuid-da-compra/status
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "status": "Recebido"
}
```

**Se mudar para "Recebido":** Atualiza estoque automaticamente!

---

## 📋 Orçamentos

### Listar Orçamentos
```http
GET /api/orcamentos
Authorization: Bearer SEU_TOKEN

# Filtros
GET /api/orcamentos?status=Aprovado
GET /api/orcamentos?clienteId=uuid-do-cliente
```

### Buscar Orçamento Completo
```http
GET /api/orcamentos/uuid-do-orcamento
Authorization: Bearer SEU_TOKEN
```

**Retorna:** Orçamento com cliente, items expandidos (materiais e kits), e projeto (se aprovado)

### Criar Orçamento
```http
POST /api/orcamentos
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "clienteId": "uuid-do-cliente",
  "titulo": "Instalação Subestação 150kVA",
  "descricao": "<h2>Projeto Completo</h2><p>Descrição com HTML do Quill</p>",
  "validade": "2025-11-15",
  "bdi": 35,
  "items": [
    {
      "tipo": "KIT",
      "kitId": "uuid-do-kit",
      "quantidade": 1,
      "custoUnit": 50000
    },
    {
      "tipo": "MATERIAL",
      "materialId": "uuid-do-material",
      "quantidade": 10,
      "custoUnit": 150
    },
    {
      "tipo": "SERVICO",
      "servicoNome": "Instalação e Comissionamento",
      "quantidade": 1,
      "custoUnit": 5000
    }
  ],
  "observacoes": "Prazo de entrega: 30 dias"
}
```

**Sistema calcula automaticamente:** custoTotal e precoVenda

### Aprovar Orçamento (Gera Projeto!)
```http
PATCH /api/orcamentos/uuid-do-orcamento/status
Authorization: Bearer SEU_TOKEN
Content-Type: application/json

{
  "status": "Aprovado"
}
```

**Ação automática:** Cria um novo Projeto vinculado!

---

## 🔄 Fluxos Completos

### Fluxo 1: Compra com XML → Estoque

1. **Importar XML** (frontend ou API)
```http
POST /api/compras/parse-xml
Authorization: Bearer TOKEN
Content-Type: application/json
{ "xml": "..." }
```

2. **Criar Compra com Dados Parseados**
```http
POST /api/compras
# Usar dados retornados do parse
```

3. **Resultado:** Materiais no estoque + Movimentação registrada

### Fluxo 2: Orçamento → Projeto → NF-e

1. **Criar Orçamento**
```http
POST /api/orcamentos
```

2. **Aprovar Orçamento**
```http
PATCH /api/orcamentos/{id}/status
{ "status": "Aprovado" }
```

3. **Backend Cria Projeto Automaticamente**

4. **Emitir NF-e** (futuro)
```http
POST /api/nfe
{
  "projetoId": "uuid-do-projeto",
  "tipo": "PRODUTO",
  "cfop": "5101",
  ...
}
```

---

## 🧪 Exemplos com cURL

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Registrar e Fazer Login
```bash
# Registrar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@s3e.com","password":"123","name":"Teste","role":"admin"}'

# Login (copie o token da resposta)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@s3e.com","password":"123"}'
```

### 3. Listar Materiais (com token)
```bash
curl http://localhost:3000/api/materiais \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Criar Material
```bash
curl -X POST http://localhost:3000/api/materiais \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Cabo Flexível 2.5mm²",
    "sku": "CB-FX-2.5",
    "tipo": "Cabos",
    "categoria": "MaterialEletrico",
    "estoque": 50,
    "estoqueMinimo": 10,
    "unidadeMedida": "rolo",
    "preco": 250.00
  }'
```

---

## 📊 Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido/ausente
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

---

## 🎓 Boas Práticas

### 1. Sempre Use HTTPS em Produção
```typescript
// Produção
const API_URL = 'https://api.s3e.com.br';
```

### 2. Trate Erros
```typescript
try {
  const response = await fetch('/api/materiais', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Erro na requisição');
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Erro:', error);
  alert('Erro ao buscar materiais');
}
```

### 3. Renove o Token Antes de Expirar
```typescript
// Verificar se token está próximo de expirar
const decoded = jwt_decode(token);
if (decoded.exp < Date.now() / 1000 + 3600) {
  // Renovar token (fazer login novamente)
}
```

---

**API S3E - Pronta para Automação!** 🚀

