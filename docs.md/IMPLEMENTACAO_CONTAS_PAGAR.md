# 💸 Implementação Completa - Contas a Pagar

## ✅ Resumo Executivo

Implementação completa do módulo de **Contas a Pagar**, incluindo criação manual, criação automática via compras, marcação de pagamento e alertas de vencimento.

---

## 🎯 Funcionalidades Implementadas

### 1. ✅ Criar Conta a Pagar (Manual)
Adicionar despesas/contas manualmente sem vínculo com compras.

### 2. ✅ Criar Contas Parceladas
Criar múltiplas contas a pagar automaticamente (ex: 3x de R$ 10.000).

### 3. ✅ Integração com Compras
Ao criar uma compra parcelada, gera contas a pagar automaticamente.

### 4. ✅ Marcar como Paga
Registrar pagamento de uma conta a pagar.

### 5. ✅ Listar e Filtrar
Buscar contas por status, fornecedor, etc.

### 6. ✅ Alertas
Contas em atraso e contas a vencer nos próximos dias.

### 7. ✅ Cancelar Conta
Cancelar conta pendente.

### 8. ✅ Atualizar Vencimento
Prorrogar ou antecipar vencimento.

---

## 🔌 Endpoints da API

### Base URL: `/api/contas-pagar`

| Método | Endpoint | Descrição | Permissões |
|--------|----------|-----------|------------|
| `POST` | `/` | Criar conta única | admin, financeiro |
| `POST` | `/parceladas` | Criar contas parceladas | admin, financeiro |
| `GET` | `/` | Listar contas (filtros) | admin, financeiro, gerente |
| `GET` | `/:id` | Buscar conta específica | admin, financeiro, gerente |
| `PUT` | `/:id/pagar` | Marcar como paga | admin, financeiro |
| `PUT` | `/:id/cancelar` | Cancelar conta | admin, financeiro |
| `PUT` | `/:id/vencimento` | Atualizar vencimento | admin, financeiro |
| `GET` | `/alertas/atrasadas` | Contas em atraso | admin, financeiro, gerente |
| `GET` | `/alertas/a-vencer` | Contas a vencer (7 dias) | admin, financeiro, gerente |

---

## 📋 Estrutura de Dados

### ContaPagar (Modelo Prisma)

```prisma
model ContaPagar {
  id             String   @id @default(uuid())
  fornecedorId   String?  // Opcional - permite despesas sem fornecedor
  compraId       String?  // Opcional - vínculo com compra
  descricao      String
  valorParcela   Float
  dataVencimento DateTime
  dataPagamento  DateTime?
  status         String   @default("Pendente")
  numeroParcela  Int?
  totalParcelas  Int?
  observacoes    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  fornecedor Fornecedor? @relation(fields: [fornecedorId], references: [id])
}
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Criar Conta a Pagar Manual

**Cenário:** Pagar aluguel do escritório (R$ 5.000)

```bash
curl -X POST http://localhost:3001/api/contas-pagar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Aluguel Escritório - Novembro/2025",
    "valorParcela": 5000.00,
    "dataVencimento": "2025-11-05",
    "observacoes": "Pagar até dia 5 para evitar multa"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Conta a pagar criada com sucesso",
  "data": {
    "id": "CP-001",
    "descricao": "Aluguel Escritório - Novembro/2025",
    "valorParcela": 5000.00,
    "dataVencimento": "2025-11-05",
    "status": "Pendente",
    "fornecedorId": null
  }
}
```

---

### Exemplo 2: Criar Contas Parceladas

**Cenário:** Despesa parcelada em 4x de R$ 2.500

```bash
curl -X POST http://localhost:3001/api/contas-pagar/parceladas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedorId": "FORN-001",
    "descricao": "Equipamentos de Segurança",
    "valorTotal": 10000.00,
    "parcelas": 4,
    "dataPrimeiroVencimento": "2025-11-15",
    "observacoes": "Parcelamento aprovado pela diretoria"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "4 contas a pagar criadas com sucesso",
  "data": [
    {
      "id": "CP-001",
      "descricao": "Equipamentos de Segurança - Parcela 1/4",
      "valorParcela": 2500.00,
      "dataVencimento": "2025-11-15",
      "numeroParcela": 1,
      "totalParcelas": 4
    },
    {
      "id": "CP-002",
      "descricao": "Equipamentos de Segurança - Parcela 2/4",
      "valorParcela": 2500.00,
      "dataVencimento": "2025-12-15",
      "numeroParcela": 2,
      "totalParcelas": 4
    },
    // ... parcelas 3 e 4
  ]
}
```

---

### Exemplo 3: Integração com Compras (Automático)

**Cenário:** Compra de materiais parcelada

```bash
curl -X POST http://localhost:3001/api/compras \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedorNome": "Distribuidora Elétrica ABC",
    "fornecedorCNPJ": "11.111.111/0001-11",
    "numeroNF": "NFe-12345",
    "dataEmissaoNF": "2025-10-20",
    "dataCompra": "2025-10-20",
    "status": "Recebido",
    "items": [
      {
        "nomeProduto": "Disjuntor 20A",
        "quantidade": 100,
        "valorUnit": 15.50
      }
    ],
    "condicoesPagamento": "Parcelado em 3x",
    "parcelas": 3
  }'
