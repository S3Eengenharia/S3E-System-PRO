# 🧪 Guia de Testes Completo - S3E System

**Objetivo:** Validar todas as funcionalidades implementadas  
**Tempo Estimado:** 30-45 minutos  
**Requisitos:** Backend e Frontend rodando

---

## 🚀 Preparação do Ambiente

### Passo 1: Iniciar Backend
```bash
cd backend
npm run dev
```
**Esperado:** Servidor rodando em http://localhost:3000

### Passo 2: Iniciar Frontend
```bash
cd frontend
npm run dev
```
**Esperado:** Aplicação rodando em http://localhost:5174

### Passo 3: Verificar Saúde da API
```bash
curl http://localhost:3000/health
```
**Esperado:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T21:45:30.000Z"
}
```

---

## 📋 Checklist de Testes

### ✅ Módulo 1: Autenticação

#### Teste 1.1: Login (Mock)
1. Acesse http://localhost:5174
2. **Esperado:** Sistema carrega normalmente com dados mock

#### Teste 1.2: Login (API) - Se Backend Integrado
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@s3e.com",
    "password": "senha123"
  }'
```
**Esperado:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "nome": "Administrador",
    "email": "admin@s3e.com",
    "role": "admin"
  }
}
```

---

### ✅ Módulo 2: Catálogo e Kits

#### Teste 2.1: Visualizar Catálogo
1. Clique em "Catálogo" no menu
2. **Esperado:** 
   - Cards sem imagens ✅
   - Headers com gradientes ✅
   - Botões "Criar Kit" e "Criar Quadros" ✅

#### Teste 2.2: Criar Kit Personalizado
1. Clique em "Criar Kit"
2. Preencha:
   - Nome: "Kit Teste"
   - Descrição: "Kit de teste completo"
3. Adicione materiais:
   - Digite "cabo" no campo de busca
   - Selecione um item
   - Defina quantidade: 10
   - Clique em "Inserir"
4. Configure margem de lucro: 20%
5. **Esperado:**
   - Custo total calculado automaticamente ✅
   - Preço de venda = custo + margem ✅
6. Clique em "Salvar Kit"
7. **Esperado:** Novo kit aparece na listagem ✅

#### Teste 2.3: Kit Subestações
1. Clique em "Kit Subestações"
2. Etapa 1: Selecione "Subestação Aérea"
3. Etapa 2: Preencha:
   - Nome: "Subestação 150kVA"
   - Descrição: "Teste"
4. Etapa 3: Configure materiais
   - Posto de Transformação: Adicione transformador
   - Aterramento: Adicione hastes
   - Iluminação: Adicione luminárias
5. **Esperado:** 
   - Materiais listados por tópico ✅
   - Total calculado ✅
6. Clique em "Salvar como Rascunho"
7. **Esperado:** Mensagem "Rascunho salvo" ✅
8. Feche o modal e reabra
9. **Esperado:** Dados restaurados do rascunho ✅

---

### ✅ Módulo 3: Materiais

#### Teste 3.1: Visualizar Lista de Materiais
1. Clique em "Materiais" no menu
2. **Esperado:**
   - Cards com informações visíveis ✅
   - SKU, Valor, Estoque, Localização ✅
   - Sem imagens ✅

#### Teste 3.2: Modal de Visualização
1. Clique em qualquer material
2. **Esperado:**
   - Modal moderno com gradiente verde ✅
   - Grid de informações ✅
   - Cards de Preço, Estoque, Localização ✅
   - Valor total em estoque calculado ✅

#### Teste 3.3: Adicionar Material (Se Backend Integrado)
```bash
curl -X POST http://localhost:3000/api/materiais \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Cabo Teste 10mm",
    "descricao": "Cabo de teste",
    "sku": "CABO-10MM-TESTE",
    "categoria": "Cabos",
    "valorUnitario": 12.50,
    "quantidadeAtual": 100,
    "localizacao": "Estoque A1"
  }'
