# Gestão Operacional - Alocação de Equipes a Obras/Projetos

## 📋 Visão Geral

Este módulo implementa a gestão completa de equipes e suas alocações em projetos/obras, permitindo:

- ✅ Criação e gerenciamento de **3 equipes fixas** (2 membros/equipe)
- ✅ Alocação de equipes a projetos com **controle de conflitos**
- ✅ Cálculo automático de datas considerando **20 dias úteis/mês**
- ✅ Visualização de calendário de alocações
- ✅ Consulta de equipes disponíveis por período
- ✅ Estatísticas e relatórios de alocação

---

## 🗄️ Modelos de Dados

### 1. Modelo `Equipe`

```prisma
enum TipoEquipe {
  MONTAGEM
  CAMPO
  DISTINTA
}

model Equipe {
  id        String      @id @default(uuid())
  nome      String      @unique // Ex: Equipe A, Equipe B, Equipe C
  tipo      TipoEquipe
  membros   String[]    // Array de IDs de usuários
  ativa     Boolean     @default(true)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  alocacoes AlocacaoObra[]

  @@map("equipes")
}
```

**Campos:**
- `id`: Identificador único
- `nome`: Nome da equipe (único)
- `tipo`: Tipo da equipe (MONTAGEM, CAMPO, DISTINTA)
- `membros`: Array com IDs dos usuários membros
- `ativa`: Indica se a equipe está ativa (soft delete)
- `alocacoes`: Relação com alocações da equipe

### 2. Modelo `AlocacaoObra`

```prisma
model AlocacaoObra {
  id               String    @id @default(uuid())
  equipeId         String
  projetoId        String    // Relacionado com Projeto (Obra)
  dataInicio       DateTime
  dataFimPrevisto  DateTime
  dataFimReal      DateTime?
  status           String    @default("Planejada") // Planejada, EmAndamento, Concluida, Cancelada
  observacoes      String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  equipe  Equipe  @relation(fields: [equipeId], references: [id], onDelete: Cascade)
  projeto Projeto @relation(fields: [projetoId], references: [id], onDelete: Cascade)

  @@map("alocacoes_obra")
}
```

**Campos:**
- `id`: Identificador único
- `equipeId`: ID da equipe alocada
- `projetoId`: ID do projeto/obra
- `dataInicio`: Data de início da alocação
- `dataFimPrevisto`: Data fim calculada (dias úteis)
- `dataFimReal`: Data real de conclusão (opcional)
- `status`: Status da alocação (Planejada, EmAndamento, Concluida, Cancelada)
- `observacoes`: Observações adicionais

---

## 🔄 Aplicar Migrações

Após adicionar os modelos ao `schema.prisma`, execute:

```bash
# Gerar migration
npx prisma migrate dev --name add_equipes_alocacoes

# Ou aplicar em produção
npx prisma migrate deploy
```

---

## 🛠️ API Endpoints

### **BASE URL:** `/api/obras`

Todas as rotas requerem autenticação JWT.  
Rotas de criação/atualização/exclusão requerem permissão de **admin**.

---

## 📦 Gestão de Equipes

### 1. **Criar Equipe**
```http
POST /api/obras/equipes
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "Equipe A",
  "tipo": "MONTAGEM",
  "membros": [
    "user-id-1",
    "user-id-2"
  ]
}
```

**Tipos válidos:** `MONTAGEM`, `CAMPO`, `DISTINTA`

**Resposta (201):**
```json
{
  "success": true,
  "message": "Equipe criada com sucesso",
  "data": {
    "id": "equipe-id",
    "nome": "Equipe A",
    "tipo": "MONTAGEM",
    "membros": ["user-id-1", "user-id-2"],
    "ativa": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### 2. **Listar Equipes**
```http
GET /api/obras/equipes?todas=false
Authorization: Bearer {token}
```

**Query Params:**
- `todas` (opcional): `true` para incluir equipes inativas

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "equipe-id",
      "nome": "Equipe A",
      "tipo": "MONTAGEM",
      "membros": ["user-id-1", "user-id-2"],
      "ativa": true
    }
  ]
}
```

---

