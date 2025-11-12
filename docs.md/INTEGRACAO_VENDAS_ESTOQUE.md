# 📦 Integração: Vendas → Estoque

## ✅ Implementação Completa

Sistema agora possui **baixa automática de estoque** ao realizar vendas, com suporte total a **materiais diretos** e **kits expandidos**.

---

## 🎯 Funcionalidades Implementadas

### 1. ✅ Baixa Automática de Estoque
Ao realizar venda, sistema dá baixa automaticamente nos materiais.

### 2. ✅ Expansão de Kits
Kits são expandidos e cada componente tem baixa individual.

### 3. ✅ Verificação Prévia
Antes de vender, verifica se há estoque suficiente.

### 4. ✅ Agrupamento Inteligente
Materiais repetidos são somados (ex: mesmo material em 2 kits diferentes).

### 5. ✅ Transação Atômica
Venda, contas e baixa de estoque acontecem juntas ou nada acontece.

### 6. ✅ Registro de Movimentação
Cada baixa gera registro em `movimentacoes_estoque`.

---

## 🔄 Fluxo Completo

### Antes de Realizar Venda (Verificação)

```
1. Frontend chama:
   GET /api/vendas/estoque/:orcamentoId
   
2. Backend:
   a) Busca orçamento
   b) Lista todos os itens
   c) Expande kits em componentes
   d) Verifica estoque de cada material
   e) Retorna: disponível ou não
   
3. Frontend exibe:
   ✅ "Estoque OK - Pode vender"
   ❌ "Faltam 50 unidades de Disjuntor 20A"
```

---

### Durante Realização da Venda

```
1. Frontend envia:
   POST /api/vendas/realizar
   {
     "orcamentoId": "ORC-2025-001",
     "clienteId": "CLI-001",
     "valorTotal": 75000.00,
     "parcelas": 3
   }
   
2. Backend (em TRANSAÇÃO):
   
   a) ✅ Cria venda
      VND-123456789
   
   b) ✅ Gera 3 contas a receber
      CR-001, CR-002, CR-003
   
   c) ✅ Busca itens do orçamento
      - Material MAT-001: 200 unidades
      - Kit KIT-001: 5 unidades
   
   d) ✅ Expande kits
      KIT-001 contém:
        - MAT-002: 10 unidades (cada)
        - MAT-003: 5 unidades (cada)
      
      5x KIT-001 precisa:
        - MAT-002: 50 unidades
        - MAT-003: 25 unidades
   
   e) ✅ Agrupa materiais
      Total necessário:
        - MAT-001: 200 unidades (direto)
        - MAT-002: 50 unidades (do kit)
        - MAT-003: 25 unidades (do kit)
   
   f) ✅ Verifica estoque
      MAT-001: 150 disponível ❌ Falta 50!
      
   g) ❌ ERRO! Rollback automático
      → Venda NÃO criada
      → Contas NÃO criadas
      → Estoque NÃO alterado
   
3. Frontend recebe erro:
   "Estoque insuficiente:
    Disjuntor 20A: faltam 50 unidades"
```

---

### Quando Estoque É Suficiente

```
2. Backend (em TRANSAÇÃO):
   
   a) ✅ Cria venda
   b) ✅ Gera contas a receber
   c) ✅ Expande kits
   d) ✅ Agrupa materiais
   e) ✅ Verifica estoque (OK!)
   
   f) ✅ Dá baixa no estoque:
      MAT-001: 200 → 0    (-200)
      MAT-002: 100 → 50   (-50)
      MAT-003: 80 → 55    (-25)
   
   g) ✅ Registra movimentações:
      MOV-001: SAIDA 200 MAT-001 (VENDA VND-123)
      MOV-002: SAIDA 50 MAT-002 (VENDA VND-123)
      MOV-003: SAIDA 25 MAT-003 (VENDA VND-123)
   
3. Frontend recebe sucesso:
   {
     "venda": { ... },
     "contasReceber": [ ... ],
     "baixaEstoque": {
       "materiaisProcessados": 3,
       "totalItens": 275
     }
   }
```

---

## 📊 Exemplos Práticos

### Exemplo 1: Orçamento com Materiais Diretos