```

**O que acontece automaticamente:**
```
1. Compra criada ✅
   - Valor total: R$ 1.550,00
   
2. Estoque atualizado ✅
   - Disjuntores: +100 unidades
   
3. Contas a Pagar geradas automaticamente ✅
   - Conta 1: R$ 516,67 (venc: +30 dias)
   - Conta 2: R$ 516,67 (venc: +60 dias)
   - Conta 3: R$ 516,67 (venc: +90 dias)
```

---

### Exemplo 4: Marcar Conta como Paga

```bash
curl -X PUT http://localhost:3001/api/contas-pagar/CP-001/pagar \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "message": "Conta a pagar marcada como paga",
  "data": {
    "id": "CP-001",
    "descricao": "Aluguel Escritório - Novembro/2025",
    "valorParcela": 5000.00,
    "status": "Pago",
    "dataPagamento": "2025-10-20T15:30:00.000Z"
  }
}
```

**Impacto no relatório:**
```json
GET /api/relatorios/financeiro

{
  "mes": "Out/2025",
  "receita": 0.00,
  "despesa": 5000.00,   ← Conta paga aparece aqui!
  "lucro": -5000.00
}
```

---

### Exemplo 5: Listar Contas com Filtros

```bash
# Todas as contas pendentes
curl -X GET "http://localhost:3001/api/contas-pagar?status=Pendente" \
  -H "Authorization: Bearer TOKEN"

# Contas de um fornecedor específico
curl -X GET "http://localhost:3001/api/contas-pagar?fornecedorId=FORN-001" \
  -H "Authorization: Bearer TOKEN"

# Paginação
curl -X GET "http://localhost:3001/api/contas-pagar?page=1&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

---

### Exemplo 6: Alertas de Contas

```bash
# Contas em atraso
curl -X GET http://localhost:3001/api/contas-pagar/alertas/atrasadas \
  -H "Authorization: Bearer TOKEN"

# Contas a vencer nos próximos 7 dias
curl -X GET "http://localhost:3001/api/contas-pagar/alertas/a-vencer?dias=7" \
  -H "Authorization: Bearer TOKEN"

# Contas a vencer no próximo mês (30 dias)
curl -X GET "http://localhost:3001/api/contas-pagar/alertas/a-vencer?dias=30" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔄 Fluxos de Negócio

### Fluxo 1: Despesa Manual (Ex: Aluguel, Água, Luz)

```
1. Recebeu conta de aluguel
   ↓
2. Criar conta a pagar manual
   POST /api/contas-pagar
   {
     "descricao": "Aluguel Escritório",
     "valorParcela": 5000.00,
     "dataVencimento": "2025-11-05"
   }
   ↓
3. Conta registrada no sistema
   status: "Pendente"
   ↓
4. Data do vencimento chega
   Sistema alerta: "Conta vence hoje!"
   ↓
5. Você paga a conta
   PUT /api/contas-pagar/CP-001/pagar
   ↓
6. Conta atualizada
   status: "Pago"
   dataPagamento: "2025-11-05"
   ↓
7. Aparece no relatório
   mes: "Nov/2025"
   despesa: R$ 5.000
```

---

### Fluxo 2: Compra de Materiais Parcelada

```
1. Compra de materiais (R$ 30.000)
   ↓