### 3. **Buscar Equipe por ID**
```http
GET /api/obras/equipes/{id}
Authorization: Bearer {token}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "equipe-id",
    "nome": "Equipe A",
    "tipo": "MONTAGEM",
    "membros": ["user-id-1", "user-id-2"],
    "ativa": true,
    "alocacoes": [
      {
        "id": "alocacao-id",
        "dataInicio": "2025-01-20T00:00:00Z",
        "dataFimPrevisto": "2025-02-15T00:00:00Z",
        "status": "EmAndamento",
        "projeto": {
          "id": "projeto-id",
          "titulo": "Instalação Subestação ABC"
        }
      }
    ]
  }
}
```

---

### 4. **Atualizar Equipe**
```http
PUT /api/obras/equipes/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (todos os campos são opcionais):**
```json
{
  "nome": "Equipe A - Atualizada",
  "tipo": "CAMPO",
  "membros": ["user-id-1", "user-id-3"]
}
```

---

### 5. **Desativar Equipe**
```http
DELETE /api/obras/equipes/{id}
Authorization: Bearer {token}
```

**Observação:** Não é possível desativar equipes com alocações ativas.

---

### 6. **Buscar Equipes Disponíveis**
```http
GET /api/obras/equipes/disponiveis?dataInicio=2025-02-01&dataFim=2025-02-28
Authorization: Bearer {token}
```

**Query Params:**
- `dataInicio` (obrigatório): Data de início no formato ISO
- `dataFim` (obrigatório): Data de fim no formato ISO

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "equipe-id",
      "nome": "Equipe B",
      "tipo": "MONTAGEM",
      "membros": ["user-id-3", "user-id-4"],
      "ativa": true
    }
  ]
}
```

---

## 🗓️ Gestão de Alocações

### 7. **Alocar Equipe a Projeto**
```http
POST /api/obras/alocar
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "equipeId": "equipe-id",
  "projetoId": "projeto-id",
  "dataInicio": "2025-02-01T00:00:00Z",
  "duracaoDias": 20,
  "observacoes": "Instalação de quadros elétricos"
}
```

**Campos:**
- `equipeId`: ID da equipe
- `projetoId`: ID do projeto/obra
- `dataInicio`: Data de início
- `duracaoDias`: Duração em **dias úteis** (ex: 20 = 1 mês)
- `observacoes` (opcional): Observações

**Lógica de Cálculo:**
- O sistema calcula automaticamente a `dataFimPrevisto` somando `duracaoDias` úteis
- Exclui finais de semana (sábados e domingos)
- **Verificação de conflito:** Não permite alocar a mesma equipe em períodos sobrepostos

**Resposta (201):**
```json
{
  "success": true,
  "message": "Equipe alocada com sucesso",
  "data": {
    "id": "alocacao-id",
    "equipeId": "equipe-id",
    "projetoId": "projeto-id",
    "dataInicio": "2025-02-01T00:00:00Z",
    "dataFimPrevisto": "2025-03-03T00:00:00Z",
    "status": "Planejada",
    "equipe": {
      "id": "equipe-id",
      "nome": "Equipe A",
      "tipo": "MONTAGEM"
    },
    "projeto": {
      "id": "projeto-id",
      "titulo": "Instalação Subestação ABC",
      "cliente": {
        "nome": "Cliente XYZ"
      }
    }
  }
}
```

**Erro de Conflito (409):**
```json
{
  "error": "Erro ao alocar equipe",
  "message": "Conflito detectado! A equipe já está alocada no período de 01/02/2025 a 28/02/2025"
}
```

---

### 8. **Listar Alocações**
```http
GET /api/obras/alocacoes?equipeId=xxx&projetoId=xxx&status=EmAndamento
Authorization: Bearer {token}
```