**Orçamento ORC-2025-001:**
```json
{
  "items": [
    {
      "tipo": "MATERIAL",
      "materialId": "MAT-001",
      "quantidade": 100
    },
    {
      "tipo": "MATERIAL",
      "materialId": "MAT-002",
      "quantidade": 50
    }
  ]
}
```

**Baixa de Estoque:**
```
MAT-001: -100 unidades
MAT-002: -50 unidades

Movimentações:
- SAIDA 100 MAT-001 (Motivo: VENDA, Ref: VND-123)
- SAIDA 50 MAT-002 (Motivo: VENDA, Ref: VND-123)
```

---

### Exemplo 2: Orçamento com Kits

**Orçamento ORC-2025-002:**
```json
{
  "items": [
    {
      "tipo": "KIT",
      "kitId": "KIT-MEDICAO-01",
      "quantidade": 10  // 10 kits
    }
  ]
}
```

**Composição do Kit (KIT-MEDICAO-01):**
```json
{
  "items": [
    { "materialId": "MAT-010", "quantidade": 1 },  // Quadro
    { "materialId": "MAT-011", "quantidade": 3 },  // Disjuntores
    { "materialId": "MAT-012", "quantidade": 10 }  // Cabos
  ]
}
```

**Sistema Expande:**
```
10x Kit precisam:
- MAT-010: 10 unidades (10 x 1)
- MAT-011: 30 unidades (10 x 3)
- MAT-012: 100 unidades (10 x 10)
```

**Baixa de Estoque:**
```
MAT-010 (Quadro): -10 unidades
MAT-011 (Disjuntor): -30 unidades
MAT-012 (Cabo): -100 unidades

Movimentações:
- SAIDA 10 MAT-010 (Motivo: VENDA, Obs: "Baixa automática - Kit KIT-MEDICAO-01")
- SAIDA 30 MAT-011 (Motivo: VENDA, Obs: "Baixa automática - Kit KIT-MEDICAO-01")
- SAIDA 100 MAT-012 (Motivo: VENDA, Obs: "Baixa automática - Kit KIT-MEDICAO-01")
```

---

### Exemplo 3: Orçamento Misto (Materiais + Kits)

**Orçamento ORC-2025-003:**
```json
{
  "items": [
    // Material direto
    {
      "tipo": "MATERIAL",
      "materialId": "MAT-001",
      "quantidade": 50
    },
    // Kit
    {
      "tipo": "KIT",
      "kitId": "KIT-ELETRICO-01",
      "quantidade": 3
    },
    // Serviço (não afeta estoque)
    {
      "tipo": "SERVICO",
      "servicoNome": "Instalação",
      "quantidade": 1
    }
  ]
}
```

**Sistema Processa:**
```
1. Material MAT-001: 50 unidades (direto)

2. Kit KIT-ELETRICO-01 (3x):
   Componentes:
   - MAT-005: 2 cada → 6 total
   - MAT-006: 5 cada → 15 total
   - MAT-001: 10 cada → 30 total  ← Mesmo material!

3. Agrupamento:
   MAT-001: 50 (direto) + 30 (kit) = 80 total
   MAT-005: 6 total
   MAT-006: 15 total

4. Baixa:
   - MAT-001: -80 unidades
   - MAT-005: -6 unidades
   - MAT-006: -15 unidades
   
5. Serviço: Ignorado (não afeta estoque)
```

---

## 🔍 Verificação de Estoque

### Endpoint de Verificação

```bash
GET /api/vendas/estoque/:orcamentoId
```

**Resposta (quando há estoque):**
```json
{
  "success": true,
  "data": {
    "disponivel": true,
    "verificacoes": [
      {
        "tipo": "MATERIAL",
        "materialId": "MAT-001",
        "nome": "Disjuntor 20A",
        "sku": "DJM-20A",
        "quantidadeNecessaria": 100,
        "quantidadeDisponivel": 150,
        "suficiente": true,
        "falta": 0
      },
      {
        "tipo": "KIT_COMPONENTE",
        "materialId": "MAT-002",
        "nome": "Cabo 2.5mm²",
        "sku": "CB-FX-2.5",
        "quantidadeNecessaria": 50,
        "quantidadeDisponivel": 80,
        "suficiente": true,
        "falta": 0,
        "origemKit": "5x Kit"
      }
    ],
    "resumo": {
      "totalItens": 2,
      "itensDisponiveis": 2,
      "itensSemEstoque": 0
    }
  }
}
```

