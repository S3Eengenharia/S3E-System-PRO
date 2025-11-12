# 📦 Implementação Completa - Serviço de Compras

## ✅ Resumo Executivo

Implementação do **serviço completo de Compras** com integração automática de **Estoque** (entrada de materiais) e **Contas a Pagar** (parcelamentos), utilizando transações atômicas para garantir consistência.

---

## 🎯 Funcionalidades Implementadas

### 1. ✅ Registrar Compra Completa
Cria compra, atualiza estoque e gera contas a pagar em uma única transação.

### 2. ✅ Atualização Automática de Estoque
Ao receber materiais, incrementa estoque automaticamente.

### 3. ✅ Geração de Contas a Pagar
Se compra for parcelada, gera contas a pagar automaticamente.

### 4. ✅ Vinculação Inteligente
Tenta vincular itens da NF com materiais do cadastro.

### 5. ✅ Transação Atômica
Tudo acontece junto ou nada acontece (rollback automático).

### 6. ✅ Listagem com Filtros
Buscar compras por fornecedor, status, período.

### 7. ✅ Atualização de Status
Mudar status e atualizar estoque automaticamente.

---

## 🔄 Fluxo Completo de Compra

### Cenário: Compra de Materiais Parcelada

```
┌─────────────────────────────────────────────────────────┐
│ 1. CRIAR COMPRA                                         │
│    POST /api/compras                                    │
│                                                         │
│    {                                                    │
│      "fornecedorNome": "Distribuidora ABC",             │
│      "fornecedorCNPJ": "11.111.111/0001-11",            │
│      "numeroNF": "NFe-12345",                           │
│      "dataEmissaoNF": "2025-10-20",                     │
│      "dataCompra": "2025-10-20",                        │
│      "status": "Recebido",                              │
│      "items": [                                         │
│        {                                                │
│          "materialId": "MAT-001",                       │
│          "nomeProduto": "Disjuntor 20A",                │
│          "quantidade": 100,                             │
│          "valorUnit": 15.50                             │
│        },                                               │
│        {                                                │
│          "materialId": "MAT-002",                       │
│          "nomeProduto": "Cabo 2.5mm²",                  │
│          "quantidade": 50,                              │
│          "valorUnit": 250.00                            │
│        }                                                │
│      ],                                                 │
│      "valorFrete": 500.00,                              │
│      "condicoesPagamento": "Parcelado 3x",              │
│      "parcelas": 3                                      │
│    }                                                    │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. BACKEND PROCESSA (em TRANSAÇÃO)                      │
│                                                         │
│    a) ✅ Busca ou cria fornecedor                       │
│       Fornecedor: Distribuidora ABC                     │
│                                                         │
│    b) ✅ Calcula valores                                │
│       Subtotal: R$ 14.050,00                            │
│       Frete: R$ 500,00                                  │
│       Total: R$ 14.550,00                               │
│                                                         │
│    c) ✅ Cria compra                                    │
│       PC-001: NF 12345                                  │
│       Status: Recebido                                  │
│                                                         │
│    d) ✅ Cria items da compra                           │
│       Item 1: 100x Disjuntor @ R$ 15,50                 │
│       Item 2: 50x Cabo @ R$ 250,00                      │
│                                                         │
│    e) ✅ Atualiza estoque (status = Recebido)           │
│       MAT-001: 150 → 250  (+100)                        │
│       MAT-002: 80 → 130   (+50)                         │
│                                                         │
│    f) ✅ Registra movimentações                         │
│       MOV-001: ENTRADA 100 MAT-001 (COMPRA PC-001)      │
│       MOV-002: ENTRADA 50 MAT-002 (COMPRA PC-001)       │
│                                                         │
│    g) ✅ Gera contas a pagar (parcelas = 3)             │
│       CP-001: R$ 4.850,00 (venc: +30 dias)              │
│       CP-002: R$ 4.850,00 (venc: +60 dias)              │
│       CP-003: R$ 4.850,00 (venc: +90 dias)              │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. RESPOSTA DE SUCESSO                                  │
│                                                         │
│    {                                                    │
│      "success": true,                                   │
│      "message": "Compra registrada com sucesso",        │
│      "data": {                                          │
│        "compra": { ... },                               │
│        "contasPagar": [                                 │
│          { "valorParcela": 4850, "numeroParcela": 1 },  │
│          { "valorParcela": 4850, "numeroParcela": 2 },  │
│          { "valorParcela": 4850, "numeroParcela": 3 }   │
│        ],                                               │
│        "estoqueAtualizado": true                        │
│      }                                                  │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Estrutura do Serviço

### ComprasService

```typescript
export class ComprasService {
    // Registrar compra completa
    static async registrarCompra(data: CompraPayload)
    