**Query Params (todos opcionais):**
- `equipeId`: Filtrar por equipe
- `projetoId`: Filtrar por projeto
- `status`: Filtrar por status (Planejada, EmAndamento, Concluida, Cancelada)
- `dataInicio`: Filtrar por data de início
- `dataFim`: Filtrar por data de fim

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "alocacao-id",
      "dataInicio": "2025-02-01T00:00:00Z",
      "dataFimPrevisto": "2025-03-03T00:00:00Z",
      "dataFimReal": null,
      "status": "EmAndamento",
      "equipe": {
        "id": "equipe-id",
        "nome": "Equipe A",
        "tipo": "MONTAGEM"
      },
      "projeto": {
        "id": "projeto-id",
        "titulo": "Instalação Subestação ABC",
        "cliente": {
          "nome": "Cliente XYZ"
        }
      }
    }
  ]
}
```

---

### 9. **Buscar Alocações para Calendário**
```http
GET /api/obras/alocacoes/calendario?mes=2&ano=2025
Authorization: Bearer {token}
```

**Query Params:**
- `mes` (obrigatório): Mês (1-12)
- `ano` (obrigatório): Ano (YYYY)

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "alocacao-id",
      "equipe": {
        "id": "equipe-id",
        "nome": "Equipe A",
        "tipo": "MONTAGEM"
      },
      "projeto": {
        "id": "projeto-id",
        "titulo": "Instalação Subestação ABC",
        "cliente": "Cliente XYZ"
      },
      "dataInicio": "2025-02-01T00:00:00Z",
      "dataFimPrevisto": "2025-03-03T00:00:00Z",
      "dataFimReal": null,
      "status": "EmAndamento",
      "observacoes": "Instalação de quadros elétricos"
    }
  ]
}
```

---

### 10. **Buscar Alocação por ID**
```http
GET /api/obras/alocacoes/{id}
Authorization: Bearer {token}
```

---

### 11. **Atualizar Alocação**
```http
PUT /api/obras/alocacoes/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (todos os campos são opcionais):**
```json
{
  "status": "Concluida",
  "dataFimReal": "2025-03-01T00:00:00Z",
  "observacoes": "Obra concluída antes do prazo"
}
```

---

### 12. **Iniciar Alocação**
```http
PUT /api/obras/alocacoes/{id}/iniciar
Authorization: Bearer {token}
```

Muda o status de `Planejada` para `EmAndamento`.

---

### 13. **Concluir Alocação**
```http
PUT /api/obras/alocacoes/{id}/concluir
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (opcional):**
```json
{
  "dataFimReal": "2025-03-01T00:00:00Z"
}
```

Se `dataFimReal` não for fornecida, usa a data atual.

---

### 14. **Cancelar Alocação**
```http
PUT /api/obras/alocacoes/{id}/cancelar
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (opcional):**
```json
{
  "motivo": "Cliente adiou o projeto"
}
```

---

### 15. **Estatísticas**
```http
GET /api/obras/estatisticas
Authorization: Bearer {token}
```

**Resposta (200):**
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

---

## 📊 Fluxo de Trabalho Típico

### 1. **Configuração Inicial**

```bash
# 1. Criar 3 equipes fixas
POST /api/obras/equipes
{
  "nome": "Equipe A",
  "tipo": "MONTAGEM",
  "membros": ["user-id-1", "user-id-2"]
}

POST /api/obras/equipes
{
  "nome": "Equipe B",
  "tipo": "CAMPO",
  "membros": ["user-id-3", "user-id-4"]
}

POST /api/obras/equipes
{
  "nome": "Equipe C",
  "tipo": "DISTINTA",
  "membros": ["user-id-5", "user-id-6"]
}
```

### 2. **Planejamento de Alocação**

```bash
# 2.1. Verificar equipes disponíveis no período
GET /api/obras/equipes/disponiveis?dataInicio=2025-02-01&dataFim=2025-02-28

# 2.2. Alocar equipe disponível
POST /api/obras/alocar
{
  "equipeId": "equipe-a-id",
  "projetoId": "projeto-id",
  "dataInicio": "2025-02-01",
  "duracaoDias": 20
}
```

### 3. **Execução**

```bash
# 3.1. Iniciar trabalho
PUT /api/obras/alocacoes/{id}/iniciar

