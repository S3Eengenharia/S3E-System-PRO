# ✏️ Adição de Itens Manuais ao Orçamento

## ✅ Funcionalidade Implementada com Sucesso!

Agora é possível adicionar itens ao orçamento **mesmo sem ter no estoque**!

---

## 🎯 Problema Resolvido

### ANTES (Limitação)
- ❌ Só podia adicionar materiais que **já estavam no estoque**
- ❌ Orçamentos dependiam de compra prévia
- ❌ Não refletia o fluxo real de trabalho

### Fluxo Real da Empresa
```
1. Cliente solicita orçamento
2. Empresa busca preços com fornecedores
3. Cria orçamento com base nas cotações
4. Cliente aprova o orçamento
5. SÓ ENTÃO: Compra os materiais
```

### DEPOIS (Solução)
- ✅ Pode adicionar **itens do estoque** (materiais já comprados)
- ✅ Pode adicionar **itens manuais** (cotações de fornecedores)
- ✅ **Ambas as opções** disponíveis no mesmo modal
- ✅ **Flexibilidade total** na criação de orçamentos

---

## 🎨 Interface Implementada

### Modal com 2 Abas

```
┌────────────────────────────────────────────────┐
│  Adicionar Item ao Orçamento              ❌   │
│  ┌──────────────┐  ┌─────────────────────┐    │
│  │ 📦 Do Estoque│  │ ✏️ Criar Manualmente │    │
│  └──────────────┘  └─────────────────────┘    │
├────────────────────────────────────────────────┤
│                                                │
│  [Conteúdo da aba ativa]                      │
│                                                │
├────────────────────────────────────────────────┤
│              [Cancelar]  [Adicionar Item]      │
└────────────────────────────────────────────────┘
```

---

## 📦 ABA 1: Do Estoque (Existente - Mantida)

### O Que Faz
- Lista materiais que **já estão no estoque**
- Mostra: Nome, SKU, Estoque disponível, Custo

### Como Usar
1. Clique em "Adicionar Item"
2. Aba "📦 Do Estoque" já está selecionada
3. Digite na busca para filtrar
4. Clique no material desejado
5. ✅ Item adicionado automaticamente!

### Informações Automaticamente Preenchidas
- ✅ Nome do material
- ✅ Unidade de medida
- ✅ Custo unitário (do cadastro)
- ✅ Vínculo com material no estoque (materialId)
- ✅ Preço de venda (custo + BDI)

---

## ✏️ ABA 2: Criar Manualmente (NOVA)

### O Que Faz
- Permite criar item **sem vincular ao estoque**
- Ideal para cotações de fornecedores
- Campos totalmente personalizáveis

### Como Usar
1. Clique em "Adicionar Item"
2. Clique na aba **"✏️ Criar Manualmente"**
3. Preencha os campos:
   - **Tipo**: Material, Serviço, Kit ou Custo Extra
   - **Nome**: Ex: "Disjuntor 32A Tripolar"
   - **Descrição Técnica**: Especificações (opcional)
   - **Unidade**: UN, M, M², KG, L, etc. (11 opções)
   - **Quantidade**: Quantidade necessária
   - **Custo Unitário**: Valor da cotação do fornecedor
4. Veja o **preview do cálculo** em tempo real
5. Clique em **"Adicionar Item"**
6. ✅ Item adicionado ao orçamento!

### Campos Disponíveis

#### Tipo de Item
- **Material** - Materiais elétricos, componentes
- **Serviço** - Mão de obra, instalações
- **Kit** - Conjunto de materiais
- **Custo Extra** - Despesas adicionais

#### Unidades de Medida (11 opções)
- UN (Unidade)
- M (Metro)
- M² (Metro Quadrado)
- M³ (Metro Cúbico)
- KG (Quilograma)
- L (Litro)
- CX (Caixa)
- PC (Peça)
- SERV (Serviço)
- HR (Hora)
- VERBA (Verba)

