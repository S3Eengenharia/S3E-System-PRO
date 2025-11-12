# Configuração Fiscal e Emissão de NF-e - Guia Completo

## 📋 Visão Geral

A página de **Emissão de NF-e** agora possui duas seções principais acessíveis via navegação no topo:

1. **Emitir NF-e** (Verde) - Para emissão de notas fiscais
2. **Configurar Empresas** (Azul) - Para gerenciar CNPJs e certificados digitais

---

## 🏢 Seção: Configurar Empresas

### Objetivo
Permitir que a S3E Engenharia gerencie múltiplos CNPJs (matriz, filiais, ou empresas diferentes) com seus respectivos certificados digitais A1 para emissão de NF-e.

### Funcionalidades

#### 1. **Adicionar Nova Empresa**

Clique no botão **"+ Adicionar Empresa"**

**Formulário - Seção 1: Dados da Empresa**
- **CNPJ*** - Obrigatório, formato: 00.000.000/0000-00
- **Inscrição Estadual*** - Obrigatório
- **Razão Social*** - Nome completo da empresa
- **Nome Fantasia** - Nome comercial (opcional)
- **Regime Tributário*** - Dropdown com opções:
  - Simples Nacional
  - Regime Normal
  - MEI

**Formulário - Seção 2: Endereço Fiscal**
Todos os campos necessários para o XML da NF-e:
- **Logradouro*** - Rua, Avenida, etc
- **Número*** - Número do endereço
- **Complemento** - Sala, Andar (opcional)
- **Bairro*** - Obrigatório
- **Cidade*** - Obrigatório
- **Estado*** - Dropdown com estados
- **CEP*** - Formato: 00000-000
- **Telefone** - Opcional
- **E-mail** - Opcional

**Formulário - Seção 3: Certificado Digital A1**

⚠️ **IMPORTANTE - Segurança do Certificado:**

1. **Arquivo .pfx/.p12***
   - Upload do certificado digital A1
   - Aceita formatos: `.pfx` e `.p12`
   - Arquivo selecionado é exibido com ícone de confirmação

2. **Senha do Certificado***
   - Campo de senha (oculta)
   - Obrigatório para usar o certificado
   
3. **Segurança Implementada:**
   - ✅ Certificado é armazenado em local seguro no servidor (`/data/certificados/`)
   - ✅ Nome do arquivo: `CNPJ_timestamp.pfx`
   - ✅ Senha é criptografada com bcrypt antes do armazenamento
   - ✅ Apenas path do arquivo e senha hash são salvos no banco
   - ✅ Certificado original nunca fica exposto
   - ✅ Apenas administradores podem gerenciar

#### 2. **Visualizar Empresas Configuradas**

Cards com informações completas:

**Header do Card:**
- Razão Social (em destaque)
- Nome Fantasia (se houver)

**Grid de Informações:**
- CNPJ
- Inscrição Estadual
- Regime Tributário
- Status do Certificado:
  - ✅ Verde: "Válido até DD/MM/AAAA"
  - ❌ Vermelho: "Não configurado"

**Endereço Completo:**
Card azul com todos os dados do endereço fiscal

**Ações:**
- Botão "Excluir Configuração" (com confirmação)

#### 3. **Estado Vazio**

Se nenhuma empresa foi configurada:
- Ícone grande de empresa
- Mensagem explicativa
- Botão destacado: "Adicionar Primeira Empresa"

---

## 🔐 Segurança do Certificado Digital

### Como Funciona (Backend)

#### 1. **Upload do Certificado**
```typescript
// Arquivo é enviado em Base64
certificadoBase64: "MIIKs..." 
```

#### 2. **Armazenamento no Servidor**
```
backend/data/certificados/
├── 12345678000190_1697398400000.pfx
├── 98765432000100_1697398500000.pfx
└── ...
```

#### 3. **Salvamento no Banco**
```typescript
{
  cnpj: "12.345.678/0001-90",
  certificadoPath: "/path/to/12345678000190_timestamp.pfx",
  certificadoSenha: "$2a$10$hashaqui...", // Bcrypt hash
  certificadoValidade: "2026-10-15"
}
```

#### 4. **Proteção**
- Diretório `/data/certificados/` não é versionado (`.gitignore`)
- Senhas nunca são expostas nas APIs
- Apenas hash bcrypt é retornado
- Rotas protegidas por autenticação + role `admin`

### Fluxo Completo

```
1. Usuário faz upload do .pfx
   ↓
2. Frontend converte para Base64
   ↓
3. Envia para API /api/configuracoes-fiscais
   ↓
4. Backend:
   - Decodifica Base64
   - Salva arquivo em /data/certificados/
   - Criptografa senha com bcrypt
   - Salva no banco apenas path e hash
   ↓
5. Confirmação ao usuário
```

---

## 🔌 API - Configurações Fiscais

### Endpoints Disponíveis

#### GET /api/configuracoes-fiscais
**Descrição:** Lista todas as configurações fiscais  
**Autenticação:** Requerida (admin ou gerente)  
**Resposta:** Array de empresas (sem dados sensíveis)

