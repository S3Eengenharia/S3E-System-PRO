# 🔄 Atualização: Relatórios Baseados em Contas PAGAS

## ✅ Mudanças Implementadas

Ajustei a lógica de relatórios financeiros para considerar **apenas contas pagas** (status = 'Pago'), usando a **data de pagamento** ao invés da data de vencimento para agregação mensal.

---

## 🎯 Motivação

**Antes:** Os relatórios agregavam todas as contas (pagas e pendentes) por data de vencimento.

**Problema:** 
- Incluía valores que ainda não foram pagos/recebidos
- Não refletia o fluxo de caixa real
- Dados não representavam a situação financeira verdadeira

**Agora:** Os relatórios agregam **apenas contas pagas** por **data de pagamento**.

**Benefícios:**
- ✅ Reflete o fluxo de caixa real
- ✅ Mostra receitas e despesas efetivamente realizadas
- ✅ Permite análise histórica precisa
- ✅ Facilita reconciliação com extratos bancários

---

## 🔧 Alterações Técnicas

### 1. Modelo `ContaPagar` Atualizado

**Arquivo:** `backend/prisma/schema.prisma`

```prisma
model ContaPagar {
  id             String   @id @default(uuid())
  fornecedorId   String?  // ✨ Agora opcional
  compraId       String?
  descricao      String
  valorParcela   Float    // ✨ Mudou de valorTotal para valorParcela
  dataVencimento DateTime
  dataPagamento  DateTime?
  status         String   @default("Pendente") // Pendente, Pago, Atrasado, Cancelado
  numeroParcela  Int?
  totalParcelas  Int?
  observacoes    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  fornecedor Fornecedor? @relation(fields: [fornecedorId], references: [id])

  @@map("contas_pagar")
}
```

**Mudanças:**
- ✅ `valorTotal` → `valorParcela` (consistência com ContaReceber)
- ✅ `fornecedorId` agora é opcional (permite despesas sem fornecedor)
- ✅ Relação `fornecedor` também opcional

---

### 2. Serviço de Relatórios Atualizado

**Arquivo:** `backend/src/services/relatorios.service.ts`

#### Antes (❌):
```typescript
// Buscava TODAS as contas por data de vencimento
const contasReceber = await prisma.contaReceber.findMany({
    where: {
        dataVencimento: { gte: dataInicio }
    }
});

// Agregava por data de vencimento
contasReceber.forEach(conta => {
    const data = new Date(conta.dataVencimento);
    // ...
});
```

#### Depois (✅):
```typescript
// Busca APENAS contas PAGAS por data de pagamento
const contasReceber = await prisma.contaReceber.findMany({
    where: {
        dataPagamento: { gte: dataInicio },
        status: 'Pago'
    },
    select: {
        dataPagamento: true,
        valorParcela: true,
        status: true
    }
});

// Agrega por data de pagamento
contasReceber.forEach(conta => {
    if (conta.dataPagamento) {
        const data = new Date(conta.dataPagamento);
        // ...
    }
});
```

**Mudanças:**
- ✅ Filtro adicional: `status: 'Pago'`
- ✅ Usa `dataPagamento` ao invés de `dataVencimento`
- ✅ Agregação baseada em quando foi efetivamente pago
- ✅ Verifica `dataPagamento` antes de processar

---

### 3. Rotas Ajustadas

**Arquivo:** `backend/src/routes/relatorios.routes.ts`

```typescript
// Dados financeiros mensais (admin, financeiro)
router.get(
    '/financeiro',
    authenticate,
    authorize('admin', 'financeiro'),  // ✨ Simplificado
    RelatoriosController.getDadosFinanceiros
);
```

**Mudanças:**
- ✅ Permissões simplificadas: `admin` e `financeiro`
- ✅ Removido `gerente` do endpoint específico de dados mensais

---

## 📊 Impacto nos Dados

### Exemplo: Agregação Mensal

**Cenário:**
```
Conta A: Vencimento 01/11/2024 | Pagamento 05/11/2024 | R$ 1.000
Conta B: Vencimento 15/11/2024 | Pagamento 20/12/2024 | R$ 2.000
Conta C: Vencimento 20/11/2024 | Status: Pendente      | R$ 3.000
```

**Antes (data de vencimento, todas as contas):**
```json
{
  "mes": "Nov/2024",
  "receita": 6000.00  // A + B + C
}
```

**Depois (data de pagamento, apenas pagas):**
```json
[
  {
    "mes": "Nov/2024",
    "receita": 1000.00  // Apenas A (paga em nov)
  },
  {
    "mes": "Dez/2024",
    "receita": 2000.00  // Apenas B (paga em dez)
  }
]
```

**Resultado:**
- ❌ Conta C não aparece (ainda não foi paga)
- ✅ Conta A aparece em Nov (quando foi paga)
- ✅ Conta B aparece em Dez (quando foi paga)

---

## 🔄 Fluxo de Caixa Real

### Vantagens da Nova Abordagem

#### 1. **Regime de Caixa**
```
✅ Registra quando o dinheiro efetivamente entra/sai
❌ Não registra apenas quando venceu
```

#### 2. **Reconciliação Bancária**
```
✅ Dados batem com extrato bancário
✅ Fácil identificar discrepâncias
```

#### 3. **Análise Histórica Precisa**
```
✅ "Em Nov/2024 recebemos X"
❌ "Em Nov/2024 venceu X" (mas pode não ter sido pago)
```

#### 4. **Decisões Baseadas em Realidade**
```
✅ Lucro baseado em dinheiro real
❌ Lucro baseado em valores "teóricos"
```

