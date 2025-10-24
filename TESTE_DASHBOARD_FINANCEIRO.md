# 🧪 Guia de Teste - Dashboard Financeiro

## ✅ Pré-requisitos

### 1. **Backend Rodando**
```bash
cd backend
npm run dev
```
✅ Deve aparecer: `🚀 Server running on http://localhost:3001`

### 2. **Frontend Rodando**
```bash
cd frontend
npm run dev
```
✅ Deve aparecer: Link para `http://localhost:5173`

### 3. **Banco de Dados PostgreSQL**
```bash
# Verificar se está rodando
pg_isready

# Ou tentar conectar
psql -U postgres -d s3e_dev
```

---

## 📋 Cenários de Teste

### 🎯 **Cenário 1: Dashboard Vazio (Primeira Vez)**

#### Passo a Passo:
1. Abrir `http://localhost:5173`
2. Fazer login com:
   ```
   Email: admin@s3e.com.br
   Senha: 123456
   ```
3. Navegar para **Financeiro** (menu lateral)
4. Clicar na tab **Dashboard** (primeira tab)

#### ✅ Resultado Esperado:
```
┌────────────────────────────────────────┐
│    📊 Dashboard Financeiro             │
│                                        │
│         📊 (ícone grande)              │
│    Nenhum dado disponível              │
│    Realize vendas para ver gráficos    │
└────────────────────────────────────────┘
```

**Por quê?**
- Sistema está vazio, sem vendas registradas
- Backend retorna array vazio
- Frontend mostra empty state

---

### 🎯 **Cenário 2: Criar Dados de Teste no Backend**

#### Método 1: Via Prisma Studio

```bash
cd backend
npm run prisma:studio:dev
```

1. Abrir `http://localhost:5555`
2. Criar registros em:
   - **Venda** (com `status: 'Concluida'`)
   - **ContaReceber** (com `status: 'Pago'` e `dataPagamento`)
   - **ContaPagar** (com `status: 'Pago'` e `dataPagamento`)

---

#### Método 2: Via API (cURL)

**1. Realizar uma Venda:**
```bash
curl -X POST http://localhost:3001/api/vendas/realizar \
-H "Content-Type: application/json" \
-H "Authorization: Bearer SEU_TOKEN_AQUI" \
-d '{
  "orcamentoId": "id-de-orcamento-aprovado",
  "clienteId": "id-do-cliente",
  "valorTotal": 50000,
  "formaPagamento": "Parcelado",
  "parcelas": 3,
  "valorEntrada": 10000,
  "observacoes": "Venda de teste"
}'
```

**2. Marcar Conta como Paga:**
```bash
curl -X PUT http://localhost:3001/api/vendas/contas-receber/ID_DA_CONTA/pagar \
-H "Content-Type: application/json" \
-H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**3. Criar Conta a Pagar:**
```bash
curl -X POST http://localhost:3001/api/contas-pagar \
-H "Content-Type: application/json" \
-H "Authorization: Bearer SEU_TOKEN_AQUI" \
-d '{
  "descricao": "Compra de materiais",
  "valorParcela": 15000,
  "dataVencimento": "2025-01-15",
  "fornecedorId": "id-do-fornecedor"
}'
```

---

#### Método 3: Script de Seed (Recomendado)

Criar arquivo `backend/src/seed-financeiro.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFinanceiro() {
  // Criar cliente
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'Cliente Teste Financeiro',
      email: 'teste@exemplo.com',
      telefone: '11999999999',
      cpfCnpj: '12345678901'
    }
  });

  // Criar fornecedor
  const fornecedor = await prisma.fornecedor.create({
    data: {
      nome: 'Fornecedor Teste',
      email: 'fornecedor@exemplo.com',
      telefone: '11888888888',
      cnpj: '12345678000190'
    }
  });

  // Criar orçamento
  const orcamento = await prisma.orcamento.create({
    data: {
      numeroOrcamento: 'ORC-TEST-001',
      clienteId: cliente.id,
      valorTotal: 50000,
      status: 'Aprovado',
      dataValidade: new Date('2025-12-31'),
      itens: {
        create: [
          {
            materialId: 'CRIAR_MATERIAL_ANTES',
            quantidade: 10,
            precoUnitario: 5000,
            subtotal: 50000
          }
        ]
      }
    }
  });

  // Criar venda
  const venda = await prisma.venda.create({
    data: {
      numeroVenda: 'VEND-001',
      orcamentoId: orcamento.id,
      clienteId: cliente.id,
      valorTotal: 50000,
      status: 'Concluida',
      formaPagamento: 'Parcelado',
      parcelas: 3,
      valorEntrada: 10000
    }
  });

  // Criar contas a receber (já pagas)
  const hoje = new Date();
  await prisma.contaReceber.create({
    data: {
      vendaId: venda.id,
      descricao: 'Entrada',
      valorParcela: 10000,
      dataVencimento: hoje,
      dataPagamento: hoje,
      status: 'Pago',
      numeroParcela: 1,
      totalParcelas: 3
    }
  });

  await prisma.contaReceber.create({
    data: {
      vendaId: venda.id,
      descricao: 'Parcela 2',
      valorParcela: 20000,
      dataVencimento: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000),
      dataPagamento: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: 'Pago',
      numeroParcela: 2,
      totalParcelas: 3
    }
  });

  // Criar contas a pagar (já pagas)
  await prisma.contaPagar.create({
    data: {
      fornecedorId: fornecedor.id,
      descricao: 'Compra de materiais',
      valorParcela: 15000,
      dataVencimento: hoje,
      dataPagamento: hoje,
      status: 'Pago'
    }
  });

  console.log('✅ Seed financeiro concluído!');
}

