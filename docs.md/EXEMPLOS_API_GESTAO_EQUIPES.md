# 🧪 Exemplos Práticos - API de Gestão de Equipes

## 📝 Configuração Inicial

### Variáveis de Ambiente
```
BASE_URL=http://localhost:3000
TOKEN=seu_token_jwt_aqui
```

---

## 🔐 1. Autenticação

### Login (Admin)
```http
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@s3e.com",
  "password": "senha123"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "admin@s3e.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

💡 **Copie o token e use nas próximas requisições!**

---

## 👥 2. Gestão de Equipes

### 2.1. Criar Equipe A (MONTAGEM)
```http
POST {{BASE_URL}}/api/obras/equipes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome": "Equipe A",
  "tipo": "MONTAGEM",
  "membros": [
    "user-id-1",
    "user-id-2"
  ]
}
```

### 2.2. Criar Equipe B (CAMPO)
```http
POST {{BASE_URL}}/api/obras/equipes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome": "Equipe B",
  "tipo": "CAMPO",
  "membros": [
    "user-id-3",
    "user-id-4"
  ]
}
```

### 2.3. Criar Equipe C (DISTINTA)
```http
POST {{BASE_URL}}/api/obras/equipes
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome": "Equipe C",
  "tipo": "DISTINTA",
  "membros": [
    "user-id-5",
    "user-id-6"
  ]
}
```

### 2.4. Listar Todas as Equipes
```http
GET {{BASE_URL}}/api/obras/equipes
Authorization: Bearer {{TOKEN}}
```

### 2.5. Buscar Equipe Específica
```http
GET {{BASE_URL}}/api/obras/equipes/{{EQUIPE_ID}}
Authorization: Bearer {{TOKEN}}
```

### 2.6. Atualizar Equipe
```http
PUT {{BASE_URL}}/api/obras/equipes/{{EQUIPE_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "nome": "Equipe A - Especializada",
  "membros": [
    "user-id-1",
    "user-id-7"
  ]
}
```

### 2.7. Desativar Equipe
```http
DELETE {{BASE_URL}}/api/obras/equipes/{{EQUIPE_ID}}
Authorization: Bearer {{TOKEN}}
```

---

## 🗓️ 3. Gestão de Alocações

### 3.1. Alocar Equipe A (Projeto de 1 mês)
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "equipe-a-id",
  "projetoId": "projeto-id-1",
  "dataInicio": "2025-03-01T00:00:00Z",
  "duracaoDias": 20,
  "observacoes": "Instalação de quadro de medição em shopping center"
}
```

### 3.2. Alocar Equipe B (Projeto de 2 semanas)
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "equipe-b-id",
  "projetoId": "projeto-id-2",
  "dataInicio": "2025-03-10T00:00:00Z",
  "duracaoDias": 10,
  "observacoes": "Instalação de subestação 500kVA"
}
```

### 3.3. Alocar Equipe C (Projeto de 1.5 meses)
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "equipe-c-id",
  "projetoId": "projeto-id-3",
  "dataInicio": "2025-04-01T00:00:00Z",
  "duracaoDias": 30,
  "observacoes": "Cabeamento de edifício comercial - 15 andares"
}
```