    // Listar com filtros
    static async listarCompras(status?, fornecedorId?, dataInicio?, dataFim?, page, limit)
    
    // Buscar compra específica
    static async buscarCompra(id: string)
    
    // Atualizar status (atualiza estoque se for "Recebido")
    static async atualizarStatusCompra(id: string, novoStatus: string)
    
    // Cancelar compra
    static async cancelarCompra(id: string)
    
    // Compras por fornecedor
    static async getComprasPorFornecedor(fornecedorId: string)
    
    // Total por período
    static async getTotalComprasPorPeriodo(dataInicio: Date, dataFim: Date)
}
```

---

## 🔌 Integrações Automáticas

### 1. Compra → Estoque

```typescript
// Quando status = "Recebido"
for (const item of compra.items) {
    if (item.materialId) {
        await EstoqueService.incrementarEstoque(
            item.materialId,
            item.quantidade,
            'COMPRA',
            compra.id,
            `Compra NF: ${numeroNF}`
        );
    }
}

// Resultado:
Material: estoque incrementado ✅
Movimentação: registrada ✅
```

---

### 2. Compra → Contas a Pagar

```typescript
// Se compra for parcelada
if (parcelas > 0) {
    await ContasPagarService.criarContasPagarParceladas({
        fornecedorId: fornecedor.id,
        compraId: compra.id,
        descricao: `Compra NF ${numeroNF}`,
        valorTotal,
        parcelas,
        dataPrimeiroVencimento
    });
}

// Resultado:
N contas a pagar criadas ✅
Vinculadas à compra ✅
Vinculadas ao fornecedor ✅
```

---

### 3. Vinculação Automática de Materiais

```typescript
// Se item não tem materialId, tentar encontrar
const material = await prisma.material.findFirst({
    where: {
        OR: [
            { nome: { contains: item.nomeProduto } },
            { sku: item.ncm }
        ]
    }
});