```

---

### ✅ Módulo 4: Compras

#### Teste 4.1: Visualizar Modal de Compras
1. Clique em "Compras" no menu
2. Clique em "Nova Compra"
3. **Esperado:**
   - Modal com seções coloridas ✅
   - Campos de Fornecedor ✅
   - Campos de NF (emissão, recebimento) ✅
   - Seção de Itens ✅
   - Despesas Adicionais (frete, outras) ✅
   - Total calculado no footer ✅

#### Teste 4.2: Importar XML (Simular)
1. No modal de compras
2. Clique em "Importar XML"
3. Selecione um arquivo XML de NF-e
4. **Esperado:**
   - Fornecedor preenchido automaticamente ✅
   - Itens adicionados à lista ✅
   - Totais calculados ✅

#### Teste 4.3: Adicionar Itens Manualmente
1. Preencha:
   - Nome: "Material Teste"
   - NCM: "8544.42.00"
   - Quantidade: 10
   - Valor Unitário: 25.00
2. **Esperado:**
   - Valor Total = 250.00 (calculado) ✅
3. Clique em "Adicionar Item"
4. **Esperado:** Item aparece na tabela ✅

#### Teste 4.4: Despesas Adicionais
1. Preencha:
   - Valor de Frete: 50.00
   - Outras Despesas: 20.00
2. **Esperado:**
   - Total Geral = Subtotal + Frete + Outras ✅
3. Salve a compra
4. **Esperado:** Compra salva e estoque atualizado (se integrado) ✅

---

### ✅ Módulo 5: Financeiro

#### Teste 5.1: Acessar Módulo Financeiro
1. Clique em "Financeiro" no menu
2. **Esperado:**
   - 4 cards de resumo no topo ✅
   - Valor correto em cada card ✅
   - 5 abas de navegação ✅

#### Teste 5.2: Aba Vendas
1. Clique na aba "Vendas"
2. **Esperado:**
   - Lista de orçamentos aprovados ✅
   - Valores corretos ✅
   - Status coloridos ✅

#### Teste 5.3: Contas a Receber
1. Clique na aba "Contas a Receber"
2. **Esperado:**
   - Lista de parcelas pendentes ✅
   - Alertas de atraso em vermelho ✅
   - Total a receber calculado ✅

#### Teste 5.4: Contas a Pagar
1. Clique na aba "Contas a Pagar"
2. **Esperado:**
   - Lista de fornecedores a pagar ✅
   - Status visuais ✅

#### Teste 5.5: Faturamento
1. Clique na aba "Faturamento"
2. **Esperado:**
   - Resumo mensal ✅
   - Receitas, Despesas, Lucro ✅
   - Margem % calculada ✅

#### Teste 5.6: Status de Cobranças
1. Clique na aba "Status de Cobranças"
2. **Esperado:**
   - Dashboard visual ✅
   - Cartões por status ✅

---

### ✅ Módulo 6: Emissão de NF-e

#### Teste 6.1: Navegação entre Seções
1. Clique em "Emissão NF-e" no menu
2. **Esperado:**
   - 2 botões de navegação no topo ✅
   - "Emitir NF-e" ativo por padrão ✅
3. Clique em "Configurar Empresas"
4. **Esperado:**
   - Seção muda instantaneamente ✅
   - Botão azul fica ativo ✅

#### Teste 6.2: Adicionar Configuração Fiscal (Mock)
1. Na aba "Configurar Empresas"
2. Clique em "Adicionar Empresa"
3. Preencha **Seção 1 - Dados da Empresa:**
   - CNPJ: 12.345.678/0001-90
   - IE: 123.456.789
   - Razão Social: S3E Engenharia Teste
   - Nome Fantasia: S3E Teste
   - Regime: Simples Nacional

4. Preencha **Seção 2 - Endereço:**
   - Logradouro: Rua Teste
   - Número: 123
   - Bairro: Centro
   - Cidade: Florianópolis
   - Estado: SC
   - CEP: 88000-000

5. Preencha **Seção 3 - Certificado:**
   - Selecione qualquer arquivo .pfx (ou crie um vazio)
   - Senha: senha123

6. Clique em "Salvar Configuração"
7. **Esperado:**
   - Modal fecha ✅
   - Card da empresa aparece ✅
   - CNPJ, IE visíveis ✅
   - Status do certificado mostrado ✅

#### Teste 6.3: Visualizar Card de Empresa
1. **Esperado no card:**
   - Header azul com nome da empresa ✅
   - Grid 2x2 com CNPJ, IE, Regime, Certificado ✅
   - Card de endereço completo ✅
   - Botão "Excluir Configuração" ✅

#### Teste 6.4: Excluir Configuração
1. Clique em "Excluir Configuração"
2. **Esperado:**
   - Confirmação aparece ✅
3. Confirme a exclusão
4. **Esperado:**
   - Card desaparece ✅
   - Volta ao estado vazio ✅

#### Teste 6.5: Wizard de Emissão
1. Vá para aba "Emitir NF-e"
2. **Etapa 1 - Selecionar Projeto:**
   - Selecione um projeto
   - Clique em "Próximo"
3. **Etapa 2 - Dados Fiscais:**
   - Preencha Tipo, Natureza, CFOP
   - Clique em "Próximo"
4. **Etapa 3 - Revisão:**
   - Verifique dados
   - Clique em "Emitir NF-e"
5. **Esperado:**
   - Alert informando integração pendente ✅

---

### ✅ Módulo 7: Configuração Fiscal (API)

#### Teste 7.1: Criar Configuração via API
```bash
# 1. Fazer login e obter token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@s3e.com","password":"senha123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 2. Criar certificado de teste em Base64
echo "teste" > cert-teste.pfx
CERT_BASE64=$(base64 -w 0 cert-teste.pfx)

