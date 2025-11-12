# 🔄 Atualização: Vendas Baseadas em Orçamentos Aprovados

## ✅ Mudança Implementada

O módulo de vendas foi atualizado para funcionar **exclusivamente com orçamentos aprovados**, seguindo o fluxo correto de negócio do sistema S3E.

---

## 🎯 Motivação

**Antes:** O formulário de venda pedia para preencher cliente, projeto e valor manualmente.

**Problema:** Isso duplicava informações que já existem nos orçamentos aprovados e não garantia a rastreabilidade da venda.

**Agora:** A venda é realizada selecionando um orçamento aprovado, que já contém todas as informações necessárias (cliente, projeto, valor, condições de pagamento, etc.).

---

## 📋 Fluxo de Venda Atualizado

```
1. Cliente solicita orçamento
   ↓
2. S3E cria orçamento com todos os detalhes
   ↓
3. Cliente aprova orçamento (Status: Aprovado)
   ↓
4. S3E realiza venda baseada no orçamento aprovado
   ↓
5. Sistema gera contas a receber automaticamente
   ↓
6. Projeto é criado (se aplicável)
```

---

## 🔧 Alterações Técnicas

### Frontend (`frontend/src/components/Vendas.tsx`)

#### Formulário Simplificado
```typescript
interface VendaForm {
    orcamentoId: string;        // NOVO: Orçamento aprovado
    formaPagamento: string;
    parcelas: number;
    valorEntrada: number;
    observacoes?: string;
}

// REMOVIDOS:
// - clienteId (vem do orçamento)
// - projetoId (vem do orçamento)
// - valorTotal (vem do orçamento)
```

#### Filtro de Orçamentos
```typescript
// Apenas orçamentos aprovados podem ser selecionados
const orcamentosAprovados = useMemo(() => {
    return budgetsData.filter(orc => orc.status === BudgetStatus.Aprovado);
}, []);
```

#### Informações Automáticas
Quando um orçamento é selecionado, o formulário exibe automaticamente:
- ✅ **Cliente**: Nome, CPF/CNPJ, Telefone
- ✅ **Projeto**: Nome, Tipo
- ✅ **Valor**: Valor total do orçamento
- ✅ **Condições**: Condições de pagamento definidas no orçamento

#### Validações
```typescript
// Não permite realizar venda sem orçamento aprovado
if (!orcamentoSelecionado) {
    alert('Por favor, selecione um orçamento aprovado.');
    return;
}
```

---

### Backend (`backend/src/services/vendas.service.ts`)

#### Interface Atualizada
```typescript
export interface VendaPayload {
    orcamentoId: string;  // NOVO: Obrigatório
    clienteId: string;
    projetoId?: string;
    valorTotal: number;
    formaPagamento: string;
    parcelas?: number;
    valorEntrada?: number;
    observacoes?: string;
    // REMOVIDO: itens[] (vem do orçamento)
}
```

#### Validação no Controller
```typescript
// Validar dados obrigatórios
if (!vendaData.orcamentoId || !vendaData.clienteId || !vendaData.valorTotal) {
    return res.status(400).json({
        error: 'Dados obrigatórios ausentes: orcamentoId, clienteId, valorTotal'
    });
}
```

---

## 🎨 Interface do Usuário