---

## 📈 Exemplo de Resposta da API

### `GET /api/relatorios/financeiro`

```json
{
  "success": true,
  "data": [
    {
      "mes": "Jan/2025",
      "receita": 45000.00,    // Receitas pagas em Jan
      "despesa": 25000.00,    // Despesas pagas em Jan
      "lucro": 20000.00       // Lucro real de Jan
    },
    {
      "mes": "Fev/2025",
      "receita": 52000.00,    // Receitas pagas em Fev
      "despesa": 28000.00,    // Despesas pagas em Fev
      "lucro": 24000.00       // Lucro real de Fev
    }
    // ... últimos 12 meses
  ]
}
```

**Interpretação:**
- Cada mês mostra **apenas** valores efetivamente pagos/recebidos
- Lucro representa **caixa real** do período
- Contas pendentes **não** influenciam os números

---

## 🆚 Comparação: Regime de Competência vs Regime de Caixa

### Regime de Competência (Antes)
```
Mês: Novembro 2024
Receitas (vencidas):  R$ 100.000
Despesas (vencidas):  R$ 60.000
Lucro (teórico):      R$ 40.000
```

**Problema:** Pode não ter dinheiro no caixa!

### Regime de Caixa (Agora)
```
Mês: Novembro 2024
Receitas (pagas):     R$ 75.000
Despesas (pagas):     R$ 55.000
Lucro (real):         R$ 20.000
```

**Vantagem:** Reflete dinheiro disponível!

---

## 🎯 Casos de Uso

### 1. Dashboard Financeiro
```typescript
// Gráfico de Barras: Receitas x Despesas
// Mostra fluxo de caixa real mensal
const dados = await fetch('/api/relatorios/financeiro');

// Bar Chart:
// Nov: Receita R$ 75k, Despesa R$ 55k
// Dez: Receita R$ 80k, Despesa R$ 60k
```

### 2. Análise de Fluxo de Caixa
```typescript
// Identificar meses com fluxo negativo
const mesesNegativos = dados.filter(mes => mes.lucro < 0);

// Alerta: "Em Mar/2024 houve déficit de R$ 10.000"
```

### 3. Planejamento Financeiro
```typescript
// Média de receitas dos últimos 6 meses
const media = dados.slice(-6).reduce((sum, m) => 
    sum + m.receita, 0) / 6;

// Projeção: "Média mensal: R$ 78.000"
```

### 4. Reconciliação Contábil
```typescript
// Comparar com extratos bancários
const receitasMes = dados.find(m => m.mes === 'Jan/2025').receita;
const extratoBanco = 45000.00;

if (receitasMes === extratoBanco) {
    console.log('✅ Valores conferem!');
}
```

---

## 🔐 Permissões Atualizadas

| Endpoint | Permissões | Mudança |
|----------|------------|---------|
| `/financeiro` | admin, financeiro | ✅ Simplificado |
| `/financeiro/resumo` | admin, gerente, financeiro | ⚪ Mantido |
| `/dashboard` | admin, gerente | ⚪ Mantido |

---

## 🚀 Migration Necessária

Para aplicar as mudanças no banco de dados:

```bash
cd backend
dotenv -e .env.development -- npx prisma migrate dev --name "update_conta_pagar_valorparcela"
```

**O que a migration faz:**
1. Renomeia `valorTotal` → `valorParcela` em `ContaPagar`
2. Remove `valorPago` (não mais necessário)
3. Torna `fornecedorId` opcional
4. Atualiza relação com `Fornecedor`

---

## ⚠️ Considerações Importantes

### 1. Contas Pendentes
```
❌ NÃO aparecem nos gráficos mensais
✅ Aparecem no resumo financeiro (contasReceberPendentes)
```

### 2. Data de Pagamento Nula
```typescript
// Apenas contas com dataPagamento são contabilizadas
if (conta.dataPagamento) {
    // Processa conta paga
}
```

### 3. Status Obrigatório
```typescript
// Filtro explícito por status
where: {
    status: 'Pago'
}
```

### 4. Período de Análise
```typescript
// Últimos 12 meses a partir da data de pagamento
dataPagamento: {
    gte: dataInicio  // 12 meses atrás
}
```

---

## 📊 Exemplo Completo: Dashboard

```typescript
// Frontend
const Dashboard = () => {
    const [dados, setDados] = useState([]);
    
    useEffect(() => {
        fetch('/api/relatorios/financeiro', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setDados(data.data));
    }, []);
    
    return (
        <div>
            <h2>Fluxo de Caixa (Últimos 12 Meses)</h2>
            <BarChart>
                {dados.map(mes => (
                    <Bar 
                        key={mes.mes}
                        label={mes.mes}
                        receita={mes.receita}    // Valores PAGOS
                        despesa={mes.despesa}    // Valores PAGOS
                        lucro={mes.lucro}        // Diferença REAL
                    />
                ))}
            </BarChart>
            
            <p className="text-sm text-gray-600">
                * Valores baseados em pagamentos efetivamente realizados
            </p>
        </div>
    );
};
```

---

## 🎓 Conclusão

### Antes:
- ❌ Relatórios por data de vencimento
- ❌ Incluía contas não pagas
- ❌ Não refletia realidade financeira

### Depois:
- ✅ Relatórios por data de pagamento
- ✅ Apenas contas efetivamente pagas
- ✅ Fluxo de caixa real
- ✅ Decisões baseadas em dados verdadeiros

---

**Atualização implementada em 20/10/2025** 💰  
**Sistema S3E Engenharia Elétrica**