### 3.4. Tentativa de Conflito (deve falhar)
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "equipe-a-id",
  "projetoId": "projeto-id-4",
  "dataInicio": "2025-03-15T00:00:00Z",
  "duracaoDias": 10,
  "observacoes": "Este deve falhar - equipe A já está alocada"
}
```

**Resposta esperada (409 Conflict):**
```json
{
  "error": "Erro ao alocar equipe",
  "message": "Conflito detectado! A equipe já está alocada no período de 01/03/2025 a 28/03/2025"
}
```

---

## 📋 4. Consultas e Filtros

### 4.1. Listar Todas as Alocações
```http
GET {{BASE_URL}}/api/obras/alocacoes
Authorization: Bearer {{TOKEN}}
```

### 4.2. Filtrar por Equipe
```http
GET {{BASE_URL}}/api/obras/alocacoes?equipeId={{EQUIPE_ID}}
Authorization: Bearer {{TOKEN}}
```

### 4.3. Filtrar por Projeto
```http
GET {{BASE_URL}}/api/obras/alocacoes?projetoId={{PROJETO_ID}}
Authorization: Bearer {{TOKEN}}
```

### 4.4. Filtrar por Status
```http
GET {{BASE_URL}}/api/obras/alocacoes?status=EmAndamento
Authorization: Bearer {{TOKEN}}
```

### 4.5. Filtrar por Período
```http
GET {{BASE_URL}}/api/obras/alocacoes?dataInicio=2025-03-01&dataFim=2025-03-31
Authorization: Bearer {{TOKEN}}
```

### 4.6. Filtros Combinados
```http
GET {{BASE_URL}}/api/obras/alocacoes?equipeId={{EQUIPE_ID}}&status=Planejada
Authorization: Bearer {{TOKEN}}
```

---

## 📅 5. Calendário

### 5.1. Visualizar Março/2025
```http
GET {{BASE_URL}}/api/obras/alocacoes/calendario?mes=3&ano=2025
Authorization: Bearer {{TOKEN}}
```

### 5.2. Visualizar Abril/2025
```http
GET {{BASE_URL}}/api/obras/alocacoes/calendario?mes=4&ano=2025
Authorization: Bearer {{TOKEN}}
```

### 5.3. Visualizar Mês Atual
```javascript
// Use JavaScript Date para calcular:
const hoje = new Date();
const mes = hoje.getMonth() + 1; // 1-12
const ano = hoje.getFullYear();
// Depois: GET /api/obras/alocacoes/calendario?mes={mes}&ano={ano}
```

---

## 🔍 6. Disponibilidade

### 6.1. Verificar Disponibilidade para Março
```http
GET {{BASE_URL}}/api/obras/equipes/disponiveis?dataInicio=2025-03-01&dataFim=2025-03-31
Authorization: Bearer {{TOKEN}}
```

### 6.2. Disponibilidade para Período Específico
```http
GET {{BASE_URL}}/api/obras/equipes/disponiveis?dataInicio=2025-04-15&dataFim=2025-05-15
Authorization: Bearer {{TOKEN}}
```

### 6.3. Disponibilidade Imediata (próximos 7 dias)
```http
GET {{BASE_URL}}/api/obras/equipes/disponiveis?dataInicio=2025-03-01&dataFim=2025-03-07
Authorization: Bearer {{TOKEN}}
```

---

## ⏯️ 7. Controle de Alocações

### 7.1. Iniciar Alocação
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ID}}/iniciar
Authorization: Bearer {{TOKEN}}
```

**Status muda:** `Planejada` → `EmAndamento`

### 7.2. Concluir Alocação (no prazo)
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ID}}/concluir
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "dataFimReal": "2025-03-28T00:00:00Z"
}
```

### 7.3. Concluir Alocação Antecipadamente
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ID}}/concluir
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "dataFimReal": "2025-03-20T00:00:00Z"
}
```

### 7.4. Concluir Alocação (sem especificar data)
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ID}}/concluir
Authorization: Bearer {{TOKEN}}
```
💡 Usa a data atual automaticamente

### 7.5. Cancelar Alocação
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ID}}/cancelar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "motivo": "Cliente adiou projeto por 60 dias"
}
```

### 7.6. Atualizar Alocação Manualmente
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ID}}
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "status": "EmAndamento",
  "observacoes": "Atualização: 70% concluído"
}
```

---

## 📊 8. Estatísticas e Relatórios

### 8.1. Dashboard de Estatísticas
```http
GET {{BASE_URL}}/api/obras/estatisticas
Authorization: Bearer {{TOKEN}}
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "totalEquipes": 3,
    "equipesOcupadas": 2,
    "equipesDisponiveis": 1,
    "alocacoesAtivas": 2,
    "alocacoesConcluidas": 15
  }
}
```

### 8.2. Buscar Detalhes de Alocação Específica
```http
GET {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ID}}
Authorization: Bearer {{TOKEN}}
```

---

## 🎯 9. Cenários Completos

### Cenário A: Novo Projeto Urgente

#### Passo 1: Verificar disponibilidade imediata
```http
GET {{BASE_URL}}/api/obras/equipes/disponiveis?dataInicio=2025-03-05&dataFim=2025-03-15
Authorization: Bearer {{TOKEN}}
```

#### Passo 2: Alocar equipe disponível
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "EQUIPE_DISPONIVEL_ID",
  "projetoId": "projeto-urgente-id",
  "dataInicio": "2025-03-05T00:00:00Z",
  "duracaoDias": 10,
  "observacoes": "URGENTE - Cliente VIP"
}
```