### Seletor de Orçamento
```
┌─────────────────────────────────────────────────────────────┐
│ Orçamento Aprovado *                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Selecione um orçamento aprovado...                      │ │
│ │ ORC-2025-001 - Construtora Alfa - Edifício... - R$ ...│ │
│ │ ORC-2025-003 - Indústria Gama - Automação... - R$ ... │ │
│ │ ORC-2025-005 - Mariana Costa - Painéis... - R$ ...    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Card de Informações (quando orçamento é selecionado)
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Dados do Orçamento                                        │
├─────────────────────────────────────────────────────────────┤
│ Cliente:                  │ Projeto:                         │
│ Construtora Alfa          │ Edifício Residencial Sol         │
│ 11.111.111/0001-11        │ CompletoComObra                  │
│ (11) 98765-4321           │                                  │
├───────────────────────────┼──────────────────────────────────┤
│ Valor do Orçamento:       │ Condições de Pagamento:          │
│ R$ 75.000,00              │ 50% adiantado, 50% na entrega    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Dados Mockados

### Orçamentos Aprovados Disponíveis
```javascript
budgetsData = [
    {
        id: 'ORC-2025-001',
        clientId: 'CLI-001',
        clientName: 'Construtora Alfa',
        projectName: 'Edifício Residencial Sol',
        projectType: 'CompletoComObra',
        total: 75000.00,
        paymentTerms: '50% adiantado, 50% na entrega',
        status: BudgetStatus.Aprovado  // ✅
    },
    {
        id: 'ORC-2025-003',
        clientId: 'CLI-003',
        clientName: 'Indústria Gama',
        projectName: 'Automação Linha de Produção',
        projectType: 'Montagem',
        total: 120300.00,
        paymentTerms: '45 dias',
        status: BudgetStatus.Aprovado  // ✅
    },
    {
        id: 'ORC-2025-005',
        clientId: 'CLI-002',
        clientName: 'Mariana Costa',
        projectName: 'Instalação de Painéis Solares',
        projectType: 'CompletoComObra',
        total: 95000.00,
        paymentTerms: '6x sem juros',
        status: BudgetStatus.Aprovado  // ✅
    }
];
```

---

## 🔄 Exemplo de Uso

### 1. Usuário acessa "Nova Venda"
- Seleciona um orçamento aprovado da lista dropdown

### 2. Sistema exibe informações do orçamento
```
Cliente: Construtora Alfa (11.111.111/0001-11)
Projeto: Edifício Residencial Sol (CompletoComObra)
Valor: R$ 75.000,00
Condições: 50% adiantado, 50% na entrega
```

### 3. Usuário configura forma de pagamento
```
Forma de Pagamento: Parcelado
Número de Parcelas: 3
Valor de Entrada: R$ 25.000,00
```

### 4. Sistema calcula parcelas automaticamente
```
📋 Resumo das Parcelas
- Valor de entrada: R$ 25.000,00
- Valor restante: R$ 50.000,00
- Valor por parcela (3x): R$ 16.666,67
```

### 5. Venda é realizada
```json
POST /api/vendas/realizar
{
    "orcamentoId": "ORC-2025-001",
    "clienteId": "CLI-001",
    "valorTotal": 75000.00,
    "formaPagamento": "Parcelado",
    "parcelas": 3,
    "valorEntrada": 25000.00,
    "observacoes": "Cliente solicitou prazo estendido"
}
```

### 6. Sistema responde
```json
{
    "success": true,
    "message": "Venda realizada com sucesso",
    "data": {
        "venda": {
            "id": "VND-...",
            "numeroVenda": "VND-1234567890",
            "orcamentoId": "ORC-2025-001",
            "clienteId": "CLI-001",
            "valorTotal": 75000.00,
            "status": "Concluida"
        },
        "contasReceber": [
            {
                "id": "CR-001",
                "valorParcela": 41666.67,
                "dataVencimento": "2025-11-20",
                "status": "Pendente",
                "descricao": "Parcela 1/3 - Venda VND-1234567890"
            },
            {
                "id": "CR-002",
                "valorParcela": 16666.67,
                "dataVencimento": "2025-12-20",
                "status": "Pendente"
            },
            {
                "id": "CR-003",
                "valorParcela": 16666.67,
                "dataVencimento": "2026-01-20",
                "status": "Pendente"
            }
        ]
    }
}
```

---

## ✨ Benefícios da Mudança

### 1. **Rastreabilidade Completa**
- Cada venda está vinculada a um orçamento específico
- Histórico completo do processo comercial

### 2. **Consistência de Dados**
- Informações do cliente vêm direto do orçamento
- Não há risco de divergência de valores
- Condições de pagamento respeitam o acordado

### 3. **Menos Erros Manuais**
- Não precisa digitar cliente, projeto ou valor novamente
- Campos preenchidos automaticamente

### 4. **Fluxo de Trabalho Correto**
- Força o processo: Orçamento → Aprovação → Venda
- Impede vendas sem orçamento aprovado

### 5. **Melhor Gestão**
- Relatórios podem cruzar dados de orçamentos e vendas
- Análise de taxa de conversão (orçamentos aprovados → vendas)
- Controle de pipeline comercial

---

## 🚀 Próximos Passos Sugeridos

### Fase 1: Backend
- [ ] Validar se orçamento existe e está aprovado
- [ ] Verificar se orçamento já tem venda vinculada
- [ ] Atualizar status do orçamento para "Vendido"
- [ ] Criar projeto automaticamente (se aplicável)

### Fase 2: Frontend
- [ ] Adicionar filtros (por cliente, período)
- [ ] Mostrar materiais/serviços do orçamento
- [ ] Preview do orçamento antes de realizar venda
- [ ] Histórico de orçamentos do cliente

### Fase 3: Integrações
- [ ] Atualizar modelo Prisma (adicionar `orcamentoId` em `Venda`)
- [ ] Criar relação entre Orçamento e Venda no banco
- [ ] Impedir exclusão de orçamento com venda vinculada

---

## 📝 Alterações no Schema Prisma (Sugerido)

```prisma
model Venda {
  id              String   @id @default(uuid())
  numeroVenda     String   @unique
  orcamentoId     String   @unique  // NOVO: Vínculo com orçamento
  dataVenda       DateTime @default(now())
  valorTotal      Float
  status          String   @default("Pendente")
  clienteId       String
  projetoId       String?
  formaPagamento  String
  parcelas        Int
  valorEntrada    Float
  observacoes     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  orcamento Orcamento        @relation(fields: [orcamentoId], references: [id])  // NOVO
  cliente   Cliente          @relation(fields: [clienteId], references: [id])
  projeto   Projeto?         @relation(fields: [projetoId], references: [id])
  contasReceber ContaReceber[]

  @@map("vendas")
}

model Orcamento {
  // ... campos existentes ...
  venda   Venda?  // NOVO: Relação 1:1 com venda
}
```

---

## 🎓 Impacto no Sistema

### Módulos Afetados
- ✅ **Vendas**: Formulário totalmente refatorado
- ✅ **Orçamentos**: Serve como base para vendas
- ⚠️ **Projetos**: Será criado automaticamente após venda (futuro)
- ⚠️ **Financeiro**: Já integrado, mas pode exibir orçamento vinculado

### Compatibilidade
- ✅ Frontend atualizado
- ✅ Backend atualizado
- ⏳ Banco de dados: Precisa adicionar campo `orcamentoId` em `Venda`
- ⏳ Dados mockados: Atualizados para incluir orçamentos aprovados

---

## 📞 Suporte

Para dúvidas ou sugestões sobre esta mudança:
- 📖 Ver também: `IMPLEMENTACAO_MODULO_VENDAS.md`
- 🔧 Configuração: `GUIA_TESTES_COMPLETO.md`

---

**Atualização implementada em 20/10/2025** 🔌⚡
**Sistema S3E Engenharia Elétrica**