2. Criar compra com parcelamento
   POST /api/compras
   {
     "fornecedorNome": "Distribuidora ABC",
     "valorTotal": 30000,
     "condicoesPagamento": "3x sem juros",
     "parcelas": 3
   }
   ↓
3. Sistema automaticamente:
   a) Cria compra ✅
   b) Atualiza estoque ✅
   c) Gera 3 contas a pagar ✅
      - R$ 10.000 (venc: +30 dias)
      - R$ 10.000 (venc: +60 dias)
      - R$ 10.000 (venc: +90 dias)
   ↓
4. Você paga cada parcela
   PUT /api/contas-pagar/CP-001/pagar (mês 1)
   PUT /api/contas-pagar/CP-002/pagar (mês 2)
   PUT /api/contas-pagar/CP-003/pagar (mês 3)
   ↓
5. Relatórios mostram despesas ao longo de 3 meses
   Nov: despesa R$ 10.000
   Dez: despesa R$ 10.000
   Jan: despesa R$ 10.000
```

---

### Fluxo 3: Compra Parcelada Direta com Fornecedor

```
1. Negociação com fornecedor
   "Parcelado em 6x, primeiro vencimento em 15/11"
   ↓
2. Criar contas parceladas
   POST /api/contas-pagar/parceladas
   {
     "fornecedorId": "FORN-001",
     "descricao": "Materiais Projeto X",
     "valorTotal": 60000,
     "parcelas": 6,
     "dataPrimeiroVencimento": "2025-11-15"
   }
   ↓
3. Sistema gera 6 contas automaticamente
   Vencimentos: 15/11, 15/12, 15/01, 15/02, 15/03, 15/04
   ↓
4. Sistema alerta 7 dias antes de cada vencimento
   ↓
5. Você paga no vencimento
```

---

## 📊 Casos de Uso Reais

### Caso 1: Despesas Fixas Mensais

```bash
# Aluguel
POST /api/contas-pagar
{
  "descricao": "Aluguel Escritório - Nov/2025",
  "valorParcela": 5000.00,
  "dataVencimento": "2025-11-05"
}

# Energia Elétrica
POST /api/contas-pagar
{
  "descricao": "Conta de Luz - Out/2025",
  "valorParcela": 850.00,
  "dataVencimento": "2025-11-10"
}

# Internet
POST /api/contas-pagar
{
  "descricao": "Internet Empresarial - Nov/2025",
  "valorParcela": 300.00,
  "dataVencimento": "2025-11-01"
}
```

---

### Caso 2: Compra Grande Parcelada

```bash
# Compra de R$ 120.000 parcelada em 12x
POST /api/contas-pagar/parceladas
{
  "fornecedorId": "FORN-005",
  "descricao": "Transformador 500kVA",
  "valorTotal": 120000.00,
  "parcelas": 12,
  "dataPrimeiroVencimento": "2025-12-01",
  "observacoes": "Negociado 12x sem juros com fornecedor"
}
```

**Resultado:**
- 12 contas de R$ 10.000 cada
- Vencimentos: 01/12, 01/01, 01/02... até 01/11/2026

---

### Caso 3: Despesa com Fornecedor Eventual

```bash
# Serviço de manutenção
POST /api/contas-pagar
{
  "fornecedorId": "FORN-020",
  "descricao": "Manutenção ar-condicionado",
  "valorParcela": 450.00,
  "dataVencimento": "2025-11-20"
}
```

---

## 🎨 Frontend Sugerido

### Componente de Contas a Pagar

```tsx
import React, { useState, useEffect } from 'react';

