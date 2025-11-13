# 💰 Sistema de Gestão Dinâmica de Preços - S3E Engenharia

## 🎯 O Que Foi Implementado?

Um sistema completo e robusto para gerenciar preços de materiais com **validade de 30 dias**, permitindo:

### ✨ Principais Funcionalidades

1. **📄 Exportar Template JSON**
   - Arquivo estruturado com TODOS os seus materiais
   - Pode editar em qualquer editor de texto
   - Formato simples e direto

2. **📑 Exportar PDF Estilizado**
   - Com logo da empresa
   - Para enviar ao fornecedor
   - Abre em nova aba para imprimir

3. **📥 Importar Preços Atualizados**
   - Upload do JSON modificado
   - Preview automático das alterações
   - Confirmação antes de aplicar

4. **🚦 Flags de Validade Automáticas**
   - 🟢 Verde (0-15 dias): Preço OK
   - 🟡 Amarelo (16-27 dias): Atualizar em breve
   - 🔴 Vermelho (28+ dias): URGENTE!

5. **📊 Histórico Completo**
   - Todas alterações de preço salvas
   - Data, valor anterior, valor novo
   - Quem fez a alteração

---

## 🚀 Como Usar (Passo a Passo)

### 1️⃣ Baixar Template de Preços

```
1. Acesse: "Atualização de Preços"
2. Clique no botão: 📄 JSON
3. Arquivo será baixado: template-precos-2024-11-12.json
```

### 2️⃣ Editar Preços no JSON

Abra o arquivo no **Bloco de Notas** ou **VS Code**:

```json
{
  "materiais": [
    {
      "sku": "MAT001",
      "nome": "Cabo Flexível 2.5mm",
      "precoAtual": 2.50,
      "precoNovo": 2.50    ← ALTERE AQUI PARA O NOVO PREÇO
    },
    {
      "sku": "MAT002",
      "nome": "Disjuntor 20A",
      "precoAtual": 15.00,
      "precoNovo": 15.00   ← ALTERE AQUI PARA O NOVO PREÇO
    }
  ]
}
```

**⚠️ IMPORTANTE:** Altere APENAS o campo `"precoNovo"`! Não mexa nos outros campos!

### 3️⃣ Enviar PDF ao Fornecedor (Opcional)

Se preferir que o fornecedor preencha:

```
1. Clique no botão: 📑 PDF
2. PDF abre em nova aba
3. Imprima ou salve
4. Envie ao fornecedor por email
5. Quando receber orçamento, atualize o JSON manualmente
```

### 4️⃣ Importar JSON Atualizado

```
1. Clique: "Importar JSON"
2. Selecione o arquivo editado
3. Clique: "Processar e Visualizar"
4. Revise todas as alterações na tela
5. Clique: "Atualizar Preços"
6. ✅ PRONTO! Preços atualizados!
```

### 5️⃣ Usar Materiais no Orçamento

Ao criar um orçamento e adicionar materiais:

- 🟢 **Verde**: Preço está OK, pode usar tranquilamente
- 🟡 **Amarelo**: Preço está para vencer, verifique se mudou
- 🔴 **Vermelho**: Preço desatualizado, NÃO USE sem atualizar!

**Passe o mouse** sobre a bolinha colorida para ver detalhes!

---

## 📁 Onde Está Tudo?

### Backend
- `backend/src/controllers/materiaisController.ts` - Lógica principal
- `backend/src/routes/materiais.ts` - Rotas da API
- `backend/prisma/schema.prisma` - Estrutura do banco
- `backend/docs/exemplo_template_precos.json` - Exemplo de JSON

### Frontend
- `frontend/src/components/ComparacaoPrecos.tsx` - Página de atualização
- `frontend/src/components/PrecoValidadeFlag.tsx` - Bolinha colorida
- `frontend/src/components/HistoricoPrecosModal.tsx` - Modal de histórico
- `frontend/src/components/MaterialCardComValidade.tsx` - Exemplo completo

