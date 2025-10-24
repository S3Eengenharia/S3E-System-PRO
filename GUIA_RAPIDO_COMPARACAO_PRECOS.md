# 🚀 Guia Rápido - Comparação de Preços

## ⚡ Como Usar em 5 Passos

### **Passo 1: Acessar a Funcionalidade** 📊
1. Faça login no S3E System
2. Clique em **"Comparação de Preços"** na sidebar (ícone de carrinho)

---

### **Passo 2: Importar CSV** 📤
1. Clique no botão **"Importar CSV"** (canto superior direito)
2. Preencha o nome do fornecedor (ex: "Eletro Materiais XYZ")
3. Clique em **"Clique para selecionar o arquivo"**
4. Selecione o arquivo CSV do fornecedor
5. Clique em **"Processar e Comparar"**

---

### **Passo 3: Analisar Comparação** 🔍
Você verá 4 cards com estatísticas:
- **Total de Itens**: Quantidade de materiais
- **Valor Total**: Custo total da compra
- **💰 Economia Total**: Quanto você economizaria (verde)
- **📈 Aumento Total**: Quanto a mais você pagaria (vermelho)

Abaixo, uma tabela mostra item por item:
- 🟢 **Verde** = Preço menor que a última compra
- 🔴 **Vermelho** = Preço maior que a última compra
- 🔵 **Azul** = Preço igual
- ⚪ **Cinza** = Sem histórico de compra

---

### **Passo 4: Filtrar e Buscar** 🔎
- **Busca**: Digite o nome ou código do material na barra de busca
- **Filtro**: Selecione o status desejado no dropdown
  - "Preço Menor" = Mostra só os itens mais baratos
  - "Preço Maior" = Mostra só os itens mais caros
  - etc.

---

### **Passo 5: Criar Orçamento** 📝
1. Após analisar, clique em **"Criar Orçamento com Estes Preços"**
2. O sistema te levará para a página de **Orçamentos**
3. Os dados já estarão pré-preenchidos com os novos preços
4. Finalize o orçamento normalmente

---

## 📋 Arquivo CSV de Exemplo

Use o arquivo `exemplo_orcamento_fornecedor.csv` incluído no projeto para testar!

**Formato esperado:**
```csv
codigo,nome,unidade,quantidade,preco_unitario
MAT-001,Cabo 2.5mm² - Rolo 100m,Rolo,5,295.00
MAT-002,Disjuntor 20A Bipolar,Unidade,10,42.50
```

### **Colunas obrigatórias:**
- `codigo`: Código do material
- `nome`: Nome/descrição
- `unidade`: Unidade de medida (Unidade, Rolo, Barra, etc)
- `quantidade`: Quantidade solicitada
- `preco_unitario`: Preço por unidade (use ponto, não vírgula)

---

## 💡 Dicas de Uso

### **🎯 Quando usar:**
- Ao receber orçamento de fornecedor
- Para comparar preços de diferentes fornecedores
- Antes de fazer compras grandes
- Para análise de variação de preços

### **✅ Boas práticas:**
- Sempre preencha o nome do fornecedor corretamente
- Mantenha os códigos de material padronizados
- Analise a justificativa de aumentos significativos
- Compare múltiplos fornecedores importando vários CSVs

### **⚠️ Atenção:**
- Apenas arquivos **.csv** são aceitos
- Use **ponto** (.) como separador decimal, não vírgula
- Os códigos devem corresponder aos do seu sistema
- Itens sem histórico aparecerão como "Novo"

---

## 🔄 Histórico de Importações

Todas as comparações ficam salvas! Para acessá-las:
1. Clique em "Voltar" na tela de comparação
2. Role para baixo até "Importações Anteriores"
3. Clique na importação que deseja revisar

---

## 🎨 Entendendo as Cores

| Cor | Significado | Ação Sugerida |
|-----|-------------|---------------|
| 🟢 **Verde** | Preço menor | Bom momento para comprar! |
| 🔴 **Vermelho** | Preço maior | Negociar com fornecedor |
| 🔵 **Azul** | Preço igual | Preço estável |
| ⚪ **Cinza** | Sem histórico | Primeiro pedido deste item |

---

## ❓ Problemas Comuns

### **Arquivo não é aceito**
- ✅ Verifique se é .csv
- ✅ Verifique se tem as colunas corretas

### **Preços não aparecem**
- ✅ Use ponto (.) como decimal, não vírgula (,)
- ✅ Não use símbolo de R$ no CSV