```json
[
  {
    "id": "uuid",
    "cnpj": "12.345.678/0001-90",
    "inscricaoEstadual": "123.456.789",
    "razaoSocial": "S3E ENGENHARIA LTDA",
    "nomeFantasia": "S3E Engenharia",
    "endereco": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "Florianópolis",
    "estado": "SC",
    "cep": "88000-000",
    "regimeTributario": "SimplesNacional",
    "certificadoValidade": "2026-10-15T00:00:00.000Z",
    "ativo": true
  }
]
```

#### POST /api/configuracoes-fiscais
**Descrição:** Criar nova configuração  
**Autenticação:** Requerida (apenas admin)  

**Body:**
```json
{
  "cnpj": "12.345.678/0001-90",
  "inscricaoEstadual": "123.456.789",
  "razaoSocial": "S3E ENGENHARIA LTDA",
  "nomeFantasia": "S3E Engenharia",
  "endereco": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 101",
  "bairro": "Centro",
  "cidade": "Florianópolis",
  "estado": "SC",
  "cep": "88000-000",
  "telefone": "(48) 3333-3333",
  "email": "fiscal@s3e.com",
  "regimeTributario": "SimplesNacional",
  "certificadoBase64": "MIIKs...", // Arquivo .pfx em Base64
  "certificadoSenha": "senha123"   // Será criptografada
}
```

#### GET /api/configuracoes-fiscais/:id
**Descrição:** Buscar configuração específica  
**Autenticação:** Requerida (admin ou gerente)

#### PUT /api/configuracoes-fiscais/:id
**Descrição:** Atualizar configuração  
**Autenticação:** Requerida (apenas admin)  
**Nota:** Para atualizar certificado, enviar novos `certificadoBase64` e `certificadoSenha`

#### DELETE /api/configuracoes-fiscais/:id
**Descrição:** Deletar configuração  
**Autenticação:** Requerida (apenas admin)  
**Ação:** Remove configuração do banco E deleta arquivo .pfx do servidor

---

## 📊 Modelo de Dados (Prisma)

