# 🐛 DEBUG DA IMPORTAÇÃO - Erro 400

## 🔍 **DIAGNÓSTICO DO PROBLEMA**

Baseado nos logs, o problema é:

```
Backend recebeu: { versao: undefined, totalMateriais: 0 }
```

Isso significa que o **JSON está chegando vazio** no backend!

---

## 🧪 **TESTE DIRETO NO NAVEGADOR**

### **1. Teste o Endpoint Diretamente:**

Abra uma nova aba e cole:

```
http://localhost:3000/api/materiais/template-importacao?tipo=todos&formato=json
```

**✅ Deve retornar:**
```json
{
  "versao": "1.0",
  "geradoEm": "2024-11-12T...",
  "empresa": "S3E Engenharia Elétrica",
  "instrucoes": "Atualize...",
  "materiais": [
    {
      "id": "abc-123...",
      "sku": "MAT001",
      ...
    }
  ]
}
```

**❌ Se retornar erro ou vazio:**
- Backend não está gerando JSON corretamente
- Verifique se backend está rodando

---

### **2. Verifique Console do Backend:**

No terminal do backend, você deve ver:

```
📋 Gerando template json com 66 materiais
✅ 66 materiais encontrados
```

**Se NÃO vê isso:**
```bash
# Pare o backend (Ctrl+C)
# Recompile
cd backend
npm run build
npm run dev

# Tente novamente
```

---

## 🔧 **SOLUÇÃO RÁPIDA**

Vou criar um teste simples. Execute este comando:

```bash
# No terminal, na pasta raiz do projeto
curl http://localhost:3000/api/materiais/template-importacao?tipo=todos&formato=json -H "Authorization: Bearer SEU_TOKEN"
```

Substitua `SEU_TOKEN` pelo token que você vê no console do navegador.

**Se retornar JSON válido:** Problema está no frontend  
**Se retornar erro:** Problema está no backend

---

## 📝 **TESTE MANUAL DO JSON**

### **Crie este arquivo manualmente:**

Salve como `teste-manual.json`:

```json
{
  "versao": "1.0",
  "geradoEm": "2024-11-12T15:00:00.000Z",
  "empresa": "S3E Engenharia Elétrica",
  "instrucoes": "Teste manual",
  "materiais": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sku": "TESTE001",
      "nome": "Material de Teste",
      "descricao": "Teste",
      "categoria": "MaterialEletrico",
      "tipo": "Teste",
      "unidadeMedida": "UN",
      "estoque": 10,
      "estoqueMinimo": 5,
      "precoAtual": 10.00,
      "precoNovo": 12.00,
      "ultimaAtualizacao": "2024-11-12T12:37:06.000Z",
      "fornecedor": "Teste",
      "localizacao": "",
      "preco": 10.00
    }
  ]
}
```

**Importante:** Use um SKU que REALMENTE existe no seu banco!

1. Abra Prisma Studio
2. Vá em tabela `Material`
3. Copie o `id` e `sku` de um material real
4. Cole no JSON acima
5. Tente importar este arquivo

---

## 🔍 **VERIFICAR LOGS DETALHADOS**

Após minhas correções, o backend agora loga TUDO. Veja o console:

```
📥 Preview - Recebendo arquivo...
📄 Body: {}
📄 File: {
  fieldname: 'arquivo',
  originalname: 'template-precos-2024-11-12.json',
  filename: 'import-1762968530756-865519955.json',
  size: 45234,
  path: 'C:\\...\\uploads\\temp\\import-1762968530756-865519955.json'
}
📂 Lendo arquivo JSON do disco: C:\\...\\import-1762968530756-865519955.json
📝 Conteúdo do arquivo (primeiros 200 chars): {
  "versao": "1.0",
  "geradoEm": "2024-11-12T15:30:00.000Z",
  "empresa": "S3E Engenharia Elétrica",
  "instrucoes": "Atualize apenas...",
  "materiais": [
    {
      "id": "abc...
```

**Se vê isso:** Backend está lendo corretamente! ✅  
**Se NÃO vê isso:** Problema no upload do arquivo