if (material) {
    // Vincular e atualizar estoque
    await incrementarEstoque(material.id, item.quantidade);
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Compra À Vista Recebida

```bash
curl -X POST http://localhost:3001/api/compras \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedorNome": "Distribuidora Elétrica Nacional",
    "fornecedorCNPJ": "11.111.111/0001-11",
    "fornecedorTel": "(11) 99999-8888",
    "numeroNF": "NFe-54321",
    "dataEmissaoNF": "2025-10-20",
    "dataCompra": "2025-10-20",
    "status": "Recebido",
    "items": [
      {
        "materialId": "MAT-001",
        "nomeProduto": "Disjuntor Monopolar 20A",
        "ncm": "85363000",
        "quantidade": 200,
        "valorUnit": 12.00
      }
    ],
    "valorFrete": 150.00
  }'
```

**O que acontece:**
```
✅ Compra criada
✅ Fornecedor vinculado (ou criado)
✅ 200 disjuntores adicionados ao estoque
✅ Movimentação registrada
❌ Sem contas a pagar (não é parcelado)
```

---

### Exemplo 2: Compra Parcelada em 4x

```bash
curl -X POST http://localhost:3001/api/compras \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedorNome": "Cabos Brasil Ltda",
    "fornecedorCNPJ": "22.222.222/0001-22",
    "numeroNF": "NFe-99999",
    "dataEmissaoNF": "2025-10-20",
    "dataCompra": "2025-10-20",
    "status": "Recebido",
    "items": [
      {
        "materialId": "MAT-002",
        "nomeProduto": "Cabo Flexível 2.5mm²",
        "quantidade": 100,
        "valorUnit": 220.00
      }
    ],
    "condicoesPagamento": "Parcelado em 4x sem juros",
    "parcelas": 4,
    "dataPrimeiroVencimento": "2025-11-20"
  }'
```

**O que acontece:**
```
✅ Compra criada (Total: R$ 22.000,00)
✅ 100 rolos de cabo adicionados ao estoque
✅ Movimentação registrada
✅ 4 contas a pagar criadas:
   - CP-001: R$ 5.500 (venc: 20/11/2025)
   - CP-002: R$ 5.500 (venc: 20/12/2025)
   - CP-003: R$ 5.500 (venc: 19/01/2026)
   - CP-004: R$ 5.500 (venc: 18/02/2026)
```

---

### Exemplo 3: Compra Pendente (não recebida ainda)

```bash
curl -X POST http://localhost:3001/api/compras \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedorNome": "Iluminação Profissional",
    "fornecedorCNPJ": "33.333.333/0001-33",
    "numeroNF": "NFe-77777",
    "dataEmissaoNF": "2025-10-20",
    "dataCompra": "2025-10-20",
    "status": "Pendente",
    "items": [
      {
        "nomeProduto": "Luminária LED 18W",
        "quantidade": 50,
        "valorUnit": 35.00
      }
    ]
  }'
```

**O que acontece:**
```
✅ Compra criada (Status: Pendente)
❌ Estoque NÃO é atualizado (ainda não recebeu)
❌ Sem contas a pagar (à vista)

Depois, quando receber:
PUT /api/compras/:id/status
{ "status": "Recebido" }

✅ Status atualizado para "Recebido"
✅ Estoque incrementado automaticamente
✅ Movimentação registrada
```

---

### Exemplo 4: Listar Compras com Filtros

```bash
# Todas as compras recebidas
curl -X GET "http://localhost:3001/api/compras?status=Recebido" \
  -H "Authorization: Bearer TOKEN"

# Compras de um fornecedor
curl -X GET "http://localhost:3001/api/compras?fornecedorId=FORN-001" \
  -H "Authorization: Bearer TOKEN"

# Compras recebidas de um fornecedor
curl -X GET "http://localhost:3001/api/compras?status=Recebido&fornecedorId=FORN-001" \
  -H "Authorization: Bearer TOKEN"

# Com paginação
curl -X GET "http://localhost:3001/api/compras?page=2&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔍 Vinculação Automática de Materiais

### Como Funciona

```typescript
// Item da NF vem com:
{
  "nomeProduto": "Disjuntor Monopolar 20 Amperes",
  "ncm": "85363000",
  "materialId": null  // Não informado
}

// Sistema busca automaticamente:
const material = await prisma.material.findFirst({
    where: {
        OR: [
            { nome: { contains: "Disjuntor", mode: 'insensitive' } },
            { sku: "85363000" }
        ]
    }
});

// Se encontrar:
if (material) {
    // Vincula e atualiza estoque
    await incrementarEstoque(material.id, quantidade);
}
```

**Cenários:**

1. **✅ Item tem `materialId`**
   - Vincula direto
   - Atualiza estoque

2. **🔍 Item não tem `materialId`**
   - Busca por nome (fuzzy search)
   - Busca por SKU/NCM
   - Se encontrar: vincula e atualiza
   - Se não encontrar: apenas registra compra

3. **⚠️ Material não cadastrado**
   - Compra é criada normalmente
   - Estoque não é atualizado
   - Aviso: "Material não vinculado"

---

## 📦 Status de Compra

### Estados Possíveis

| Status | Descrição | Atualiza Estoque? |
|--------|-----------|-------------------|
| **Pendente** | Compra registrada, aguardando recebimento | ❌ Não |
| **Recebido** | Materiais recebidos | ✅ Sim |
| **Cancelado** | Compra cancelada | ❌ Não |

### Transições

```
Pendente → Recebido  ✅ Atualiza estoque
Pendente → Cancelado ✅ Permitido
Recebido → Cancelado ❌ Bloqueado (fazer devolução)
Cancelado → Qualquer ❌ Bloqueado
```

---

## 🧮 Cálculo de Valores

### Composição do Total

```typescript
// Subtotal
items.forEach(item => {
    subtotal += item.quantidade * item.valorUnit;
});

// Total
valorTotal = subtotal + valorFrete + outrasDespesas;

// Exemplo:
Subtotal:       R$ 14.050,00
Frete:          R$    500,00
Outras Despesas: R$    200,00
──────────────────────────────
Total:          R$ 14.750,00
```

---

## 🔐 Controle de Acesso

### Permissões

| Ação | admin | compras | financeiro | gerente |
|------|-------|---------|------------|---------|
| Criar compra | ✅ | ✅ | ❌ | ❌ |
| Ver compras | ✅ | ✅ | ✅ | ✅ |
| Atualizar status | ✅ | ✅ | ❌ | ❌ |
| Cancelar | ✅ | ✅ | ❌ | ❌ |

### Implementação

```typescript
// Rotas protegidas
router.post('/api/compras', 
    authenticate, 
    authorize('admin', 'compras'),
    ComprasController.create
);
```

---

## 📊 Exemplo Real: Compra Grande

### Cenário
Compra de R$ 50.000 em materiais, parcelada em 5x

```json
POST /api/compras
{
  "fornecedorNome": "Mega Distribuidora",
  "fornecedorCNPJ": "44.444.444/0001-44",
  "numeroNF": "NFe-11111",
  "dataEmissaoNF": "2025-10-20",
  "dataCompra": "2025-10-20",
  "status": "Recebido",
  "items": [
    {
      "materialId": "MAT-010",
      "nomeProduto": "Quadro Metálico 600x800",
      "quantidade": 50,
      "valorUnit": 180.00
    },
    {
      "materialId": "MAT-011",
      "nomeProduto": "Disjuntor Geral 63A",
      "quantidade": 50,
      "valorUnit": 85.00
    },
    {
      "materialId": "MAT-015",
      "nomeProduto": "DPS 40kA",
      "quantidade": 100,
      "valorUnit": 95.00
    },
    {
      "materialId": "MAT-002",
      "nomeProduto": "Cabo 2.5mm²",
      "quantidade": 200,
      "valorUnit": 210.00
    }
  ],
  "valorFrete": 1500.00,
  "condicoesPagamento": "5x sem juros",
  "parcelas": 5,
  "dataPrimeiroVencimento": "2025-11-25"
}
```

**Cálculos:**
```
Subtotal:
- 50x Quadro @ R$ 180 = R$ 9.000
- 50x Disjuntor Geral @ R$ 85 = R$ 4.250
- 100x DPS @ R$ 95 = R$ 9.500
- 200x Cabo @ R$ 210 = R$ 42.000
──────────────────────────────────────
Subtotal: R$ 64.750,00
Frete:    R$  1.500,00
──────────────────────────────────────
Total:    R$ 66.250,00

Parcelamento (5x):
Parcela: R$ 13.250,00
```

**Resultado da Transação:**
```
✅ Compra PC-2025-XXX criada
✅ 4 itens registrados
✅ Estoque atualizado:
   - MAT-010: +50
   - MAT-011: +50
   - MAT-015: +100
   - MAT-002: +200
✅ 4 movimentações registradas
✅ 5 contas a pagar criadas (R$ 13.250 cada)
```

---

## 🎨 Frontend Sugerido

### Formulário de Nova Compra

```tsx
const NovaCompra = () => {
    const [compraForm, setCompraForm] = useState({
        fornecedorCNPJ: '',
        numeroNF: '',
        items: [],
        status: 'Pendente',
        condicoesPagamento: '',
        parcelas: 0
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/compras', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(compraForm)
            });
            
            const { data } = await response.json();
            
            alert(`
                ✅ Compra registrada!
                
                ${data.estoqueAtualizado ? '✅ Estoque atualizado!' : '⏳ Estoque será atualizado ao receber'}
                ${data.contasPagar ? `✅ ${data.contasPagar.length} contas a pagar geradas` : ''}
            `);
            
        } catch (error) {
            alert('Erro ao registrar compra');
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {/* Fornecedor */}
            <input 
                name="fornecedorCNPJ"
                placeholder="CNPJ do Fornecedor"
                required
            />
            
            {/* NF */}
            <input 
                name="numeroNF"
                placeholder="Número da NF-e"
                required
            />
            
            {/* Status */}
            <select name="status">
                <option value="Pendente">Pendente (Aguardando)</option>
                <option value="Recebido">Recebido (Atualiza Estoque)</option>
            </select>
            
            {/* Items */}
            <ItemsCompraList />
            
            {/* Parcelamento */}
            <input 
                type="number"
                name="parcelas"
                placeholder="Parcelas (0 = à vista)"
                min="0"
                max="12"
            />
            
            {compraForm.parcelas > 0 && (
                <input 
                    type="date"
                    name="dataPrimeiroVencimento"
                    placeholder="Primeiro Vencimento"
                />
            )}
            
            <button type="submit">
                📦 Registrar Compra
            </button>
        </form>
    );
};
```

---

## 🎯 Casos de Uso

### Caso 1: Compra de Emergência

```
Situação: Estoque de disjuntores acabou
         Cliente ligou pedindo orçamento urgente