### **Códigos não batem**
- ✅ Confira se os códigos do CSV correspondem aos do sistema
- ✅ Padronize os códigos (ex: sempre "MAT-XXX")

---

## 📞 Fluxo Completo do Dia a Dia

```
1. ENGENHEIRO FAZ LEVANTAMENTO
   → Lista materiais necessários para obra
   
2. ENVIA PARA FORNECEDOR
   → CSV só com códigos e quantidades (sem preços)
   
3. FORNECEDOR PREENCHE PREÇOS
   → Retorna CSV com preços preenchidos
   
4. UPLOAD NO SISTEMA
   → Importar na tela "Comparação de Preços"
   
5. ANÁLISE
   → Ver quais itens subiram/baixaram
   → Decidir se aceita ou negocia
   
6. CRIAR ORÇAMENTO
   → Gerar orçamento para cliente final
   → Aguardar aprovação
```

---

## 🎉 Exemplo Prático

**Situação:**
Você precisa comprar materiais para uma obra e recebeu orçamento do fornecedor "Eletro Materiais XYZ".

**Passos:**
1. ✅ Abrir "Comparação de Preços"
2. ✅ Clicar "Importar CSV"
3. ✅ Fornecedor: "Eletro Materiais XYZ"
4. ✅ Selecionar arquivo: `orcamento_xyz_2024.csv`
5. ✅ Clicar "Processar e Comparar"

**Resultado:**
```
📊 COMPARAÇÃO REALIZADA

Total de Itens: 10
Valor Total: R$ 4.582,50

💰 Economia Total: R$ 75,00 (3 itens)
📈 Aumento Total: R$ 120,00 (2 itens)

Diferença Líquida: +R$ 45,00 (1% de aumento)
```

**Decisão:**
- ✅ Cabos: Preço menor → Comprar!
- ⚠️ Quadros: Preço maior → Negociar
- 📝 Criar orçamento com valores ajustados

---

## ⚡ Atalhos

- **Busca rápida**: Digite e os resultados aparecem instantaneamente
- **Filtro por status**: Veja só o que te interessa
- **Voltar**: Mantém os dados salvos, pode revisar depois
- **Múltiplas importações**: Compare fornecedores diferentes

---

## 📊 Entendendo os Cálculos

### **Diferença Percentual:**
```
((Novo Preço - Preço Atual) / Preço Atual) × 100
```

### **Economia/Aumento Total:**
```
Soma de (Diferença × Quantidade) para cada item
```

### **Exemplo:**
```
Item: Cabo 2,5mm²
Preço Atual: R$ 285,00
Novo Preço: R$ 295,00
Quantidade: 5

Diferença: R$ 10,00 (3,5%)
Aumento Total: R$ 10,00 × 5 = R$ 50,00
```

---

## 🎓 Recursos Avançados

### **Comparar Múltiplos Fornecedores:**
1. Importar CSV do Fornecedor A
2. Voltar e importar CSV do Fornecedor B
3. Voltar e importar CSV do Fornecedor C
4. Acessar cada comparação no histórico
5. Escolher o melhor custo-benefício

### **Análise de Tendência:**
- Compare importações do mesmo fornecedor ao longo do tempo
- Identifique padrões de aumento/redução
- Planeje compras estratégicas

---

## ✅ Checklist de Uso

Antes de criar o orçamento final:

- [ ] Todos os códigos estão corretos?
- [ ] Quantidades estão corretas?
- [ ] Preços parecem razoáveis?
- [ ] Aumentos significativos foram justificados?
- [ ] Já tentou negociar itens mais caros?
- [ ] Comparou com outros fornecedores?
- [ ] Cliente aprovou o valor final?

---

## 🎁 Benefícios

### **Para o Comprador:**
- ✅ Economia de tempo (comparação automática)
- ✅ Decisões baseadas em dados
- ✅ Controle de custos
- ✅ Histórico rastreável

### **Para a Empresa:**
- ✅ Redução de custos
- ✅ Negociações informadas
- ✅ Auditoria de preços
- ✅ Processo padronizado

---

**🎉 Pronto! Agora você está pronto para usar a Comparação de Preços!**

💡 **Dica Final:** Mantenha seus códigos de material sempre padronizados para facilitar as comparações futuras!

---

**Dúvidas?** Consulte a documentação completa em `COMPARACAO_PRECOS_DOCUMENTACAO.md`