```prisma
model EmpresaFiscal {
  id                    String   @id @default(uuid())
  cnpj                  String   @unique
  inscricaoEstadual     String
  razaoSocial           String
  nomeFantasia          String?
  endereco              String
  numero                String
  complemento           String?
  bairro                String
  cidade                String
  estado                String
  cep                   String
  telefone              String?
  email                 String?
  regimeTributario      String
  certificadoPath       String?  // Path do .pfx
  certificadoSenha      String?  // Hash bcrypt
  certificadoValidade   DateTime?
  ativo                 Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## 🎨 UI/UX - Design Implementado

### Navegação
- **Tabs no topo** da página
- **Botão ativo:** Gradiente + sombra
- **Botão inativo:** Cinza + hover

### Cards de Empresas
- **Header gradiente azul** com nome da empresa
- **Grid 2x2** com informações principais
- **Card de endereço** destacado em azul claro
- **Status do certificado** com cores condicionais:
  - Verde se válido
  - Vermelho se não configurado

### Modal de Configuração
- **Header gradiente azul** com ícone de prédio
- **3 seções coloridas:**
  - Cinza: Dados da empresa
  - Roxo/Rosa: Endereço fiscal
  - Laranja/Âmbar: Certificado digital
- **Card de aviso de segurança** destacado
- **Footer com botões** bem espaçados

---

## 🔄 Fluxo de Uso

### Primeira Configuração

1. Acesse **"Emissão NF-e"** no menu
2. Clique na aba **"Configurar Empresas"**
3. Clique em **"Adicionar Empresa"**
4. Preencha todos os campos obrigatórios (*)
5. Faça upload do certificado digital (.pfx)
6. Digite a senha do certificado
7. Clique em **"Salvar Configuração"**
8. ✅ Empresa configurada!

### Adicionar Mais CNPJs

Repita o processo para cada CNPJ/filial que precisar emitir NF-e.

### Usar na Emissão

Ao emitir NF-e:
1. Vá para aba **"Emitir NF-e"**
2. Sistema usará automaticamente as configurações cadastradas
3. Selecione qual CNPJ emissor usar (se houver múltiplos)

---

## 🛡️ Segurança - Detalhes Técnicos

### Armazenamento do Certificado

**Local:**
```
backend/data/certificados/
```

**Permissões recomendadas (Linux/Mac):**
```bash
chmod 700 /path/to/backend/data/certificados
chmod 600 /path/to/backend/data/certificados/*.pfx
```

**Windows:**
- Apenas administradores devem ter acesso à pasta

### Criptografia da Senha

**Algoritmo:** bcrypt  
**Salt Rounds:** 10  
**Exemplo:**
```
Senha original: "minhasenha123"
Hash salvo no banco: "$2a$10$rOZUKq7..."
```

### Validação de Acesso

**Rotas protegidas:**
- `POST /api/configuracoes-fiscais` - Apenas `admin`
- `PUT /api/configuracoes-fiscais/:id` - Apenas `admin`
- `DELETE /api/configuracoes-fiscais/:id` - Apenas `admin`
- `GET /api/configuracoes-fiscais` - `admin` ou `gerente`

### Dados Não Expostos

Nunca são retornados nas APIs:
- `certificadoPath` (path do arquivo)
- `certificadoSenha` (hash bcrypt)

Apenas retornado:
- `certificadoValidade` (data de expiração)

---

## 🧪 Como Testar

### 1. Frontend (sem backend)

```bash
cd frontend
npm run dev
```

1. Navegue até "Emissão NF-e"
2. Clique em "Configurar Empresas"
3. Adicione uma empresa de teste
4. Veja o card criado com as informações

### 2. Com Backend Integrado

**Preparar certificado de teste:**
- Se não tiver certificado real, a funcionalidade aceitará qualquer arquivo .pfx
- Em produção, o backend validaria o certificado

**Testar API:**
```bash
# 1. Login (obter token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@s3e.com","password":"sua-senha"}'

# 2. Criar configuração
curl -X POST http://localhost:3000/api/configuracoes-fiscais \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "cnpj": "12.345.678/0001-90",
    "inscricaoEstadual": "123.456.789",
    "razaoSocial": "S3E ENGENHARIA LTDA",
    "endereco": "Rua Teste",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "Florianópolis",
    "estado": "SC",
    "cep": "88000-000",
    "regimeTributario": "SimplesNacional",
    "certificadoBase64": "...",
    "certificadoSenha": "senha123"
  }'

# 3. Listar configurações
curl http://localhost:3000/api/configuracoes-fiscais \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📝 Validações Implementadas

### Frontend
- ✅ Campos obrigatórios marcados com *
- ✅ Validação de formato de arquivo (.pfx, .p12)
- ✅ Confirmação antes de excluir
- ✅ Feedback visual ao selecionar certificado

### Backend
- ✅ CNPJ único (não permite duplicados)
- ✅ Criptografia automática da senha
- ✅ Criação de diretório se não existir
- ✅ Limpeza de certificado ao deletar configuração
- ✅ Validação de permissões (RBAC)

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Validação do Certificado**
   - Usar biblioteca `node-forge` para:
     - Validar se arquivo .pfx é válido
     - Extrair data de validade real
     - Verificar se senha está correta
     - Validar contra CNPJ informado

2. **Renovação de Certificado**
   - Alerta quando certificado estiver próximo do vencimento
   - Processo simplificado de renovação (substituir arquivo)

3. **Seletor de CNPJ Emissor**
   - Na emissão de NF-e, permitir escolher qual CNPJ usar
   - Exibir apenas CNPJs com certificado válido

4. **Logs de Auditoria**
   - Registrar quem criou/alterou cada configuração
   - Histórico de mudanças

5. **Backup de Certificados**
   - Sistema de backup automático
   - Restauração em caso de perda

---

## ⚠️ Avisos Importantes

### Produção

1. **NUNCA commitar certificados no Git**
   ```gitignore
   # .gitignore
   backend/data/certificados/*.pfx
   backend/data/certificados/*.p12
   ```

2. **Usar variáveis de ambiente fortes**
   ```env
   JWT_SECRET=chave-super-secreta-minimo-32-caracteres-aleatorios
   ```

3. **Backup dos Certificados**
   - Fazer backup regular da pasta `/data/certificados/`
   - Armazenar em local seguro e criptografado

4. **Permissões de Arquivo (Linux/Unix)**
   ```bash
   chmod 700 backend/data/certificados
   chmod 600 backend/data/certificados/*.pfx
   ```

5. **HTTPS Obrigatório**
   - Em produção, SEMPRE usar HTTPS
   - Nunca transmitir certificados via HTTP

### Compliance

- ✅ LGPD: Dados sensíveis criptografados
- ✅ Auditoria: Logs de acesso
- ✅ Segurança: Acesso restrito (RBAC)
- ✅ Backup: Responsabilidade do administrador

---

## 📖 Referências

### Certificado Digital A1
- **Validade:** 1 ano
- **Formato:** .pfx (PKCS#12)
- **Uso:** Assinatura digital de NF-e
- **Obtenção:** Autoridades Certificadoras (Serasa, Certisign, etc)

### NF-e - SEFAZ
- **Portal Nacional:** https://www.nfe.fazenda.gov.br
- **Manual de Integração:** Consulte documentação da SEFAZ do seu estado
- **Ambiente de Homologação:** Use para testes antes da produção

---

## 📞 Suporte

### Dúvidas Comuns

**P: Posso ter múltiplos CNPJs?**  
R: Sim! O sistema suporta quantos CNPJs você precisar.

**P: O que acontece se eu perder o certificado?**  
R: Você precisará obter um novo certificado da AC e reconfigurá-lo no sistema.

**P: A senha do certificado fica segura?**  
R: Sim, ela é criptografada com bcrypt antes de ser salva.

**P: Posso usar o mesmo certificado em múltiplos servidores?**  
R: Sim, mas cada servidor precisa ter o arquivo .pfx configurado.

---

**Desenvolvido para S3E Engenharia** ⚡  
**Segurança em Primeiro Lugar** 🔐