# 3. Criar configuração
curl -X POST http://localhost:3000/api/configuracoes-fiscais \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"cnpj\": \"12.345.678/0001-90\",
    \"inscricaoEstadual\": \"123.456.789\",
    \"razaoSocial\": \"S3E ENGENHARIA LTDA\",
    \"nomeFantasia\": \"S3E Engenharia\",
    \"endereco\": \"Rua das Flores\",
    \"numero\": \"123\",
    \"bairro\": \"Centro\",
    \"cidade\": \"Florianópolis\",
    \"estado\": \"SC\",
    \"cep\": \"88000-000\",
    \"regimeTributario\": \"SimplesNacional\",
    \"certificadoBase64\": \"$CERT_BASE64\",
    \"certificadoSenha\": \"senha123\"
  }"
```

**Esperado:**
```json
{
  "id": "uuid",
  "cnpj": "12.345.678/0001-90",
  "razaoSocial": "S3E ENGENHARIA LTDA",
  "certificadoValidade": "2026-10-15T..."
}
```

#### Teste 7.2: Listar Configurações
```bash
curl http://localhost:3000/api/configuracoes-fiscais \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Esperado:**
```json
[
  {
    "id": "uuid",
    "cnpj": "12.345.678/0001-90",
    "inscricaoEstadual": "123.456.789",
    "razaoSocial": "S3E ENGENHARIA LTDA",
    "certificadoValidade": "2026-10-15T...",
    "ativo": true
    // Nota: certificadoPath e certificadoSenha NÃO aparecem
  }
]
```

#### Teste 7.3: Verificar Segurança
1. Tente acessar sem token:
```bash
curl http://localhost:3000/api/configuracoes-fiscais
```
**Esperado:** `401 Unauthorized` ✅

2. Tente criar com role não-admin:
```bash
# Fazer login como comprador
TOKEN_COMPRAS=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"compras@s3e.com","password":"senha123"}' \
  | jq -r '.token')

curl -X POST http://localhost:3000/api/configuracoes-fiscais \
  -H "Authorization: Bearer $TOKEN_COMPRAS" \
  -d '{...}'
```
**Esperado:** `403 Forbidden` ✅

---

## 🎨 Testes de UI/UX

### Teste de Responsividade
1. Redimensione o navegador
2. Teste em:
   - Desktop (1920x1080) ✅
   - Laptop (1366x768) ✅
   - Tablet (768x1024) ✅
   - Mobile (375x667) ✅

### Teste de Acessibilidade
1. Navegue usando apenas Tab
2. **Esperado:**
   - Todos os botões acessíveis ✅
   - Ordem lógica de foco ✅
   - Contraste adequado ✅

### Teste de Animações
1. Abra modais
2. **Esperado:**
   - Fade-in suave ✅
   - Zoom-in do conteúdo ✅
   - Backdrop blur ✅

---

## 🔒 Testes de Segurança

### Teste 1: Proteção de Rotas
```bash
# Tentar acessar rota protegida sem token
curl http://localhost:3000/api/configuracoes-fiscais
```
**Esperado:** `401 Unauthorized` ✅

### Teste 2: RBAC
```bash
# Usuário 'compras' tentando criar config fiscal
curl -X POST http://localhost:3000/api/configuracoes-fiscais \
  -H "Authorization: Bearer TOKEN_COMPRAS"
```
**Esperado:** `403 Forbidden` ✅

### Teste 3: Validação de Entrada
```bash
# CNPJ duplicado
curl -X POST http://localhost:3000/api/configuracoes-fiscais \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -d '{"cnpj": "12.345.678/0001-90", ...}'
```
**Esperado:** `400 Bad Request - CNPJ já cadastrado` ✅

### Teste 4: Dados Sensíveis Não Expostos
```bash
curl http://localhost:3000/api/configuracoes-fiscais \
  -H "Authorization: Bearer TOKEN_ADMIN" | jq
```
**Verificar:**
- ❌ `certificadoPath` NÃO aparece
- ❌ `certificadoSenha` NÃO aparece
- ✅ `certificadoValidade` aparece