const ContasPagar = () => {
    const [contas, setContas] = useState([]);
    const [filtro, setFiltro] = useState('Pendente');
    const [showModal, setShowModal] = useState(false);
    
    // Carregar contas
    useEffect(() => {
        carregarContas();
    }, [filtro]);
    
    const carregarContas = async () => {
        const response = await fetch(
            `/api/contas-pagar?status=${filtro}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        const { data } = await response.json();
        setContas(data.contas);
    };
    
    const handlePagarConta = async (id: string) => {
        if (!confirm('Confirma pagamento desta conta?')) return;
        
        try {
            await fetch(`/api/contas-pagar/${id}/pagar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            alert('Conta paga com sucesso!');
            carregarContas();
        } catch (error) {
            alert('Erro ao pagar conta');
        }
    };
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Contas a Pagar</h1>
            
            {/* Filtros */}
            <div className="mb-4 flex gap-2">
                <button 
                    onClick={() => setFiltro('Pendente')}
                    className={filtro === 'Pendente' ? 'active' : ''}
                >
                    Pendentes
                </button>
                <button 
                    onClick={() => setFiltro('Pago')}
                    className={filtro === 'Pago' ? 'active' : ''}
                >
                    Pagas
                </button>
                <button 
                    onClick={() => setFiltro('')}
                    className={filtro === '' ? 'active' : ''}
                >
                    Todas
                </button>
            </div>
            
            {/* Botão Nova Conta */}
            <button 
                onClick={() => setShowModal(true)}
                className="bg-brand-blue text-white px-4 py-2 rounded-lg"
            >
                ➕ Nova Conta a Pagar
            </button>
            
            {/* Tabela de Contas */}
            <table className="w-full mt-6">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Fornecedor</th>
                        <th>Valor</th>
                        <th>Vencimento</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {contas.map(conta => (
                        <tr key={conta.id}>
                            <td>{conta.descricao}</td>
                            <td>{conta.fornecedor?.nome || '-'}</td>
                            <td>R$ {conta.valorParcela.toLocaleString('pt-BR')}</td>
                            <td>
                                {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}
                                {isAtrasada(conta) && (
                                    <span className="text-red-600 ml-2">⚠️ Atrasada</span>
                                )}
                            </td>
                            <td>
                                <span className={`badge ${getBadgeColor(conta.status)}`}>
                                    {conta.status}
                                </span>
                            </td>
                            <td>
                                {conta.status === 'Pendente' && (
                                    <button 
                                        onClick={() => handlePagarConta(conta.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        💰 Pagar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Modal de Nova Conta */}
            {showModal && (
                <ModalNovaConta 
                    onClose={() => setShowModal(false)}
                    onSuccess={carregarContas}
                />
            )}
        </div>
    );
};

const isAtrasada = (conta) => {
    const hoje = new Date();
    const vencimento = new Date(conta.dataVencimento);
    return vencimento < hoje && conta.status === 'Pendente';
};

const getBadgeColor = (status) => {
    switch (status) {
        case 'Pago': return 'bg-green-100 text-green-800';
        case 'Pendente': return 'bg-yellow-100 text-yellow-800';
        case 'Atrasado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
```

---

## 🚨 Sistema de Alertas

### 1. Contas em Atraso

```typescript
// Backend envia lista de contas vencidas
GET /api/contas-pagar/alertas/atrasadas

// Frontend exibe notificação
{
  "total": 3,
  "valorTotal": 15000.00,
  "contas": [
    {
      "descricao": "Aluguel Out/2025",
      "valorParcela": 5000.00,
      "diasAtraso": 15
    }
  ]
}

// UI: Badge vermelho no ícone de Financeiro
<FinanceiroIcon>
  <span className="badge-alert">3</span>
</FinanceiroIcon>
```

---

### 2. Contas a Vencer

```typescript
// Próximos 7 dias
GET /api/contas-pagar/alertas/a-vencer?dias=7

// Dashboard: Card de alerta
<div className="bg-yellow-50 border border-yellow-200 p-4">
    <h3>⚠️ Contas a Vencer (7 dias)</h3>
    <p className="text-2xl font-bold">R$ 12.500,00</p>
    <p className="text-sm">4 contas</p>
</div>
```

---

## 📈 Dashboard Financeiro Atualizado

### Cards de Resumo

```tsx
const DashboardFinanceiro = () => {
    const [resumo, setResumo] = useState(null);
    
    useEffect(() => {
        fetch('/api/relatorios/financeiro/resumo')
            .then(res => res.json())
            .then(data => setResumo(data.data));
    }, []);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contas a Receber */}
            <Card color="green">
                <h3>A Receber</h3>
                <p className="text-3xl font-bold">
                    R$ {resumo?.contasReceberPendentes.toLocaleString('pt-BR')}
                </p>
            </Card>
            
            {/* Contas a Pagar */}
            <Card color="red">
                <h3>A Pagar</h3>
                <p className="text-3xl font-bold">
                    R$ {resumo?.contasPagarPendentes.toLocaleString('pt-BR')}
                </p>
            </Card>
            
            {/* Saldo Previsto */}
            <Card color="blue">
                <h3>Saldo Previsto</h3>
                <p className="text-3xl font-bold">
                    R$ {(resumo?.contasReceberPendentes - resumo?.contasPagarPendentes).toLocaleString('pt-BR')}
                </p>
            </Card>
        </div>
    );
};
```

---

## 🔐 Controle de Acesso

### Matriz de Permissões

| Ação | admin | financeiro | gerente | comercial | user |
|------|-------|------------|---------|-----------|------|
| Criar conta | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver contas | ✅ | ✅ | ✅ | ❌ | ❌ |
| Pagar conta | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cancelar conta | ✅ | ✅ | ❌ | ❌ | ❌ |
| Alertas | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🎯 Benefícios da Implementação

### 1. Gestão Completa de Despesas
- ✅ Registro de todas as contas a pagar
- ✅ Histórico completo
- ✅ Rastreabilidade por fornecedor

### 2. Automação
- ✅ Compras geram contas automaticamente
- ✅ Não precisa cadastrar duas vezes
- ✅ Reduz erros manuais

### 3. Controle de Fluxo de Caixa
- ✅ Sabe exatamente quanto vai pagar
- ✅ Prevê despesas futuras
- ✅ Evita surpresas financeiras

### 4. Alertas Proativos
- ✅ Aviso de contas vencendo
- ✅ Identificação de atrasos
- ✅ Planejamento melhor

### 5. Relatórios Precisos
- ✅ Despesas reais por mês
- ✅ Comparação receita x despesa
- ✅ Análise de lucro verdadeiro

---

## 📝 Arquivos Criados

1. **backend/src/services/contasPagar.service.ts** - Lógica de negócio
2. **backend/src/controllers/contasPagarController.ts** - Controllers
3. **backend/src/routes/contasPagar.routes.ts** - Rotas

## 📝 Arquivos Modificados

1. **backend/src/controllers/comprasController.ts** - Integração automática
2. **backend/src/app.ts** - Rotas registradas

---

## 🚀 Próximos Passos

### Fase 1: Testar API
```bash
# 1. Criar conta manual
curl -X POST http://localhost:3001/api/contas-pagar \
  -H "Authorization: Bearer TOKEN" \
  -d '{"descricao":"Teste","valorParcela":1000,"dataVencimento":"2025-12-01"}'

# 2. Listar contas
curl -X GET http://localhost:3001/api/contas-pagar \
  -H "Authorization: Bearer TOKEN"

# 3. Marcar como paga
curl -X PUT http://localhost:3001/api/contas-pagar/ID/pagar \
  -H "Authorization: Bearer TOKEN"

# 4. Ver relatório atualizado
curl -X GET http://localhost:3001/api/relatorios/dashboard \
  -H "Authorization: Bearer TOKEN"
```

### Fase 2: Criar Frontend
- [ ] Componente ContasPagar.tsx
- [ ] Formulário de nova conta
- [ ] Tabela de listagem
- [ ] Botão de pagar conta
- [ ] Alertas visuais

### Fase 3: Automações
- [ ] Criar contas recorrentes (aluguel mensal)
- [ ] Enviar emails de lembrete
- [ ] Integração bancária (OFX)
- [ ] Conciliação automática

---

## 📊 Estatísticas da Implementação

| Métrica | Valor |
|---------|-------|
| Endpoints criados | 9 |
| Serviços | 8 funções |
| Controllers | 8 métodos |
| Rotas protegidas | 9 |
| Linhas de código | ~400 |

---

## ✅ Checklist de Implementação

### Backend
- [x] Serviço de contas a pagar
- [x] Controller completo
- [x] Rotas protegidas
- [x] Integração com compras
- [x] Validações
- [x] Tratamento de erros
- [x] Autorização por perfil

### Funcionalidades
- [x] Criar conta manual
- [x] Criar contas parceladas
- [x] Integração automática com compras
- [x] Marcar como paga
- [x] Listar com filtros
- [x] Buscar conta específica
- [x] Cancelar conta
- [x] Atualizar vencimento
- [x] Alertas de atraso
- [x] Alertas de vencimento

---

**Implementação concluída em 20/10/2025** 💸  
**Sistema S3E Engenharia Elétrica** ⚡