seedFinanceiro()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Executar:**
```bash
npx tsx src/seed-financeiro.ts
```

---

### 🎯 **Cenário 3: Dashboard Com Dados**

#### Passo a Passo:
1. Após criar dados (Cenário 2)
2. Atualizar a página do frontend (F5)
3. Navegar para **Financeiro** → **Dashboard**

#### ✅ Resultado Esperado:

```
┌────────────────────────────────────────────────────┐
│  📊 Dashboard Financeiro - Últimos 12 Meses        │
│                                                    │
│  ┌───────────────────────────────────────────┐    │
│  │        [Gráfico de Barras]                │    │
│  │                                           │    │
│  │   🟢 Receitas (Verde)                     │    │
│  │   🔴 Despesas (Vermelho)                  │    │
│  │   🔵 Lucro (Azul)                         │    │
│  │                                           │    │
│  │   Jan  Fev  Mar  Abr  Mai  Jun  ...      │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│  📊 Regime de Caixa:                              │
│  Valores efetivamente pagos/recebidos por mês     │
└────────────────────────────────────────────────────┘
```

**Verificar:**
- ✅ Barras verdes (receitas) aparecendo
- ✅ Barras vermelhas (despesas) aparecendo
- ✅ Barras azuis (lucro = receita - despesa)
- ✅ Tooltip ao passar o mouse
- ✅ Valores formatados em R$

---

### 🎯 **Cenário 4: Testar Endpoint Diretamente**

#### Teste 1: Dados Mensais
```bash
curl -X GET http://localhost:3001/api/relatorios/financeiro \
-H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": [
    {
      "mes": "Jan/2025",
      "receita": 30000.00,
      "despesa": 15000.00,
      "lucro": 15000.00
    }
  ]
}
```

---

#### Teste 2: Resumo Financeiro
```bash
curl -X GET http://localhost:3001/api/relatorios/financeiro/resumo \
-H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta Esperada:**
```json
{
  "success": true,
  "data": {
    "totalReceitas": 50000.00,
    "totalDespesas": 15000.00,
    "lucroTotal": 35000.00,
    "contasReceberPendentes": 20000.00,
    "contasPagarPendentes": 0.00,
    "contasReceberAtrasadas": 0.00,
    "contasPagarAtrasadas": 0.00
  }
}
```

---

## 🐛 Troubleshooting

### Problema 1: "Nenhum dado disponível"

**Causa:** Backend não tem vendas com contas pagas

**Solução:**
1. Verificar no Prisma Studio se existem registros
2. Verificar se `ContaReceber` tem `status: 'Pago'` E `dataPagamento`
3. Executar seed de dados

---

### Problema 2: Erro 401 no Console

**Causa:** Token expirado ou inválido

**Solução:**
1. Fazer logout
2. Fazer login novamente
3. Verificar se o token está sendo enviado no header

---

### Problema 3: Gráfico não aparece

**Causa:** Recharts não instalado

**Solução:**
```bash
cd frontend
npm install recharts
npm run dev
```

---

### Problema 4: CORS Error

**Causa:** Backend bloqueando requisições do frontend

**Solução:**
Verificar em `backend/src/app.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 📊 Checklist de Testes

### Frontend
- [ ] Dashboard carrega sem erros
- [ ] Loading state aparece
- [ ] Empty state aparece quando não há dados
- [ ] Gráfico aparece quando há dados
- [ ] Tooltip funciona ao passar o mouse
- [ ] Valores formatados corretamente (R$)
- [ ] Responsivo (testar em mobile)
- [ ] Tabs funcionam corretamente

### Backend
- [ ] Endpoint `/api/relatorios/financeiro` retorna dados
- [ ] Endpoint `/api/relatorios/financeiro/resumo` retorna resumo
- [ ] Autenticação JWT funciona
- [ ] Dados agregados por mês corretamente
- [ ] Somente contas PAGAS são contabilizadas

### Integração
- [ ] Frontend conecta com backend
- [ ] Dados aparecem no gráfico
- [ ] Cards de resumo mostram valores corretos
- [ ] Erro tratado graciosamente

---

## 🎯 Resultado Final Esperado

### Com Dados:
- ✅ Gráfico interativo com 3 barras (receita/despesa/lucro)
- ✅ Últimos 12 meses visíveis
- ✅ Valores formatados em R$
- ✅ Tooltip ao hover
- ✅ Loading state

### Sem Dados:
- ✅ Mensagem clara "Nenhum dado disponível"
- ✅ Instrução para o usuário
- ✅ Empty state bonito

---

## 📞 Contato

Se encontrar problemas, verificar:
1. Console do navegador (F12)
2. Console do backend
3. Logs do PostgreSQL
4. Documentação: `DASHBOARD_FINANCEIRO_FRONTEND.md`

---

**Status:** ✅ **PRONTO PARA TESTES**
**Data:** 20/10/2025