---

## 📊 Testes de Performance

### Teste 1: Tempo de Carregamento
1. Abra DevTools (F12)
2. Acesse cada página
3. **Esperado:**
   - Catálogo: < 1s ✅
   - Materiais: < 1s ✅
   - Financeiro: < 1.5s ✅
   - Compras: < 1s ✅

### Teste 2: Responsividade de Busca
1. Digite no campo de busca de materiais
2. **Esperado:**
   - Filtro instantâneo (< 100ms) ✅
   - Limite de 30 resultados ✅

---

## 🐛 Testes de Erro

### Teste 1: Erro de Rede
1. Pare o backend
2. Tente salvar algo
3. **Esperado:**
   - Mensagem de erro amigável ✅
   - Sem crash do frontend ✅

### Teste 2: Campos Obrigatórios
1. Tente salvar sem preencher campos obrigatórios
2. **Esperado:**
   - Botão desabilitado ✅
   - Ou mensagem de validação ✅

### Teste 3: Arquivo Inválido
1. Tente fazer upload de arquivo não-.pfx
2. **Esperado:**
   - Validação bloqueia ✅
   - Mensagem clara ✅

---

## ✅ Checklist Final de Validação

### Backend
- [ ] Servidor inicia sem erros
- [ ] Health check responde
- [ ] Login funciona
- [ ] Token JWT gerado
- [ ] Rotas protegidas bloqueiam sem token
- [ ] RBAC funciona (403 para roles não autorizados)
- [ ] Validações bloqueiam dados inválidos
- [ ] Certificado salvo em /data/certificados/
- [ ] Senha criptografada no banco
- [ ] Dados sensíveis não expostos na API

### Frontend
- [ ] Aplicação carrega sem erros
- [ ] Navegação entre páginas funciona
- [ ] Modais abrem e fecham corretamente
- [ ] Formulários validam corretamente
- [ ] Buscas filtram em tempo real
- [ ] Cálculos (totais, margem) corretos
- [ ] Estados vazios mostram mensagens
- [ ] Animações suaves
- [ ] Responsivo em todos os tamanhos
- [ ] Sem erros no console

### Integração (Se Conectado)
- [ ] Login via API funciona
- [ ] Dados salvos persistem
- [ ] Refresh atualiza dados
- [ ] Exclusões removem do banco
- [ ] Upload de arquivo funciona
- [ ] XML importado corretamente
- [ ] Estoque atualizado após compra

---

## 📝 Relatório de Bugs (Template)

Se encontrar bugs, documente assim:

```
## Bug #1: [Título]

**Severidade:** Crítico | Alto | Médio | Baixo
**Módulo:** Catálogo | Materiais | Compras | etc
**Reproduzir:**
1. Passo 1
2. Passo 2
3. Passo 3

**Esperado:**
O que deveria acontecer

**Observado:**
O que realmente aconteceu

**Console:**
Erros no console (se houver)

**Screenshot:**
(anexar se possível)
```

---

## 🎉 Critérios de Sucesso

### ✅ Aprovado se:
- [ ] 100% dos testes funcionais passam
- [ ] Zero erros de compilação
- [ ] Zero erros críticos no console
- [ ] UI responsiva em todos os tamanhos
- [ ] Segurança validada (rotas protegidas)
- [ ] Dados persistem corretamente

### ⚠️ Com ressalvas se:
- [ ] Alguns testes visuais falharam (não-bloqueante)
- [ ] Performance aceitável mas não ideal
- [ ] Pequenos bugs de UX (não afeta funcionalidade)

### ❌ Reprovado se:
- [ ] Erro crítico bloqueia funcionalidade
- [ ] Dados são perdidos
- [ ] Segurança comprometida
- [ ] Crash frequente

---

## 📞 Suporte aos Testes

### Dúvidas Comuns

**P: Backend não inicia**  
R: Verifique se a porta 3000 está livre: `lsof -i :3000`

**P: Frontend não carrega**  
R: Limpe cache: `rm -rf node_modules && npm install`

**P: Token expirado**  
R: Faça login novamente

**P: Certificado não envia**  
R: Verifique se está em Base64 correto

---

## 🔗 Recursos Adicionais

- **Postman Collection:** (a ser criada)
- **Ambiente de Homologação:** (configurar)
- **Dados de Teste:** Disponíveis no mock

---

**Tempo Total de Testes:** ~45 minutos  
**Nível de Cobertura:** ~90%  
**Status:** ✅ Pronto para Testes

---

**Bons Testes!** 🧪🚀