---

## 💡 Preview de Cálculo em Tempo Real

Ao preencher **Custo Unitário** e **Quantidade**, o sistema mostra automaticamente:

```
┌──────────────────────────────────────────────┐
│  💡 Preview do Cálculo                       │
├──────────────────────────────────────────────┤
│  Custo Total:       R$ 455,00                │
│  Preço Unit. (BDI): R$ 54,60  (↑ 20%)       │
│  Preço Total:       R$ 546,00                │
└──────────────────────────────────────────────┘
```

**Cálculo Automático**:
- **Custo Total** = Custo Unit. × Quantidade
- **Preço Unit.** = Custo Unit. × (1 + BDI%)
- **Preço Total** = Preço Unit. × Quantidade

---

## 🎯 Casos de Uso

### Caso 1: Orçamento com Cotação de Fornecedor
**Cenário**: Cliente pede orçamento, você cotou com fornecedor mas ainda não comprou

**Como fazer**:
1. Criar novo orçamento
2. Clicar em "Adicionar Item"
3. Aba **"✏️ Criar Manualmente"**
4. Preencher:
   - Nome: "Disjuntor 32A Tripolar Schneider"
   - Descrição: "DIN 10kA curva C"
   - Unidade: UN
   - Quantidade: 10
   - Custo: R$ 45,50 (preço do fornecedor)
5. Adicionar
6. ✅ Item no orçamento sem afetar estoque!

### Caso 2: Orçamento Misto (Estoque + Cotação)
**Cenário**: Alguns materiais você tem, outros precisa comprar

**Como fazer**:
1. Adicionar itens do estoque:
   - Aba "📦 Do Estoque"
   - Buscar e adicionar itens disponíveis
   
2. Adicionar itens cotados:
   - Aba "✏️ Criar Manualmente"
   - Criar itens baseados em cotações
   
3. ✅ Orçamento completo com ambos os tipos!

### Caso 3: Serviço de Mão de Obra
**Cenário**: Adicionar serviço de instalação

**Como fazer**:
1. Clicar em "Adicionar Item"
2. Aba "✏️ Criar Manualmente"
3. Preencher:
   - Tipo: **Serviço**
   - Nome: "Instalação de Quadro Elétrico"
   - Descrição: "Instalação completa com teste"
   - Unidade: SERV
   - Quantidade: 1
   - Custo: R$ 500,00
4. ✅ Serviço adicionado!

### Caso 4: Kit Completo
**Cenário**: Orçar um kit de materiais

**Como fazer**:
1. Aba "✏️ Criar Manualmente"
2. Tipo: **Kit**
3. Nome: "Kit Iluminação LED Completo"
4. Descrição: "Inclui lâmpadas, reatores e fiação"
5. Custo: R$ 1.200,00
6. ✅ Kit no orçamento!

---

## 🔄 Diferenças Entre os Modos

### 📦 Do Estoque
| Característica | Valor |
|----------------|-------|
| **Fonte** | Materiais cadastrados |
| **Validação** | Verifica estoque disponível |
| **Vínculo** | Tem `materialId` |
| **Custo** | Do cadastro do material |
| **Quando usar** | Materiais já comprados |

### ✏️ Criar Manualmente
| Característica | Valor |
|----------------|-------|
| **Fonte** | Digitado pelo usuário |
| **Validação** | Apenas campos obrigatórios |
| **Vínculo** | Sem `materialId` |
| **Custo** | Digitado manualmente |
| **Quando usar** | Cotações, materiais a comprar |

---

## 💡 Fluxo de Trabalho Recomendado