#### Passo 3: Iniciar imediatamente
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{NOVA_ALOCACAO_ID}}/iniciar
Authorization: Bearer {{TOKEN}}
```

---

### Cenário B: Planejamento Mensal

#### Passo 1: Ver alocações do mês atual
```http
GET {{BASE_URL}}/api/obras/alocacoes/calendario?mes=3&ano=2025
Authorization: Bearer {{TOKEN}}
```

#### Passo 2: Ver quem estará disponível próximo mês
```http
GET {{BASE_URL}}/api/obras/equipes/disponiveis?dataInicio=2025-04-01&dataFim=2025-04-30
Authorization: Bearer {{TOKEN}}
```

#### Passo 3: Planejar alocações do próximo mês
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "equipe-id",
  "projetoId": "projeto-abril-id",
  "dataInicio": "2025-04-01T00:00:00Z",
  "duracaoDias": 20
}
```

---

### Cenário C: Remanejamento de Equipe

#### Passo 1: Cancelar alocação atual
```http
PUT {{BASE_URL}}/api/obras/alocacoes/{{ALOCACAO_ATUAL_ID}}/cancelar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "motivo": "Remanejamento para projeto prioritário"
}
```

#### Passo 2: Criar nova alocação
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "mesma-equipe-id",
  "projetoId": "novo-projeto-prioritario-id",
  "dataInicio": "2025-03-10T00:00:00Z",
  "duracaoDias": 15
}
```

---

## 🐛 10. Testes de Erro

### 10.1. Equipe Inexistente
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "id-invalido-123",
  "projetoId": "projeto-id",
  "dataInicio": "2025-03-01T00:00:00Z",
  "duracaoDias": 10
}
```

**Resposta esperada (500):**
```json
{
  "error": "Erro ao alocar equipe",
  "message": "Equipe não encontrada"
}
```

### 10.2. Projeto Inexistente
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "equipe-a-id",
  "projetoId": "projeto-invalido-123",
  "dataInicio": "2025-03-01T00:00:00Z",
  "duracaoDias": 10
}
```

### 10.3. Dados Incompletos
```http
POST {{BASE_URL}}/api/obras/alocar
Authorization: Bearer {{TOKEN}}
Content-Type: application/json

{
  "equipeId": "equipe-a-id",
  "dataInicio": "2025-03-01T00:00:00Z"
}
```

**Resposta esperada (400):**
```json
{
  "error": "Dados obrigatórios ausentes: equipeId, projetoId, dataInicio, duracaoDias"
}
```

### 10.4. Sem Autenticação
```http
GET {{BASE_URL}}/api/obras/equipes
```

**Resposta esperada (401):**
```json
{
  "error": "Token não fornecido"
}
```

### 10.5. Usuário Não Admin (tentando criar equipe)
```http
POST {{BASE_URL}}/api/obras/equipes
Authorization: Bearer {{TOKEN_USER_COMUM}}
Content-Type: application/json

{
  "nome": "Equipe D",
  "tipo": "MONTAGEM",
  "membros": ["user-id-1"]
}
```

**Resposta esperada (403):**
```json
{
  "error": "Acesso negado"
}
```

---

## 📦 Importar no Postman/Thunder Client

### Arquivo JSON (Postman Collection)

Salve este conteúdo em `gestao-equipes-collection.json`:

```json
{
  "info": {
    "name": "Gestão de Equipes - S3E System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "TOKEN",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Autenticação",
      "item": [
        {
          "name": "Login Admin",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@s3e.com\",\"password\":\"senha123\"}"
            },
            "url": "{{BASE_URL}}/api/auth/login"
          }
        }
      ]
    }
  ]
}
```

Depois importe no Postman: **Import → Upload File → Selecione o JSON**

---

## 💡 Dicas para Testes

1. **Sempre faça login primeiro** e salve o token
2. **Use variáveis** para IDs de equipes/projetos/alocações
3. **Teste os cenários de erro** para validar as validações
4. **Verifique o calendário** após cada alocação
5. **Teste conflitos** alocando a mesma equipe em períodos sobrepostos

---

## 🔗 Links Úteis

- **Documentação Completa:** `GESTAO_OPERACIONAL_EQUIPES.md`
- **Guia Rápido:** `GUIA_RAPIDO_GESTAO_EQUIPES.md`
- **Servidor Local:** `http://localhost:3000`
- **API Info:** `http://localhost:3000/api`

---

**Última atualização:** 22 de outubro de 2025  
**Versão:** 1.0.0