Solução:
1. Comprar 200 disjuntores (status: Pendente)
2. Quando chegarem, atualizar para "Recebido"
3. Estoque atualiza automaticamente
4. Criar orçamento e venda normalmente
```

---

### Caso 2: Compra Programada

```
Situação: Reposição mensal de estoque

Solução:
1. Criar compra recorrente todo dia 1º
2. Status: Pendente
3. Quando receber (dia 10-15), atualizar status
4. Estoque incrementado automaticamente
```

---

### Caso 3: Compra com Parcelamento

```
Situação: Compra grande de R$ 100.000
         Fornecedor oferece 10x sem juros

Solução:
1. Registrar compra com parcelas: 10
2. Sistema gera 10 contas a pagar (R$ 10.000 cada)
3. Pagar mensalmente
4. Relatórios mostram despesa distribuída em 10 meses
```

---

## 📈 Análises Disponíveis

### 1. Total de Compras por Período

```typescript
GET /api/compras/relatorio/periodo?inicio=2025-01-01&fim=2025-12-31

// Retorna:
{
  "totalCompras": 45,
  "valorTotal": 485000.00
}
```

### 2. Compras por Fornecedor

```typescript
GET /api/compras/fornecedor/:id

// Lista todas as compras de um fornecedor
// Útil para análise de relacionamento
```

### 3. Evolução de Compras

```typescript
// Comparar mês a mês
Jan: R$ 45.000
Fev: R$ 52.000 (+15%)
Mar: R$ 48.000 (-7%)
```

---

## ⚠️ Validações e Segurança

### Validações Implementadas

```typescript
// 1. Dados obrigatórios
if (!fornecedorCNPJ || !numeroNF || !items.length) {
    throw new Error('Dados obrigatórios ausentes');
}