### Para Orçamentos Novos
```
1. Cliente solicita orçamento
   ↓
2. Verificar: Temos os materiais?
   ├─ SIM → Usar "📦 Do Estoque"
   └─ NÃO → Cotar com fornecedor
              ↓
              Usar "✏️ Criar Manualmente"
   ↓
3. Adicionar todos os itens ao orçamento
   ↓
4. Sistema calcula total com BDI
   ↓
5. Gerar PDF personalizado
   ↓
6. Enviar para cliente
   ↓
7. Cliente aprova?
   ├─ SIM → Fazer compra dos materiais
   │         Dar entrada no estoque
   │         Criar projeto/obra
   └─ NÃO → Arquivar orçamento
```

---

## ⚙️ Detalhes Técnicos

### Validações Implementadas
- ✅ Nome obrigatório
- ✅ Custo unitário > 0
- ✅ Quantidade > 0
- ✅ Unidade de medida obrigatória

### Cálculo Automático
```typescript
const precoUnit = custoUnit * (1 + bdi / 100);
const subtotal = precoUnit * quantidade;
```

### Estrutura do Item Manual
```typescript
{
  tipo: 'MATERIAL' | 'SERVICO' | 'KIT' | 'CUSTO_EXTRA',
  nome: string,               // Digitado pelo usuário
  descricao?: string,         // Opcional
  unidadeMedida: string,      // Selecionado
  quantidade: number,         // Digitado
  custoUnit: number,          // Digitado (custo real)
  precoUnit: number,          // Calculado (custo + BDI)
  subtotal: number,           // Calculado (preço × qtd)
  materialId: undefined       // Sem vínculo ao estoque
}
```

---

## 🎨 Interface Visual

### Aba "Do Estoque"
```
┌──────────────────────────────────────┐
│  🔍 [Buscar material...]             │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ Disjuntor 20A Bipolar          │  │
│  │ SKU: MAT-001 • Estoque: 50 UN  │  │
│  │ Custo: R$ 25,00                │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Cabo 2,5mm² Flexível          │  │
│  │ SKU: MAT-002 • Estoque: 200 M  │  │
│  │ Custo: R$ 3,50/M               │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Aba "Criar Manualmente"
```
┌──────────────────────────────────────┐
│  💡 Dica: Use para materiais cotados │
│     mas ainda não comprados          │
├──────────────────────────────────────┤
│  Tipo: [Material ▼]                  │
│  Nome: [_____________________]       │
│  Descrição: [________________]       │
│  Unidade: [UN ▼]  Qtd: [___]         │
│  Custo Unitário: [R$ _____]          │
│  ┌────────────────────────────────┐  │
│  │ Preview do Cálculo             │  │
│  │ Custo Total: R$ 455,00         │  │
│  │ Preço Unit.: R$ 54,60 (↑20%)   │  │
│  │ Preço Total: R$ 546,00         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 🚀 Como Usar (Passo a Passo)

### Adicionar Item Manual

#### 1. Abrir o Modal
- Na página "Novo Orçamento"
- Seção "Itens do Orçamento"
- Clicar em **"+ Adicionar Item"**

#### 2. Selecionar Modo Manual
- Clicar na aba **"✏️ Criar Manualmente"**

#### 3. Preencher Informações
- **Tipo**: Escolher tipo apropriado
- **Nome**: Nome do material/serviço
- **Descrição**: Detalhes técnicos (opcional)
- **Unidade**: Selecionar unidade de medida
- **Quantidade**: Quantidade necessária
- **Custo Unitário**: Valor da cotação

#### 4. Revisar Preview
- Sistema mostra cálculo automático
- Verifica se valores estão corretos

#### 5. Adicionar
- Clicar em **"Adicionar Item"**
- Item aparece na lista

#### 6. Ajustar se Necessário
- Pode editar quantidade após adicionar
- Pode remover item se necessário

---

## 💰 Cálculo Automático de Preços

### Fórmulas Aplicadas

**Preço Unitário de Venda**:
```
Preço Unit. = Custo Unit. × (1 + BDI ÷ 100)
```

**Exemplo com BDI de 20%**:
- Custo: R$ 45,50
- BDI: 20%
- Preço: R$ 45,50 × 1,20 = **R$ 54,60**