### Documentação
- `SISTEMA_ATUALIZACAO_PRECOS.md` - Documentação técnica completa
- `GUIA_RAPIDO_INTEGRACAO.md` - Como integrar em outros componentes
- `README_SISTEMA_PRECOS.md` - Este arquivo (visão geral)

---

## 🛠️ Instalação Inicial

### Passo 1: Aplicar Migration no Banco
```bash
cd backend
npx prisma migrate dev
```

### Passo 2: Inicializar Datas (EXECUTAR UMA VEZ)
```bash
cd backend
npx tsx src/scripts/inicializarDatasPrecos.ts
```

Isto define a data atual para todos os materiais existentes.

### Passo 3: Reiniciar Servidor
```bash
npm run dev
```

### Passo 4: Testar
```
1. Acesse "Atualização de Preços"
2. Baixe o JSON
3. Edite um preço
4. Importe de volta
5. Veja o histórico! 🎉
```

---

## 🎓 Vídeo Tutorial (Passo a Passo)

### Atualizando Preços:

**1. Download do JSON**
```
Interface → Atualização de Preços
         → Botão "📄 JSON"
         → Arquivo baixa automaticamente
```

**2. Edição**
```
Abrir arquivo no Notepad/VS Code
Procurar material desejado pelo SKU ou nome
Alterar apenas o campo "precoNovo"
Salvar arquivo
```

**3. Importação**
```
Interface → "Importar JSON"
         → Selecionar arquivo
         → "Processar e Visualizar"
         → Revisar alterações
         → "Atualizar Preços"
         → ✅ Concluído!
```

**4. Verificação**
```
Interface → Qualquer Material
         → Olhar bolinha colorida ao lado do preço
         → 🟢 = OK
         → 🟡 = Atenção
         → 🔴 = Urgente
         → Passar mouse = Ver detalhes
         → Clicar "Histórico" = Ver todas alterações
```

---

## 🔍 Perguntas Frequentes

### ❓ Como sei que um preço está desatualizado?
Olhe a **bolinha colorida** ao lado do material:
- 🟢 Verde = Atualizado (0-15 dias)
- 🟡 Amarelo = Atualizar em breve (16-27 dias)
- 🔴 Vermelho = Desatualizado (28+ dias)

### ❓ Posso editar o JSON no Excel?
Não recomendado! Excel pode corromper o JSON. Use:
- Notepad (Windows)
- TextEdit (Mac)
- VS Code (Recomendado)
- Notepad++

### ❓ E se eu errar ao editar o JSON?
Sem problemas! O sistema mostra um **preview** antes de aplicar. Se houver erros, ele te avisa!

### ❓ Onde vejo o histórico de um material?
Em qualquer lista de materiais, clique no botão **"📊 Histórico"** ao lado do material.

### ❓ Preciso atualizar todos os materiais de uma vez?
NÃO! Você pode:
- Baixar apenas materiais críticos (estoque baixo)
- Editar apenas os que mudaram de preço
- Importar parcialmente

### ❓ O que acontece se importar um preço errado?
Fique tranquilo! O **histórico** guarda o preço anterior. Você pode:
1. Ver o histórico
2. Verificar o preço antigo
3. Fazer nova importação com o preço correto

---

## 💡 Dicas Profissionais

### 📌 Rotina Recomendada

**Semanalmente:**
- Verificar materiais com flag amarela/vermelha
- Baixar template JSON
- Consultar fornecedores dos materiais críticos

**Mensalmente:**
- Baixar template completo
- Fazer cotação geral com fornecedores
- Importar preços atualizados
- Gerar relatório de variação de preços

**Antes de cada orçamento:**
- Verificar flags dos materiais que vai usar
- Se vermelho, atualizar antes
- Consultar histórico em caso de dúvida

### 🎯 Melhores Práticas