// 2. Valores positivos
if (valorUnit <= 0 || quantidade <= 0) {
    throw new Error('Valores devem ser positivos');
}

// 3. Status válido
if (!['Pendente', 'Recebido', 'Cancelado'].includes(status)) {
    throw new Error('Status inválido');
}

// 4. Não cancelar compra recebida
if (compra.status === 'Recebido' && novoStatus === 'Cancelado') {
    throw new Error('Não é possível cancelar compra já recebida');
}
```

---

## 🔄 Integração com Outros Módulos

### Compras ↔ Estoque

```
Compra Recebida
    ↓
EstoqueService.incrementarEstoque()
    ↓
Material.estoque +=  quantidade
MovimentacaoEstoque.create(ENTRADA)
```

### Compras ↔ Contas a Pagar

```
Compra Parcelada
    ↓
ContasPagarService.criarContasPagarParceladas()
    ↓
N ContasPagar criadas
Vinculadas à compra
```

### Compras ↔ Relatórios

```
Contas Pagas
    ↓
RelatoriosService.getDadosFinanceirosMensais()
    ↓
Despesas aparecem no gráfico
```

---

## 📝 Arquivos Criados/Modificados

### Criados
1. **backend/src/services/compras.service.ts** - Lógica de negócio

### Modificados
2. **backend/src/services/estoque.service.ts** - Adicionado `incrementarEstoque()`
3. **backend/src/controllers/comprasController.ts** - Usa serviço
4. **backend/src/services/vendas.service.ts** - Já integrado

### Documentação
5. **IMPLEMENTACAO_SERVICO_COMPRAS.md** (este arquivo)

---

## ✅ Checklist de Implementação

### Serviço de Compras
- [x] Registrar compra completa
- [x] Criar ou buscar fornecedor
- [x] Calcular valores (subtotal, frete, total)
- [x] Criar items da compra
- [x] Atualizar estoque (se Recebido)
- [x] Gerar contas a pagar (se parcelado)
- [x] Usar transação atômica
- [x] Listar compras com filtros
- [x] Buscar compra específica
- [x] Atualizar status
- [x] Cancelar compra
- [x] Análises por fornecedor
- [x] Análises por período

### Integr ações
- [x] Estoque: incremento automático
- [x] Contas a Pagar: geração automática
- [x] Movimentações: registro automático
- [x] Fornecedor: criação automática se não existir
- [x] Material: vinculação automática por nome/NCM

### Validações
- [x] Dados obrigatórios
- [x] Valores positivos
- [x] Status válidos
- [x] Regras de transição de status
- [x] Tratamento de erros
- [x] Rollback em caso de falha

---

## 🚀 Status Final

### Sistema de Compras

```
✅ Serviço completo implementado
✅ Controller atualizado
✅ Rotas protegidas
✅ Integração com Estoque
✅ Integração com Contas a Pagar
✅ Transações atômicas
✅ Validações robustas
✅ Vinculação automática
✅ Análises e relatórios
✅ Pronto para produção!
```

---

## 🎓 Boas Práticas Aplicadas

### 1. Transação Atômica
```typescript
await prisma.$transaction(async (tx) => {
    await criarCompra();
    await atualizarEstoque();
    await gerarContas();
    // Tudo ou nada!
});
```

### 2. Vinculação Inteligente
```typescript
// Tenta vincular automaticamente
// Se não encontrar, apenas avisa
// Não bloqueia a operação
```

### 3. Separação de Responsabilidades
```typescript
ComprasService → Lógica de negócio
EstoqueService → Gestão de estoque
ContasPagarService → Gestão financeira
```

### 4. Validação em Camadas
```typescript
Controller → Dados obrigatórios
Service → Regras de negócio
Prisma → Integridade referencial
```

---

## 📞 Próximos Passos

### Frontend
- [ ] Criar página Compras.tsx
- [ ] Formulário de nova compra
- [ ] Upload de XML NF-e
- [ ] Tabela de listagem
- [ ] Indicador de estoque atualizado

### Melhorias
- [ ] Parse automático de XML completo
- [ ] OCR para digitação de NF
- [ ] Integração com SPED
- [ ] Alertas de compras recorrentes

---

**Implementado em 20/10/2025** 📦  
**Sistema S3E Engenharia Elétrica** ⚡