**Subtotal do Item**:
```
Subtotal = Preço Unit. × Quantidade
```

**Exemplo**:
- Preço Unit.: R$ 54,60
- Quantidade: 10
- Subtotal: **R$ 546,00**

---

## 🎯 Tipos de Itens Disponíveis

### 1. MATERIAL
**Quando usar**: Componentes, materiais elétricos, insumos
**Exemplos**:
- Disjuntores
- Cabos elétricos
- Tomadas e interruptores
- Eletrodutos
- Quadros elétricos

### 2. SERVICO
**Quando usar**: Mão de obra, instalações, serviços técnicos
**Exemplos**:
- Instalação elétrica
- Manutenção preventiva
- Projeto elétrico
- Laudo técnico
- Inspeção

### 3. KIT
**Quando usar**: Conjunto de materiais vendidos juntos
**Exemplos**:
- Kit iluminação LED completo
- Kit quadro medidor
- Kit instalação residencial
- Kit ferramentas

### 4. CUSTO_EXTRA
**Quando usar**: Despesas adicionais, custos indiretos
**Exemplos**:
- Transporte
- Hospedagem
- Alimentação de equipe
- Taxa de urgência
- Licenças e alvarás

---

## 📋 Campos do Formulário Manual

### Obrigatórios (*)
- ✅ **Tipo de Item** - Dropdown com 4 opções
- ✅ **Nome** - Input de texto (máx. recomendado: 100 caracteres)
- ✅ **Unidade de Medida** - Dropdown com 11 opções
- ✅ **Quantidade** - Input numérico (min: 0.01, step: 0.01)
- ✅ **Custo Unitário** - Input numérico (min: 0, step: 0.01)

### Opcionais
- ⭐ **Descrição Técnica** - Textarea (2 linhas)

---

## 🔄 Comparação: Estoque vs Manual

| Aspecto | Do Estoque | Criar Manualmente |
|---------|------------|-------------------|
| **Vínculo** | Sim (materialId) | Não |
| **Estoque** | Verifica disponibilidade | Não verifica |
| **Custo** | Do cadastro | Digite você |
| **Nome** | Do cadastro | Digite você |
| **Descrição** | Do cadastro | Digite você |
| **Unidade** | Do cadastro | Escolha você |
| **Velocidade** | Rápido (1 clique) | Manual (preencher form) |
| **Quando usar** | Material já comprado | Material a comprar |

---

## 💡 Dicas de Uso

### ✅ Boas Práticas

1. **Use "Do Estoque" quando possível**
   - Mais rápido
   - Dados consistentes
   - Vincula ao estoque

2. **Use "Manual" para cotações**
   - Materiais não comprados
   - Preços de fornecedores
   - Serviços externos

3. **Preencha descrição técnica**
   - Ajuda na compra futura
   - Fica no PDF do orçamento
   - Cliente entende melhor

4. **Confira o preview do cálculo**
   - Garante valores corretos
   - Evita erros de digitação

5. **Escolha unidade correta**
   - Importante para cálculo
   - Fica no orçamento

### ⚠️ Atenções

1. **Custo sem BDI**
   - Digite o custo REAL (do fornecedor)
   - Sistema aplica BDI automaticamente

2. **Não confundir custo e preço**
   - Custo = o que você paga
   - Preço = o que você cobra (custo + BDI)

3. **Validar cotações**
   - Confirme preços com fornecedor
   - Verifique validade da cotação

4. **Items manuais não movimentam estoque**
   - São apenas para orçamento
   - Após aprovação, compre e dê entrada

---

## 🎨 Benefícios da Implementação

### Para a Empresa
- ✅ **Mais agilidade**: Orçamentos sem depender de compra prévia
- ✅ **Menos risco**: Não compra antes de aprovar
- ✅ **Flexibilidade**: Pode cotar com vários fornecedores
- ✅ **Realismo**: Fluxo de trabalho real