✅ **Mantenha o JSON original** como backup  
✅ **Teste com poucos itens** na primeira vez  
✅ **Consulte o histórico** antes de grandes alterações  
✅ **Use o PDF** para comunicação com fornecedores  
✅ **Atualize regularmente** (antes dos 30 dias)  

❌ **Não edite** IDs ou SKUs no JSON  
❌ **Não use Excel** para editar JSON  
❌ **Não ignore** flags vermelhas em orçamentos  
❌ **Não faça** alterações diretas no banco sem histórico  

---

## 📊 Benefícios do Sistema

### Antes:
- ❌ Preços desatualizados em orçamentos
- ❌ Sem controle de quando preços mudaram
- ❌ Atualização manual e demorada
- ❌ Sem histórico de variações
- ❌ Risco de perder vendas por preços errados

### Agora:
- ✅ Preços sempre atualizados (validade 30 dias)
- ✅ Controle visual de validade (flags coloridas)
- ✅ Atualização em massa rápida (100+ itens em minutos)
- ✅ Histórico completo de todas alterações
- ✅ Orçamentos com preços de mercado
- ✅ Alertas automáticos de preços vencidos
- ✅ Rastreabilidade total

---

## 🎉 Recursos Extras

### 1. Filtrar Materiais Críticos
No template, use:
```
/api/materiais/template-importacao?tipo=criticos&formato=json
```

Retorna apenas materiais com:
- Estoque zerado
- Estoque abaixo do mínimo

### 2. Exportar para Cotação
```
/api/materiais/exportar-criticos?formato=pdf
```

Gera PDF com materiais críticos para enviar ao fornecedor.

### 3. Validar JSON Antes de Importar
Use: https://jsonlint.com/
Cole seu JSON editado e clique "Validate"

---

## 🔒 Segurança e Backup

### O que é salvo no histórico:
- ✅ Preço anterior
- ✅ Preço novo
- ✅ Data e hora da alteração
- ✅ Motivo da alteração
- ✅ Usuário responsável

### Em caso de erro:
1. Consulte o histórico
2. Veja o preço anterior
3. Faça nova importação com preço correto
4. O sistema cria novo registro no histórico

### Backup automático:
O sistema nunca apaga dados! Todo o histórico fica salvo permanentemente.

---

## 📞 Precisa de Ajuda?

1. **Problemas técnicos**: Veja `SISTEMA_ATUALIZACAO_PRECOS.md`
2. **Como integrar em outros componentes**: Veja `GUIA_RAPIDO_INTEGRACAO.md`
3. **Exemplo de JSON**: Veja `backend/docs/exemplo_template_precos.json`
4. **Componente de exemplo**: Veja `frontend/src/components/MaterialCardComValidade.tsx`

---

## 🎊 Pronto para Usar!

O sistema está **100% funcional** e pronto para produção. 

Principais comandos:

```bash
# Backend
cd backend
npx prisma migrate dev                    # Aplicar migration
npx tsx src/scripts/inicializarDatasPrecos.ts  # Inicializar datas
npm run dev                                # Rodar servidor

# Frontend
cd frontend
npm run dev                                # Rodar aplicação
```

Acesse: `http://localhost:5173/` → "Atualização de Preços"

---

## 🌟 Features Destacadas

- 🚦 **Flags Visuais**: Verde/Amarelo/Vermelho
- 📊 **Histórico Completo**: Todas as alterações rastreadas
- 📄 **JSON Simples**: Fácil de editar
- 📑 **PDF Profissional**: Com logo da empresa
- ⚡ **Preview Inteligente**: Veja antes de aplicar
- 🔒 **100% Seguro**: Transações atômicas no banco
- 📈 **Escalável**: Suporta milhares de materiais

---

**Desenvolvido com ❤️ para S3E Engenharia Elétrica**

*Sistema de gestão de preços dinâmicos com validade de 30 dias*