# 3.2. Acompanhar no calendário
GET /api/obras/alocacoes/calendario?mes=2&ano=2025
```

### 4. **Conclusão**

```bash
# 4.1. Concluir alocação
PUT /api/obras/alocacoes/{id}/concluir
{
  "dataFimReal": "2025-02-25"
}
```

---

## 🔐 Permissões

| Ação | Autenticação | Permissão |
|------|-------------|-----------|
| Listar equipes | ✅ | Qualquer usuário autenticado |
| Buscar equipes disponíveis | ✅ | Qualquer usuário autenticado |
| Listar alocações | ✅ | Qualquer usuário autenticado |
| Ver calendário | ✅ | Qualquer usuário autenticado |
| Ver estatísticas | ✅ | Qualquer usuário autenticado |
| Criar equipe | ✅ | **Admin** |
| Atualizar equipe | ✅ | **Admin** |
| Desativar equipe | ✅ | **Admin** |
| Alocar equipe | ✅ | **Admin** |
| Atualizar alocação | ✅ | **Admin** |
| Iniciar/Concluir/Cancelar | ✅ | **Admin** |

---

## 🧮 Lógica de Cálculo de Dias Úteis

O sistema usa uma lógica simplificada que:

1. **Exclui finais de semana** (sábado e domingo)
2. **Considera 20 dias úteis ≈ 1 mês**

**Exemplo:**
- Data início: 01/02/2025 (sábado)
- Duração: 20 dias úteis
- Data fim prevista: ~03/03/2025

```typescript
// Algoritmo simplificado
calcularDataFimPrevista(dataInicio, duracaoDias) {
  let dataFim = new Date(dataInicio);
  let diasAdicionados = 0;

  while (diasAdicionados < duracaoDias) {
    dataFim.setDate(dataFim.getDate() + 1);
    const diaSemana = dataFim.getDay();
    
    // Pular finais de semana (0=Dom, 6=Sáb)
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasAdicionados++;
    }
  }

  return dataFim;
}
```

**Nota:** Para uma versão mais robusta, considere integrar com um calendário de feriados nacionais.

---

## 🚀 Melhorias Futuras

### 1. **Feriados**
- Integrar com API de feriados nacionais/municipais
- Permitir cadastro de feriados customizados

### 2. **Notificações**
- Alertar equipes sobre início de alocação
- Notificar atrasos

### 3. **Horas Trabalhadas**
- Registrar horas trabalhadas por dia
- Relatórios de produtividade

### 4. **Custo de Equipe**
- Calcular custo de mão de obra por alocação
- Integrar com módulo financeiro

### 5. **Dashboard Visual**
- Gráfico de Gantt
- Calendário interativo
- Mapa de calor de ocupação

---

## 🧪 Testes de API

### Exemplo com cURL

```bash
# 1. Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@s3e.com",
    "password": "senha123"
  }'
# Salvar o token retornado

# 2. Criar equipe
curl -X POST http://localhost:3000/api/obras/equipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Equipe A",
    "tipo": "MONTAGEM",
    "membros": ["user-id-1", "user-id-2"]
  }'

# 3. Listar equipes
curl -X GET http://localhost:3000/api/obras/equipes \
  -H "Authorization: Bearer SEU_TOKEN"

# 4. Alocar equipe
curl -X POST http://localhost:3000/api/obras/alocar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "equipeId": "EQUIPE_ID",
    "projetoId": "PROJETO_ID",
    "dataInicio": "2025-02-01T00:00:00Z",
    "duracaoDias": 20,
    "observacoes": "Instalação inicial"
  }'

# 5. Ver calendário
curl -X GET "http://localhost:3000/api/obras/alocacoes/calendario?mes=2&ano=2025" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📁 Estrutura de Arquivos

```
backend/
├── prisma/
│   └── schema.prisma              # ✅ Modelos Equipe e AlocacaoObra
├── src/
│   ├── services/
│   │   └── alocacao.service.ts    # ✅ Lógica de negócio
│   ├── controllers/
│   │   └── alocacaoController.ts  # ✅ Controllers
│   ├── routes/
│   │   └── alocacao.routes.ts     # ✅ Rotas da API
│   └── app.ts                     # ✅ Registro das rotas
└── ...
```

---

## ✅ Checklist de Implementação

- [x] Modelos Prisma criados (`Equipe`, `AlocacaoObra`)
- [x] Enum `TipoEquipe` criado
- [x] Relação com modelo `Projeto` adicionada
- [x] Serviço completo implementado (`alocacao.service.ts`)
- [x] Controller criado (`alocacaoController.ts`)
- [x] Rotas configuradas (`alocacao.routes.ts`)
- [x] Rotas registradas no `app.ts`
- [x] Autenticação e autorização implementadas
- [x] Lógica de cálculo de dias úteis
- [x] Verificação de conflitos de alocação
- [x] Endpoints de calendário e estatísticas
- [x] Documentação completa

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se as migrations foram aplicadas
2. Confirme que o usuário tem permissão de admin
3. Valide os dados enviados conforme os exemplos
4. Consulte os logs do servidor para erros detalhados

---

**Implementado em:** 22 de outubro de 2025  
**Versão:** 1.0.0  
**Autor:** S3E System Team