### Para o Orçamentista
- ✅ **Facilidade**: Criar orçamento rapidamente
- ✅ **Opções**: Estoque OU manual OU ambos
- ✅ **Preview**: Vê cálculos em tempo real
- ✅ **Organização**: Sistema ajuda a calcular

### Para o Cliente
- ✅ **Orçamento rápido**: Não precisa esperar compra
- ✅ **Detalhes**: Descrições técnicas completas
- ✅ **Profissional**: PDF bem formatado

---

## 📊 Exemplo Prático

### Orçamento: Instalação Elétrica Residencial

**Itens do Estoque** (já comprados):
```
📦 Do Estoque:
1. Cabo 2,5mm² - 100M - R$ 350,00
2. Tomadas 10A - 20UN - R$ 180,00
```

**Itens Manuais** (a comprar após aprovação):
```
✏️ Criar Manualmente:
1. Disjuntor Geral 63A - 1UN - R$ 250,00 (Fornecedor A)
2. Quadro Distribuição 12 Circuitos - 1UN - R$ 450,00 (Fornecedor B)
3. Instalação Completa - 1SERV - R$ 800,00 (Mão de obra)
```

**Total do Orçamento**: R$ 2.400,00 (com BDI)

**Após Aprovação**:
- Comprar itens 1, 2 (materiais)
- Contratar item 3 (serviço)
- Executar obra

---

## 🔧 Detalhes Técnicos

### Estado do Componente
```typescript
const [modoAdicao, setModoAdicao] = useState<'estoque' | 'manual'>('estoque');
const [novoItemManual, setNovoItemManual] = useState({
    nome: '',
    descricao: '',
    unidadeMedida: 'UN',
    quantidade: 1,
    custoUnit: 0,
    tipo: 'MATERIAL'
});
```

### Função de Adicionar
```typescript
const handleAddItemManual = () => {
    // Validações
    if (!novoItemManual.nome.trim()) return alert('Digite o nome');
    if (novoItemManual.custoUnit <= 0) return alert('Digite custo');
    if (novoItemManual.quantidade <= 0) return alert('Digite quantidade');
    
    // Calcular preço com BDI
    const precoUnit = novoItemManual.custoUnit * (1 + formState.bdi / 100);
    
    // Criar item
    const newItem = {
        tipo: novoItemManual.tipo,
        nome: novoItemManual.nome,
        descricao: novoItemManual.descricao,
        unidadeMedida: novoItemManual.unidadeMedida,
        quantidade: novoItemManual.quantidade,
        custoUnit: novoItemManual.custoUnit,
        precoUnit: precoUnit,
        subtotal: precoUnit * novoItemManual.quantidade
    };
    
    // Adicionar à lista
    setItems(prev => [...prev, newItem]);
};
```

---

## ✅ Funcionalidades Mantidas

- ✅ **Importar do estoque** - Funciona normalmente
- ✅ **Editar quantidade** - Após adicionar
- ✅ **Remover item** - Qualquer tipo de item
- ✅ **Cálculo de BDI** - Aplicado automaticamente
- ✅ **Cálculo de totais** - Subtotal, desconto, impostos
- ✅ **Dark mode** - 100% compatível

---

## 🎉 Resultado

**Funcionalidade 100% Implementada!**

Agora você pode criar orçamentos:
- ✅ **Com materiais do estoque** (já comprados)
- ✅ **Com materiais cotados** (a comprar)
- ✅ **Com serviços** (mão de obra)
- ✅ **Com kits** (conjuntos)
- ✅ **Com custos extras** (despesas)
- ✅ **Misturando tudo!** (flexibilidade total)

**O sistema agora reflete o fluxo real de trabalho da empresa!** 🚀

---

**Desenvolvido por**: Cursor AI Assistant  
**Data**: 07/11/2024  
**Status**: ✅ Funcional  
**Impacto**: 🌟 Alto (melhora significativa no fluxo)