**Resposta (quando FALTA estoque):**
```json
{
  "success": true,
  "data": {
    "disponivel": false,  ← NÃO pode vender!
    "verificacoes": [
      {
        "materialId": "MAT-001",
        "nome": "Disjuntor 20A",
        "quantidadeNecessaria": 200,
        "quantidadeDisponivel": 150,
        "suficiente": false,
        "falta": 50  ← Faltam 50 unidades!
      }
    ],
    "itensSemEstoque": [
      {
        "nome": "Disjuntor 20A",
        "falta": 50
      }
    ],
    "resumo": {
      "totalItens": 3,
      "itensDisponiveis": 2,
      "itensSemEstoque": 1  ← 1 item sem estoque
    }
  }
}
```

---

## 🎨 Frontend Sugerido

### Verificação Antes de Vender

```tsx
const FormularioVenda = () => {
    const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
    const [verificacaoEstoque, setVerificacaoEstoque] = useState(null);
    const [verificando, setVerificando] = useState(false);
    
    // Quando seleciona orçamento, verifica estoque
    const handleSelecionarOrcamento = async (orcamentoId) => {
        setOrcamentoSelecionado(orcamentoId);
        setVerificando(true);
        
        try {
            const response = await fetch(
                `/api/vendas/estoque/${orcamentoId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            const { data } = await response.json();
            setVerificacaoEstoque(data);
            
        } catch (error) {
            console.error('Erro ao verificar estoque:', error);
        } finally {
            setVerificando(false);
        }
    };
    
    return (
        <form>
            {/* Seletor de Orçamento */}
            <select onChange={(e) => handleSelecionarOrcamento(e.target.value)}>
                <option value="">Selecione um orçamento...</option>
                {orcamentosAprovados.map(orc => (
                    <option key={orc.id} value={orc.id}>
                        {orc.id} - {orc.clientName} - R$ {orc.total}
                    </option>
                ))}
            </select>
            
            {/* Status de Verificação */}
            {verificando && (
                <div className="bg-blue-50 border border-blue-200 p-3">
                    <p>🔍 Verificando disponibilidade de estoque...</p>
                </div>
            )}
            
            {/* Resultado da Verificação */}
            {verificacaoEstoque && (
                <div>
                    {verificacaoEstoque.disponivel ? (
                        <div className="bg-green-50 border border-green-200 p-4">
                            <h4 className="font-semibold text-green-900 mb-2">
                                ✅ Estoque Disponível
                            </h4>
                            <p className="text-sm text-green-700">
                                Todos os {verificacaoEstoque.resumo.totalItens} itens 
                                estão disponíveis em estoque.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 p-4">
                            <h4 className="font-semibold text-red-900 mb-2">
                                ❌ Estoque Insuficiente
                            </h4>
                            <p className="text-sm text-red-700 mb-3">
                                {verificacaoEstoque.itensSemEstoque.length} item(ns) 
                                sem estoque suficiente:
                            </p>
                            <ul className="space-y-2">
                                {verificacaoEstoque.itensSemEstoque.map(item => (
                                    <li key={item.materialId} className="text-sm">
                                        <span className="font-semibold">{item.nome}</span>
                                        <br />
                                        <span className="text-red-600">
                                            Faltam: {item.falta} unidades
                                        </span>
                                        <br />
                                        <span className="text-gray-600">
                                            Disponível: {item.quantidadeDisponivel} | 
                                            Necessário: {item.quantidadeNecessaria}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            
            {/* Botão de Venda (desabilitado se sem estoque) */}
            <button 
                type="submit"
                disabled={!verificacaoEstoque?.disponivel}
                className={`px-6 py-2 rounded-lg ${
                    verificacaoEstoque?.disponivel
                        ? 'bg-brand-blue text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                {verificacaoEstoque?.disponivel 
                    ? '💰 Realizar Venda' 
                    : '❌ Estoque Insuficiente'}
            </button>
        </form>
    );
};
```

---

## 🧮 Exemplo Completo: Baixa de Kit

### Cenário Real

**Orçamento:** "Instalação de 3 Quadros de Medição"

```json
{
  "id": "ORC-2025-100",
  "items": [
    {
      "tipo": "KIT",
      "kitId": "KIT-QUADRO-MEDICAO",
      "quantidade": 3  // 3 kits
    }
  ]
}
```

**Composição do Kit:**
```json
{
  "id": "KIT-QUADRO-MEDICAO",
  "nome": "Kit Quadro de Medição Completo",
  "items": [
    { "materialId": "MAT-100", "nome": "Quadro Metálico", "quantidade": 1 },
    { "materialId": "MAT-101", "nome": "Disjuntor Geral 63A", "quantidade": 1 },
    { "materialId": "MAT-102", "nome": "Disjuntor 20A", "quantidade": 4 },
    { "materialId": "MAT-103", "nome": "DPS 40kA", "quantidade": 1 },
    { "materialId": "MAT-104", "nome": "Cabo 10mm²", "quantidade": 20 }
  ]
}
```

---

### Passo 1: Verificar Estoque

```bash
GET /api/vendas/estoque/ORC-2025-100
```

**Resposta:**
```json
{
  "disponivel": true,
  "verificacoes": [
    {
      "tipo": "KIT_COMPONENTE",
      "materialId": "MAT-100",
      "nome": "Quadro Metálico",
      "quantidadeNecessaria": 3,   // 3 kits x 1 quadro
      "quantidadeDisponivel": 15,
      "suficiente": true,
      "falta": 0,
      "origemKit": "3x Kit"
    },
    {
      "tipo": "KIT_COMPONENTE",
      "materialId": "MAT-101",
      "nome": "Disjuntor Geral 63A",
      "quantidadeNecessaria": 3,   // 3 kits x 1 disjuntor geral
      "quantidadeDisponivel": 25,
      "suficiente": true,
      "falta": 0,
      "origemKit": "3x Kit"
    },
    {
      "tipo": "KIT_COMPONENTE",
      "materialId": "MAT-102",
      "nome": "Disjuntor 20A",
      "quantidadeNecessaria": 12,  // 3 kits x 4 disjuntores
      "quantidadeDisponivel": 150,
      "suficiente": true,
      "falta": 0,
      "origemKit": "3x Kit"
    },
    {
      "tipo": "KIT_COMPONENTE",
      "materialId": "MAT-103",
      "nome": "DPS 40kA",
      "quantidadeNecessaria": 3,   // 3 kits x 1 DPS
      "quantidadeDisponivel": 40,
      "suficiente": true,
      "falta": 0,
      "origemKit": "3x Kit"
    },
    {
      "tipo": "KIT_COMPONENTE",
      "materialId": "MAT-104",
      "nome": "Cabo 10mm²",
      "quantidadeNecessaria": 60,  // 3 kits x 20 metros
      "quantidadeDisponivel": 10,
      "suficiente": false,  ❌
      "falta": 50,  ← Problema!
      "origemKit": "3x Kit"
    }
  ],
  "itensSemEstoque": [
    {
      "materialId": "MAT-104",
      "nome": "Cabo 10mm²",
      "falta": 50
    }
  ],
  "resumo": {
    "totalItens": 5,
    "itensDisponiveis": 4,
    "itensSemEstoque": 1
  }
}
```

**Frontend exibe:** "❌ Faltam 50 metros de Cabo 10mm²"

---

### Passo 2: Comprar Material Faltante

```bash
# Comprar 100m de cabo para ter estoque
POST /api/compras
{
  "numeroNF": "NFe-9999",
  "items": [
    {
      "nomeProduto": "Cabo 10mm²",
      "quantidade": 100,
      "valorUnit": 7.50
    }
  ],
  "status": "Recebido"
}
```

**Estoque atualizado:**
```
MAT-104 (Cabo 10mm²): 10 → 110  (+100)
```

---

### Passo 3: Realizar Venda (agora com estoque OK)

```bash
POST /api/vendas/realizar
{
  "orcamentoId": "ORC-2025-100",
  "clienteId": "CLI-001",
  "valorTotal": 45000,
  "parcelas": 1
}
```

**Sistema processa:**
```
1. ✅ Cria venda VND-1729500000000

2. ✅ Gera 1 conta a receber (R$ 45.000)

3. ✅ Expande 3 kits em componentes:
   - MAT-100: 3 unidades
   - MAT-101: 3 unidades
   - MAT-102: 12 unidades
   - MAT-103: 3 unidades
   - MAT-104: 60 unidades

4. ✅ Dá baixa no estoque:
   MAT-100: 15 → 12   (-3)
   MAT-101: 25 → 22   (-3)
   MAT-102: 150 → 138 (-12)
   MAT-103: 40 → 37   (-3)
   MAT-104: 110 → 50  (-60)

5. ✅ Registra 5 movimentações de saída

6. ✅ Retorna sucesso
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "venda": { ... },
    "contasReceber": [ ... ],
    "baixaEstoque": {
      "materiaisProcessados": 5,
      "totalItens": 81,
      "movimentacoes": [ ... ]
    }
  }
}
```

---

## 🔒 Segurança: Transação Atômica

### Vantagem da Transação

```typescript
await prisma.$transaction(async (tx) => {
    // 1. Criar venda
    const venda = await tx.venda.create(...);
    
    // 2. Gerar contas a receber
    const contas = await Promise.all(...);
    
    // 3. Processar estoque
    const estoque = await EstoqueService.processarBaixa(...);
    
    // Se QUALQUER etapa falhar:
    // - TUDO é revertido (rollback)
    // - Venda não é criada
    // - Contas não são criadas
    // - Estoque não é alterado
});
```

**Cenários de rollback:**
- ❌ Estoque insuficiente → Rollback total
- ❌ Erro ao criar conta → Rollback total
- ❌ Erro de banco de dados → Rollback total

**Benefício:** Consistência garantida! ✅

---

## 📋 Histórico de Movimentações

### Rastreamento Completo

```sql
SELECT * FROM movimentacoes_estoque 
WHERE motivo = 'VENDA' 
ORDER BY data DESC;
```

**Resultado:**
```
id  | materialId | tipo   | quantidade | motivo | referencia  | data
----|------------|--------|------------|--------|-------------|-----
M1  | MAT-100    | SAIDA  | 3          | VENDA  | VND-123456  | 2025-10-20
M2  | MAT-101    | SAIDA  | 3          | VENDA  | VND-123456  | 2025-10-20
M3  | MAT-102    | SAIDA  | 12         | VENDA  | VND-123456  | 2025-10-20
```

**Auditoria completa:**
- ✅ Quando saiu
- ✅ Quanto saiu
- ✅ Por que saiu (VENDA)
- ✅ Qual venda (VND-123456)
- ✅ Observações (se houver)

---

## 🎯 Endpoints Atualizados

### Vendas

| Método | Endpoint | Descrição | Novo? |
|--------|----------|-----------|-------|
| `POST` | `/realizar` | Criar venda **+ baixa estoque** | 🔄 Atualizado |
| `GET` | `/estoque/:orcamentoId` | Verificar disponibilidade | ✨ NOVO |
| `GET` | `/` | Listar vendas | ⚪ Mantido |
| `GET` | `/:id` | Buscar venda | ⚪ Mantido |
| `PUT` | `/contas/:id/pagar` | Pagar conta receber | ⚪ Mantido |

---

## 🧪 Testes Sugeridos

### Teste 1: Verificar Estoque

```bash
curl -X GET http://localhost:3001/api/vendas/estoque/ORC-2025-001 \
  -H "Authorization: Bearer TOKEN"

# Ver se todos os materiais estão disponíveis
```

---

### Teste 2: Venda com Estoque OK

```bash
# Realizar venda
curl -X POST http://localhost:3001/api/vendas/realizar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orcamentoId": "ORC-2025-001",
    "clienteId": "CLI-001",
    "valorTotal": 75000,
    "parcelas": 1
  }'

# Ver no Prisma Studio:
# - Tabela vendas: Nova venda
# - Tabela contas_receber: Novas contas
# - Tabela materiais: Estoque reduzido! ✅
# - Tabela movimentacoes_estoque: Registros de saída
```

---

### Teste 3: Venda com Estoque Insuficiente

```bash
# Tentar vender sem estoque
curl -X POST http://localhost:3001/api/vendas/realizar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orcamentoId": "ORC-COM-MUITOS-MATERIAIS",
    "clienteId": "CLI-001",
    "valorTotal": 100000,
    "parcelas": 1
  }'

# Resposta esperada:
{
  "error": "Erro ao processar estoque: Estoque insuficiente:\nDisjuntor 20A: faltam 50 unidades (disponível: 100, necessário: 150)"
}

# Banco de dados NÃO é alterado (rollback)
```

---

## 📊 Tabela: Movimentações de Estoque

### Estrutura

```prisma
model MovimentacaoEstoque {
  id          String   @id @default(uuid())
  materialId  String
  tipo        String   // ENTRADA, SAIDA, AJUSTE
  quantidade  Float
  motivo      String   // COMPRA, VENDA, PROJETO, DEVOLUCAO, AJUSTE
  referencia  String?  // ID da venda, compra, projeto
  observacoes String?
  data        DateTime @default(now())
  
  material Material @relation(fields: [materialId], references: [id])
}
```

### Tipos de Movimentação

| Tipo | Motivo | Quando | Referência |
|------|--------|--------|------------|
| ENTRADA | COMPRA | Recebe materiais | ID da compra |
| SAIDA | **VENDA** | Realiza venda | **ID da venda** ← NOVO! |
| SAIDA | PROJETO | Aloca para obra | ID do projeto |
| SAIDA | AJUSTE | Perda/avaria | - |
| ENTRADA | DEVOLUCAO | Cliente devolve | ID da venda |

---

## 🎓 Boas Práticas Aplicadas

### 1. Verificação Antes de Executar
```typescript
// Sempre verificar estoque ANTES de vender
const verificacao = await verificarEstoque(orcamentoId);

if (!verificacao.disponivel) {
    throw new Error('Estoque insuficiente');
}
```

### 2. Expansão de Kits
```typescript
// Kits são expandidos em componentes
const componentes = await expandirKit(kitId);

// Cada componente tem baixa individual
componentes.forEach(c => darBaixa(c.materialId, c.quantidade));
```

### 3. Agrupamento de Materiais
```typescript
// Se mesmo material aparece várias vezes, agrupar
const agrupados = new Map();

materiais.forEach(m => {
    const qtdAtual = agrupados.get(m.id) || 0;
    agrupados.set(m.id, qtdAtual + m.quantidade);
});
```

### 4. Transação Atômica
```typescript
// Tudo ou nada
await prisma.$transaction(async (tx) => {
    await criarVenda();
    await gerarContas();
    await darBaixaEstoque();  // Se falhar, TUDO é revertido
});
```

---

## 🚀 Arquivos Criados/Modificados

### Criados
1. **backend/src/services/estoque.service.ts** - Lógica de estoque

### Modificados
2. **backend/src/services/vendas.service.ts** - Integração com estoque
3. **backend/src/controllers/vendasController.ts** - Endpoint de verificação
4. **backend/src/routes/vendas.routes.ts** - Rota de verificação

### Documentação
5. **INTEGRACAO_VENDAS_ESTOQUE.md** (este arquivo)

---

## ✅ Status Final

### Ciclo Completo Implementado

```
1. ✅ Cliente aprova orçamento
2. ✅ Sistema verifica estoque disponível
3. ✅ S3E realiza venda
4. ✅ Sistema gera contas a receber (automático)
5. ✅ Sistema dá baixa no estoque (automático)
   - Materiais diretos
   - Kits expandidos
   - Agrupamento inteligente
6. ✅ Sistema registra movimentações
7. ✅ Relatórios atualizam automaticamente
```

### Garantias do Sistema

- ✅ **Transação atômica** - Tudo ou nada
- ✅ **Validação de estoque** - Não vende sem estoque
- ✅ **Expansão de kits** - Componentes corretos
- ✅ **Agrupamento** - Materiais repetidos somados
- ✅ **Rastreabilidade** - Histórico completo
- ✅ **Rollback automático** - Erro reverte tudo

---

**Implementado em 20/10/2025** 📦  
**Sistema S3E Engenharia Elétrica** ⚡