---

## 🎯 **PASSO A PASSO DO DEBUG:**

### **1. Força refresh no navegador:**
```
Ctrl + Shift + R
ou
Ctrl + F5
```

### **2. Limpe cache:**
```
F12 → Network → Disable cache (marcar checkbox)
```

### **3. Baixe JSON novamente:**
```
📄 JSON → Veja console do navegador

Deve mostrar:
✅ Dados do template: { versao: '1.0', totalMateriais: 66 }
```

### **4. Abra arquivo baixado:**
```
Bloco de Notas → Abrir → template-precos-*.json

✅ Deve ter MUITO conteúdo (não apenas uma linha)
✅ Deve ter array "materiais": [...]
✅ Deve ter 66 objetos dentro do array
```

### **5. Importe arquivo SEM editar:**
```
Importar → Selecionar → Processar

✅ Deve mostrar: "Nenhuma alteração detectada"
(porque todos precoNovo = precoAtual)
```

### **6. Edite 1 material e importe:**
```
Altere um "precoNovo"
Salve
Importe

✅ Deve mostrar: "1 item COM alteração"
```

---

## 💡 **VERIFICAÇÃO DO JSON BAIXADO:**

### O arquivo JSON deve ter esta estrutura EXATA:

```json
{
  "versao": "1.0",
  "geradoEm": "2024-11-12T15:30:00.000Z",
  "empresa": "S3E Engenharia Elétrica",
  "instrucoes": "Atualize apenas o campo \"precoNovo\" de cada material. Não altere os demais campos!",
  "materiais": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sku": "MAT001",
      "nome": "Cabo Flexível 2.5mm",
      "descricao": "Cabo flexível de cobre 2.5mm²",
      "categoria": "MaterialEletrico",
      "tipo": "Fio e Cabo",
      "unidadeMedida": "MT",
      "estoque": 250,
      "estoqueMinimo": 50,
      "precoAtual": 2.5,
      "precoNovo": 2.5,
      "ultimaAtualizacao": "2024-11-12T12:37:06.000Z",
      "fornecedor": "Distribuidora ABC",
      "localizacao": "Prateleira A1",
      "preco": 2.5
    }
  ]
}
```

---

## ⚠️ **CHECKLIST DO JSON:**

Arquivo JSON baixado deve ter:

- [ ] Primeira linha: `{`
- [ ] Campo: `"versao": "1.0"`
- [ ] Campo: `"materiais": [`
- [ ] Pelo menos 1 material no array
- [ ] Cada material tem: id, sku, nome, precoAtual, precoNovo
- [ ] Última linha: `}`
- [ ] Tamanho do arquivo: > 10 KB

**Se qualquer item faltar:** JSON está sendo gerado incorretamente

---

## 🚀 **SOLUÇÃO ALTERNATIVA (Se ainda não funcionar):**

Vou criar um endpoint alternativo que GARANTE retornar JSON correto:

```bash
# Teste este endpoint direto no navegador:
http://localhost:3000/api/materiais?ativo=true

# Deve retornar lista de materiais
# Use isto para criar JSON manual se necessário
```

---

## 📞 **PRÓXIMO PASSO:**

**TESTE AGORA:**

1. **Force refresh** (Ctrl+Shift+R)
2. **Baixe JSON** novamente
3. **Abra no Bloco de Notas**
4. **Veja se tem conteúdo**
5. **Importe SEM editar**
6. **Veja mensagem: "Nenhuma alteração"**
7. **Edite 1 preço**
8. **Importe de novo**
9. **Veja mensagem: "1 item COM alteração"**

Se funcionar: **✅ RESOLVIDO!**  
Se não funcionar: **Me mostre os logs do console do backend**

---

**Logs que preciso ver do backend:**
```
📥 Preview - Recebendo arquivo...
📄 File: { ... }
📂 Lendo arquivo JSON do disco: ...
📝 Conteúdo do arquivo: ...
📄 JSON parseado: { versao: ..., totalMateriais: ... }
```

**Com estes logs, posso identificar EXATAMENTE onde está o problema!**

